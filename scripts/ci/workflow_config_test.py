import pathlib
import unittest
import yaml


ROOT = pathlib.Path(__file__).parents[2]


def load(name):
    return yaml.load((ROOT / ".github/workflows" / name).read_text(encoding="utf-8"), Loader=yaml.BaseLoader)


def jst_slots(cron):
    minute, hours, *_ = cron.split()
    minutes = range(0, 60, int(minute[2:])) if minute.startswith("*/") else [int(minute)]
    utc_hours = []
    for part in hours.split(","):
        if "-" in part:
            start, end = map(int, part.split("-"))
            utc_hours.extend(range(start, end + 1))
        else:
            utc_hours.append(int(part))
    return [((hour + 9) % 24, value) for hour in utc_hours for value in minutes]


class WorkflowConfigTest(unittest.TestCase):
    def test_callers_grant_reusable_workflow_permissions(self):
        required = load("data-update.yml")["permissions"]
        levels = {"none": 0, "read": 1, "write": 2}
        for name in ("daily-data-update.yml", "realtime-torikumi-direct-update.yml", "news-feed-update.yml"):
            caller = load(name)
            granted = caller["jobs"]["update"].get("permissions", caller.get("permissions", {}))
            for scope, level in required.items():
                with self.subTest(workflow=name, scope=scope):
                    self.assertGreaterEqual(levels[granted.get(scope, "none")], levels[level])

    def test_daily_schedule_maps_to_four_expected_jst_slots(self):
        workflow = load("daily-data-update.yml")
        self.assertIn("workflow_dispatch", workflow["on"])
        cron = workflow["on"]["schedule"][0]["cron"]
        self.assertEqual(jst_slots(cron), [(13, 0), (15, 0), (17, 0), (19, 0)])
        reusable = load("data-update.yml")
        self.assertEqual(reusable["jobs"]["publish"]["concurrency"], {"group": "osumo-data-writer", "cancel-in-progress": "false"})

    def test_realtime_schedule_maps_to_36_expected_jst_slots(self):
        workflow = load("realtime-torikumi-direct-update.yml")
        self.assertIn("workflow_dispatch", workflow["on"])
        slots = jst_slots(workflow["on"]["schedule"][0]["cron"])
        expected = [(hour, minute) for hour in range(13, 19) for minute in range(0, 60, 10)]
        self.assertEqual(slots, expected)
        reusable = load("data-update.yml")
        self.assertEqual(reusable["jobs"]["publish"]["concurrency"], {"group": "osumo-data-writer", "cancel-in-progress": "false"})

    def test_news_schedule_has_distinct_final_slot_and_shared_writer(self):
        workflow = load("news-feed-update.yml")
        self.assertEqual(
            [jst_slots(entry["cron"]) for entry in workflow["on"]["schedule"]],
            [[(9, 5), (11, 5), (13, 5), (15, 5), (17, 5)], [(19, 5)]],
        )
        self.assertEqual(workflow["jobs"]["update"]["with"]["scope"], "news")
        self.assertEqual(load("data-update.yml")["jobs"]["publish"]["concurrency"]["group"], "osumo-data-writer")


if __name__ == "__main__":
    unittest.main()
