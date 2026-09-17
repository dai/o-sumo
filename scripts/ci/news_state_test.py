import copy
from datetime import datetime, timedelta, timezone
import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location("news_state", Path(__file__).with_name("news_state.py"))
M = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(M)
BASE = datetime(2026, 9, 14, 8, tzinfo=timezone.utc)


def payload(at=BASE):
    return {"updatedAt": at.isoformat(), "sources": [{"id": "test", "ok": True, "count": 1}], "items": [{"id": "1", "title": "News", "url": "https://example.com/1", "sourceId": "test", "publishedAt": "2026-09-14"}], "lastFailureStreak": 0}


class NewsStateTest(unittest.TestCase):
    def setUp(self):
        self.main = payload()
        self.state = M.initialize(self.main, BASE)

    def test_failures_survive_day_crossing_without_changing_main_or_freshness(self):
        state = self.state
        for i in range(1, 4):
            state = M.record_attempt(state, None, str(i), BASE + timedelta(hours=i * 12))
        self.assertEqual(state["consecutiveFailures"], 3)
        self.assertEqual(state["latestGood"], self.main)
        self.assertEqual(state["lastSuccessAt"], self.main["updatedAt"])
        self.assertEqual(self.main, payload())
        self.assertFalse(M.select_publication(state, "schedule", M.FINAL_SCHEDULE, BASE + timedelta(hours=36)))

    def test_failure_threshold_blocks_even_when_fresh(self):
        state = self.state
        for i in range(1, 4):
            state = M.record_attempt(state, None, str(i), BASE + timedelta(minutes=i))
        self.assertFalse(M.select_publication(state, "schedule", M.FINAL_SCHEDULE, BASE + timedelta(hours=2)))

    def test_duplicate_run_retry_is_terminal_and_does_not_double_count(self):
        state = M.record_attempt(self.state, None, "10", BASE + timedelta(hours=1))
        self.assertEqual(M.record_attempt(state, payload(BASE + timedelta(hours=2)), "10", BASE + timedelta(hours=2)), state)
        self.assertEqual(M.record_attempt(state, None, "10", BASE + timedelta(days=1)), state)

    def test_older_runs_and_attempts_cannot_replace_newer_results(self):
        now = BASE + timedelta(hours=2)
        state = M.record_attempt(self.state, payload(now), "20", now)
        self.assertEqual(M.record_attempt(state, None, "19", now + timedelta(hours=1)), state)
        self.assertEqual(M.record_attempt(state, None, "21", BASE), state)

    def test_healthy_acquisition_resets_failures_and_real_timestamp(self):
        state = M.record_attempt(self.state, None, "1", BASE + timedelta(hours=1))
        now = BASE + timedelta(days=2)
        state = M.record_attempt(state, payload(now), "2", now)
        self.assertEqual(state["consecutiveFailures"], 0)
        self.assertEqual(state["lastSuccessAt"], now.isoformat())

    def test_recognizes_all_source_failure_payload(self):
        candidate = payload(BASE + timedelta(hours=1))
        candidate["sources"][0]["ok"] = False
        candidate["items"] = []
        state = M.record_attempt(self.state, candidate, "1", BASE + timedelta(hours=1))
        self.assertEqual(state["consecutiveFailures"], 1)
        self.assertEqual(state["latestGood"], self.main)

    def test_final_slot_is_allowed_when_delayed_past_midnight(self):
        for hours in (2, 4, 8):
            now = BASE + timedelta(hours=hours)
            self.assertTrue(M.select_publication(self.state, "schedule", M.FINAL_SCHEDULE, now))
            self.assertEqual(M.publication_date(self.state), "2026-09-14")
        self.assertFalse(M.select_publication(self.state, "schedule", "5 0,2,4,6,8 * * *", BASE + timedelta(hours=4)))

    def test_manual_day_and_evening(self):
        self.assertFalse(M.select_publication(self.state, "workflow_dispatch", "", BASE))
        self.assertTrue(M.select_publication(self.state, "workflow_dispatch", "", BASE + timedelta(hours=2)))
        self.assertFalse(M.select_publication(self.state, "push", "", BASE + timedelta(hours=2)))

    def test_stale_future_and_exact_age_boundary_are_ineligible(self):
        for delta in (timedelta(days=1), timedelta(seconds=-1)):
            self.assertFalse(M.select_publication(self.state, "schedule", M.FINAL_SCHEDULE, BASE + delta))
        M.initialize(payload(BASE - timedelta(days=10)), BASE)

    def test_selection_does_not_mark_published_and_marker_is_monotonic(self):
        before = copy.deepcopy(self.state)
        M.select_publication(self.state, "schedule", M.FINAL_SCHEDULE, BASE + timedelta(hours=2))
        self.assertEqual(self.state, before)
        state = M.mark_published(self.state, "2026-09-14", "a" * 40)
        self.assertFalse(M.select_publication(state, "schedule", M.FINAL_SCHEDULE, BASE + timedelta(hours=2)))
        with self.assertRaises(ValueError):
            M.mark_published(state, "2026-09-13", "b" * 40)

    def test_publication_payload_retains_schema_and_true_freshness(self):
        state = M.record_attempt(self.state, None, "1", BASE + timedelta(hours=1))
        public = M.publication_payload(state)
        self.assertEqual(set(public), set(self.main))
        self.assertEqual(public["updatedAt"], self.main["updatedAt"])
        self.assertEqual(public["lastFailureStreak"], 1)
        public["items"].clear()
        self.assertTrue(state["latestGood"]["items"])

    def test_corrupt_state_fails_closed(self):
        for key, value in [("lastSuccessAt", "2026-02-30T00:00:00Z"), ("lastAttemptAt", "2026-09-14"), ("consecutiveFailures", True), ("processedRuns", []), ("lastPublishedDate", "2026-02-30"), ("schemaVersion", True), ("lastRunId", "9")]:
            state = copy.deepcopy(self.state)
            state[key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                M.select_publication(state, "schedule", M.FINAL_SCHEDULE, BASE)

    def test_corrupt_payload_fails_closed(self):
        for value in ("2026-02-30", "20260914", "not-a-date"):
            candidate = payload()
            candidate["items"][0]["publishedAt"] = value
            with self.assertRaises(ValueError):
                M.initialize(candidate, BASE)
        with self.assertRaises(ValueError):
            M.initialize(payload(BASE + timedelta(seconds=1)), BASE)

    def test_stale_or_future_candidate_is_recorded_as_failure(self):
        # Future-dated candidate (source returned an impossible clock):
        # treat as a failed attempt so the durable state stays consistent
        # without raising. The consecutiveFailures guard still eventually
        # suppresses publication via `select_publication`.
        state = M.record_attempt(self.state, payload(BASE + timedelta(hours=1)), "1", BASE)
        self.assertEqual(state["consecutiveFailures"], 1)
        self.assertEqual(state["latestGood"], self.main)
        self.assertEqual(state["lastSuccessAt"], self.main["updatedAt"])
        self.assertEqual(state["processedRuns"]["1"]["outcome"], "failure")

        # Stale candidate (no new acquisition since the recorded success).
        state = M.record_attempt(self.state, payload(BASE - timedelta(hours=1)), "1", BASE + timedelta(hours=2))
        self.assertEqual(state["consecutiveFailures"], 1)
        self.assertEqual(state["latestGood"], self.main)


if __name__ == "__main__":
    unittest.main()
