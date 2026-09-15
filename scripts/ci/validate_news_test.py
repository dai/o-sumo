import importlib.util
from datetime import datetime, timedelta, timezone
import json
import os
import pathlib
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("validate_news", pathlib.Path(__file__).with_name("validate_news.py"))
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)

FRESH_TIMESTAMP = datetime.now(timezone.utc).isoformat()
STALE_TIMESTAMP = (datetime.now(timezone.utc) - timedelta(hours=MODULE.DEFAULT_MAX_AGE_HOURS + 5)).isoformat()


def write_payload(folder, value):
    path = pathlib.Path(folder) / "news.json"
    path.write_text(json.dumps(value), encoding="utf-8")
    return str(path)


def fresh_payload(streak=0):
    return {
        "updatedAt": FRESH_TIMESTAMP,
        "sources": [{"id": "sumo-association", "ok": True, "count": 1}],
        "items": [],
        "lastFailureStreak": streak,
    }


class ValidateNewsTest(unittest.TestCase):
    def run_payload(self, value):
        with tempfile.TemporaryDirectory() as folder:
            path = write_payload(folder, value)
            return MODULE.main(path)

    def test_accepts_fresh_payload_with_zero_streak(self):
        self.assertEqual(self.run_payload(fresh_payload()), 0)

    def test_rejects_missing_file(self):
        self.assertEqual(MODULE.main(pathlib.Path(tempfile.gettempdir()) / "does-not-exist.json"), 1)

    def test_rejects_invalid_json(self):
        with tempfile.TemporaryDirectory() as folder:
            path = pathlib.Path(folder) / "news.json"
            path.write_text("{not valid", encoding="utf-8")
            self.assertEqual(MODULE.main(str(path)), 1)

    def test_rejects_missing_keys(self):
        self.assertEqual(self.run_payload({"updatedAt": FRESH_TIMESTAMP}), 1)

    def test_rejects_empty_sources(self):
        payload = fresh_payload()
        payload["sources"] = []
        self.assertEqual(self.run_payload(payload), 1)

    def test_rejects_all_sources_failed(self):
        payload = fresh_payload()
        payload["sources"] = [{"id": "sumo-association", "ok": False}]
        self.assertEqual(self.run_payload(payload), 1)

    def test_rejects_stale_updated_at(self):
        payload = fresh_payload()
        payload["updatedAt"] = STALE_TIMESTAMP
        self.assertEqual(self.run_payload(payload), 1)

    def test_rejects_invalid_iso_timestamp(self):
        payload = fresh_payload()
        payload["updatedAt"] = "not-a-date"
        self.assertEqual(self.run_payload(payload), 1)

    def test_rejects_streak_at_threshold(self):
        self.assertEqual(self.run_payload(fresh_payload(streak=MODULE.DEFAULT_MAX_FAILURE_STREAK)), 1)

    def test_rejects_streak_above_threshold(self):
        self.assertEqual(self.run_payload(fresh_payload(streak=MODULE.DEFAULT_MAX_FAILURE_STREAK + 1)), 1)

    def test_warns_but_passes_for_streak_below_threshold(self):
        self.assertEqual(self.run_payload(fresh_payload(streak=1)), 0)
        self.assertEqual(self.run_payload(fresh_payload(streak=MODULE.DEFAULT_MAX_FAILURE_STREAK - 1)), 0)

    def test_rejects_negative_streak(self):
        self.assertEqual(self.run_payload(fresh_payload(streak=-1)), 1)

    def test_env_overrides_lower_streak_threshold(self):
        with tempfile.TemporaryDirectory() as folder:
            path = write_payload(folder, fresh_payload(streak=2))
            self.assertEqual(MODULE.main(path), 0)
            os.environ["NEWS_MAX_FAILURE_STREAK"] = "2"
            try:
                self.assertEqual(MODULE.main(path), 1)
            finally:
                os.environ.pop("NEWS_MAX_FAILURE_STREAK", None)


if __name__ == "__main__":
    unittest.main()
