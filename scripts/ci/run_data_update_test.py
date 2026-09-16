"""Exercise news orchestration with elapsed acquisition time and no network."""
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from scripts.ci import run_data_update as M
from scripts.ci.data_publish import PublishResult
from scripts.ci.news_state import initialize, validate_state


class NewsOrchestrationTest(unittest.TestCase):
    def exercise(self, *, retries=1, failed=False, existing=False, event_schedule="5 10 * * *", stale_public=False):
        start = datetime(2026, 9, 16, 10, 5, tzinfo=timezone.utc)
        clock = [start]
        baseline = {"updatedAt": (start - timedelta(hours=26 if stale_public else 2)).isoformat(),
                    "sources": [{"id": "test", "ok": True}], "items": []}
        states = []
        published = []
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public = root / "public/api/v1/news.json"
            public.parent.mkdir(parents=True)
            public.write_text(json.dumps(baseline), encoding="utf-8")
            state_path = root / "automation/news-state.json"
            state_path.parent.mkdir()
            initial = initialize(baseline, start) if existing else None

            def run(path, *args):
                if "scripts/update_news_feed.py" in args:
                    clock[0] += timedelta(seconds=3)
                    if failed:
                        raise subprocess.CalledProcessError(1, args)
                    candidate = {**baseline, "updatedAt": clock[0].isoformat()}
                    (path / ".news-candidate.json").write_text(json.dumps(candidate), encoding="utf-8")
                    clock[0] += timedelta(seconds=1)
                elif "validate_news.py" in args:
                    raise AssertionError("stale public payload was validated during a non-final poll")
                else:
                    validate_state(json.loads(state_path.read_text(encoding="utf-8")))

            def publish(repository, *, generate, validate, branch, **kwargs):
                if kwargs.get("bootstrap"):
                    for _ in range(retries):
                        # Each retry starts from the unchanged remote baseline.
                        if initial is None:
                            state_path.unlink(missing_ok=True)
                        else:
                            state_path.write_text(json.dumps(initial), encoding="utf-8")
                        generate(root)
                        validate(root)
                        state = json.loads(state_path.read_text(encoding="utf-8"))
                        states.append(state)
                        self.assertEqual(state["lastAttemptAt"], clock[0].isoformat())
                        self.assertFalse((root / ".news-candidate.json").exists())
                else:
                    generate(root)
                    if branch == "main":
                        published.append(json.loads(public.read_text(encoding="utf-8")))
                    else:
                        validate(root)
                return PublishResult(True, "a" * 40, retries)

            with patch.object(M, "ROOT", root), \
                 patch.object(M, "datetime") as mocked_datetime, \
                 patch.object(M, "run", side_effect=run), \
                 patch.object(M, "publish", side_effect=publish), \
                 patch.object(M.subprocess, "run"), \
                 patch.object(M.subprocess, "check_output", side_effect=lambda *a, **k: state_path.read_text(encoding="utf-8")), \
                 patch.dict(M.os.environ, {"GITHUB_RUN_ID": "100", "GITHUB_EVENT_NAME": "schedule"}, clear=True), \
                 patch.object(M.sys, "argv", ["run_data_update", "--scope", "news", "--event-schedule", event_schedule]):
                mocked_datetime.now.side_effect = lambda tz: clock[0]
                self.assertEqual(M.main(), 0)
            self.assertEqual(states[-1]["consecutiveFailures"], int(failed))
            if event_schedule == "5 10 * * *":
                self.assertEqual(published[-1]["updatedAt"], states[-1]["lastSuccessAt"])
            else:
                self.assertEqual(published[-1]["updatedAt"], baseline["updatedAt"])
            if not failed and event_schedule == "5 10 * * *":
                self.assertGreater(published[-1]["updatedAt"], baseline["updatedAt"])
            expected_sha = "a" * 40 if event_schedule == "5 10 * * *" else None
            self.assertEqual(json.loads(state_path.read_text(encoding="utf-8"))["lastPublishedSha"], expected_sha)

    def test_slow_acquisition_bootstraps_and_publishes_at_final_slot(self):
        self.exercise()

    def test_retry_records_each_acquisition_completion(self):
        self.exercise(retries=2, existing=True)

    def test_failed_acquisition_records_completion_and_keeps_latest_good(self):
        self.exercise(failed=True, existing=True)

    def test_non_final_poll_keeps_stale_public_payload_without_validating_it(self):
        self.exercise(event_schedule="5 0,2,4,6,8 * * *", stale_public=True)


if __name__ == "__main__":
    unittest.main()
