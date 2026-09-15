"""Real Git regression tests for bounded data publication."""
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

try:
    from .data_publish import PublishError, publish
except ImportError:
    from data_publish import PublishError, publish


def git(path, *args):
    result = subprocess.run(["git", "-C", str(path), *args], check=True,
                            capture_output=True, text=True, encoding="utf-8")
    return result.stdout.strip()


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="data-publish-test-")
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.remote = root / "remote.git"
        self.repo = root / "repo"
        self.other = root / "other"
        git(root, "init", "--bare", str(self.remote))
        git(root, "clone", str(self.remote), str(self.repo))
        git(self.repo, "checkout", "-b", "main")
        for key, value in [("user.name", "Test"), ("user.email", "test@example.com")]:
            git(self.repo, "config", key, value)
        (self.repo / "data.json").write_text(json.dumps({"result": 0, "schedule": 0, "news": 0}))
        (self.repo / "source.txt").write_text("keep")
        git(self.repo, "add", ".")
        git(self.repo, "commit", "-m", "initial")
        git(self.repo, "push", "origin", "main")
        git(root, "clone", "--branch", "main", str(self.remote), str(self.other))
        for key, value in [("user.name", "Other"), ("user.email", "other@example.com")]:
            git(self.other, "config", key, value)
        self.initial = self.head()

    def head(self, branch="main"):
        return git(self.remote, "rev-parse", f"refs/heads/{branch}")

    def data(self):
        return json.loads(git(self.remote, "show", "main:data.json"))

    def advance(self, field="schedule", value=1):
        git(self.other, "pull", "--ff-only", "origin", "main")
        data = json.loads((self.other / "data.json").read_text())
        data[field] = value
        (self.other / "data.json").write_text(json.dumps(data))
        git(self.other, "add", "data.json")
        git(self.other, "commit", "-m", "concurrent change")
        git(self.other, "push", "origin", "main")

    def generate(self, checkout):
        data = json.loads((checkout / "data.json").read_text())
        data["result"] = 1
        (checkout / "data.json").write_text(json.dumps(data))

    def run_publish(self, **kwargs):
        args = dict(generate=self.generate, validate=lambda p: json.loads((p / "data.json").read_text()),
                    allowed_paths=["data.json"], message="generated update")
        args.update(kwargs)
        return publish(self.repo, **args)

    def test_publish_and_noop_preserve_callers_dirty_worktree(self):
        (self.repo / "source.txt").write_text("local work")
        result = self.run_publish()
        self.assertTrue(result.changed)
        self.assertEqual(result.attempts, 1)
        self.assertEqual(result.commit_sha, self.head())
        self.assertEqual((self.repo / "source.txt").read_text(), "local work")
        self.assertEqual(git(self.repo, "rev-parse", "HEAD"), self.initial)
        second = self.run_publish()
        self.assertFalse(second.changed)
        self.assertEqual(second.commit_sha, result.commit_sha)
        self.assertEqual(git(self.repo, "worktree", "list", "--porcelain").count("worktree "), 1)

    def test_regenerate_preserves_concurrent_schedule_and_news(self):
        calls = []
        def generate(checkout):
            calls.append(checkout)
            self.generate(checkout)
            if len(calls) == 1:
                self.advance("schedule", 2)
                self.advance("news", 3)
        result = self.run_publish(generate=generate)
        self.assertEqual(result.attempts, 2)
        self.assertEqual(self.data(), {"result": 1, "schedule": 2, "news": 3})
        self.assertEqual(len(calls), 2)

    def test_advance_during_validation_revalidates(self):
        calls = []
        def validate(checkout):
            calls.append(checkout)
            if len(calls) == 1:
                self.advance()
        self.assertEqual(self.run_publish(validate=validate).attempts, 2)
        self.assertEqual(len(calls), 2)
        self.assertEqual(self.data()["schedule"], 1)

    def test_continuous_advance_stops_after_three_attempts(self):
        calls = []
        def validate(checkout):
            calls.append(checkout)
            self.advance("schedule", len(calls))
        with self.assertRaisesRegex(PublishError, "exhausted 3"):
            self.run_publish(validate=validate)
        self.assertEqual(len(calls), 3)
        self.assertEqual(self.data()["result"], 0)

    def test_refuse_tracked_untracked_and_staged_outside_allowlist(self):
        for filename, stage in [("source.txt", False), ("unexpected.txt", False), ("source.txt", True)]:
            with self.subTest(filename=filename, stage=stage):
                def generate(checkout):
                    self.generate(checkout)
                    (checkout / filename).write_text("unexpected")
                    if stage:
                        git(checkout, "add", filename)
                with self.assertRaisesRegex(PublishError, "outside allowed_paths"):
                    self.run_publish(generate=generate)
                self.assertEqual(self.head(), self.initial)

    def test_callback_failures_leave_remote_and_worktrees_unchanged(self):
        def fail(checkout):
            self.generate(checkout)
            raise ValueError("invalid generated data")
        for callback in ["generate", "validate"]:
            with self.subTest(callback=callback):
                with self.assertRaisesRegex(ValueError, "invalid generated data"):
                    self.run_publish(**{callback: fail})
                self.assertEqual(self.head(), self.initial)
                self.assertEqual(git(self.repo, "worktree", "list", "--porcelain").count("worktree "), 1)

    def test_noop_race_retries_on_fresh_main(self):
        calls = []
        def generate(checkout):
            calls.append(checkout)
            if len(calls) == 1:
                self.advance()
        result = self.run_publish(generate=generate)
        self.assertFalse(result.changed)
        self.assertEqual(result.attempts, 2)
        self.assertEqual(result.commit_sha, self.head())

    def test_bootstrap_and_repeat_state_branch_preserve_repository(self):
        def generate(checkout):
            state = checkout / "news-state.json"
            previous = json.loads(state.read_text()) if state.exists() else {"sent": 0}
            state.write_text(json.dumps({"sent": previous["sent"] + 1}))
        options = dict(generate=generate, validate=lambda p: None,
                       allowed_paths=["news-state.json"], branch="automation/news-state", bootstrap=True)
        first = self.run_publish(**options)
        second = self.run_publish(**options)
        self.assertEqual(git(self.remote, "rev-parse", "automation/news-state^"), first.commit_sha)
        self.assertEqual(second.commit_sha, self.head("automation/news-state"))
        self.assertEqual(json.loads(git(self.remote, "show", "automation/news-state:news-state.json")), {"sent": 2})
        self.assertEqual(git(self.remote, "show", "automation/news-state:source.txt"), "keep")
        self.assertEqual(self.head(), self.initial)

    def test_invalid_configuration(self):
        for kwargs in [{"branch": "mian"}, {"bootstrap": True}, {"max_attempts": 4},
                       {"allowed_paths": ["../secret"]}, {"allowed_paths": [".git/config"]}]:
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.run_publish(**kwargs)


if __name__ == "__main__":
    unittest.main()
