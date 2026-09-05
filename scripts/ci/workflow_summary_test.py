import importlib.util
import json
import pathlib
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("workflow_summary.py")


class WorkflowSummaryTest(unittest.TestCase):
    def load_module(self):
        spec = importlib.util.spec_from_file_location("workflow_summary", SCRIPT)
        module = importlib.util.module_from_spec(spec)
        assert spec.loader is not None
        spec.loader.exec_module(module)
        return module

    def test_schedule_summary_reports_only_published_days_and_division_counts(self):
        module = self.load_module()
        payload = {
            "updatedAt": "2026-09-12T12:00:00+09:00",
            "resultUpdatedAt": "2026-09-11T18:00:00+09:00",
            "scheduleUpdatedAt": "2026-09-12T12:00:00+09:00",
            "scheduleDays": [
                {"day": 1, "pathDate": "20260913", "status": "published", "data": {
                    "makuuchi": {"matches": [{}, {}]}, "juryo": {"matches": [{}]}}},
                {"day": 2, "pathDate": "20260914", "status": "pending", "data": {
                    "makuuchi": {"matches": []}, "juryo": {"matches": []}}},
            ],
        }
        text = module.render("schedule", payload)
        self.assertIn("scheduleUpdatedAt: `2026-09-12T12:00:00+09:00`", text)
        self.assertIn("day 1 / 20260913 / makuuchi 2 / juryo 1", text)
        self.assertNotIn("day 2 / 20260914", text)

    def test_result_summary_reports_settled_counts_for_published_days(self):
        module = self.load_module()
        payload = {"updatedAt": "u", "resultUpdatedAt": "r", "scheduleUpdatedAt": "s", "resultDays": [
            {"day": 3, "pathDate": "20260915", "status": "published", "data": {
                "makuuchi": {"matches": [{"winner": "east"}, {"winner": None}]},
                "juryo": {"matches": [{"winner": "west"}]}}}
        ]}
        text = module.render("result", payload)
        self.assertIn("day 3 / 20260915 / makuuchi settled 1/2 / juryo settled 1/1", text)

    def test_cli_fails_for_malformed_payload(self):
        module = self.load_module()
        with tempfile.TemporaryDirectory() as folder:
            path = pathlib.Path(folder) / "bad.json"
            path.write_text(json.dumps([]), encoding="utf-8")
            self.assertEqual(module.main(["schedule", str(path)]), 1)


if __name__ == "__main__":
    unittest.main()
