import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

try:
    from . import check_data_delivery as delivery
except ImportError:
    import check_data_delivery as delivery


SHA = "a" * 40


def record(name, **overrides):
    return dict({"name": name, "head_sha": SHA, "event": "push", "id": 1,
                 "status": "completed", "conclusion": "success",
                 "started_at": "2026-09-15T00:00:00Z"}, **overrides)


class DeliveryTests(unittest.TestCase):
    def run_monitor(self, pages=None, ci=None, error=False):
        elapsed = [0]
        calls = []

        def reader(endpoint, timeout):
            calls.append(endpoint)
            self.assertGreater(timeout, 0)
            if error:
                raise subprocess.CalledProcessError(1, "gh", stderr="SECRET")
            return pages if "/check-runs?" in endpoint else ci

        def sleep(seconds):
            elapsed[0] += seconds

        result = delivery.monitor("owner/repo", SHA, 5, 2, reader=reader,
                                  clock=lambda: elapsed[0], sleep=sleep)
        return result, elapsed[0], calls

    def test_success_requires_both_exact_commit_checks(self):
        result, elapsed, calls = self.run_monitor(
            [record("Cloudflare Pages: o-sumo")], [record("Test")])
        self.assertEqual(result["overall"], "success")
        self.assertEqual(result["sha"], SHA)
        self.assertEqual(elapsed, 0)
        self.assertEqual(len(calls), 2)
        self.assertIn("event=push", calls[1])

    def test_previous_sha_blog_and_non_push_do_not_count(self):
        result, elapsed, _ = self.run_monitor(
            [record("Cloudflare Pages: o-sumo", head_sha="b" * 40),
             record("Cloudflare Pages: blog")],
            [record("Test", head_sha="b" * 40), record("Test", event="pull_request")])
        self.assertEqual(result["overall"], "timeout")
        self.assertEqual(result["pages"]["status"], "missing")
        self.assertEqual(result["ci"]["status"], "missing")
        self.assertEqual(elapsed, 5)

    def test_missing_checks_timeout_is_bounded(self):
        result, elapsed, calls = self.run_monitor([], [])
        self.assertEqual(result["overall"], "timeout")
        self.assertEqual(elapsed, 5)
        self.assertEqual(len(calls), 6)

    def test_completed_failures_are_terminal(self):
        for conclusion in ("failure", "cancelled", "timed_out", "skipped", "neutral"):
            with self.subTest(conclusion=conclusion):
                result, elapsed, _ = self.run_monitor(
                    [record("Cloudflare Pages: o-sumo")],
                    [record("Test", conclusion=conclusion)])
                self.assertEqual(result["overall"], "failure")
                self.assertEqual(elapsed, 0)

    def test_queued_rerun_hides_earlier_success(self):
        result, _, _ = self.run_monitor(
            [record("Cloudflare Pages: o-sumo"),
             record("Cloudflare Pages: o-sumo", id=2, started_at=None,
                    created_at="2026-09-15T00:01:00Z", status="queued", conclusion=None)],
            [record("Test")])
        self.assertEqual(result["overall"], "timeout")
        self.assertEqual(result["pages"]["status"], "pending")
        self.assertEqual(result["pages"]["id"], 2)

    def test_latest_failure_hides_earlier_success(self):
        result, _, _ = self.run_monitor([record("Cloudflare Pages: o-sumo")],
                                      [record("Test"), record("Test", id=2, conclusion="failure")])
        self.assertEqual(result["overall"], "failure")

    def test_api_errors_timeout_without_leaking_details(self):
        result, elapsed, _ = self.run_monitor(error=True)
        self.assertEqual(result["overall"], "timeout")
        self.assertEqual(result["pages"]["status"], "unavailable")
        self.assertEqual(elapsed, 5)
        self.assertNotIn("SECRET", json.dumps(result))

    def test_pending_can_become_success(self):
        count = [0]

        def reader(endpoint, timeout):
            count[0] += 1
            if count[0] <= 2:
                return []
            return [record("Cloudflare Pages: o-sumo" if "/check-runs?" in endpoint else "Test")]

        with patch.object(delivery.time, "sleep"):
            result = delivery.monitor("owner/repo", SHA, reader=reader, sleep=lambda _: None)
        self.assertEqual(result["overall"], "success")
        self.assertEqual(count[0], 4)

    def test_emission_includes_machine_and_step_outputs(self):
        result, _, _ = self.run_monitor([], [])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": str(root / "summary"),
                                         "GITHUB_OUTPUT": str(root / "output")}):
                with contextlib.redirect_stdout(io.StringIO()) as stdout:
                    delivery.emit(result, root / "result.json")
            self.assertEqual(json.loads(stdout.getvalue()), result)
            self.assertEqual(json.loads((root / "result.json").read_text()), result)
            self.assertIn(SHA, (root / "summary").read_text())
            self.assertIn("status=timeout", (root / "output").read_text())

    def test_reader_is_read_only_and_collects_pages(self):
        with patch.object(delivery.subprocess, "run") as run:
            run.return_value.stdout = json.dumps([{"check_runs": [{"id": 1}]},
                                                 {"check_runs": [{"id": 2}]}])
            self.assertEqual(delivery.github_reader("repos/x/y/commits/z/check-runs?filter=all", 7),
                             [{"id": 1}, {"id": 2}])
            self.assertEqual(run.call_args.args[0][0:5], ["gh", "api", "--method", "GET", "--paginate"])
            self.assertEqual(run.call_args.kwargs["timeout"], 7)


if __name__ == "__main__":
    unittest.main()
