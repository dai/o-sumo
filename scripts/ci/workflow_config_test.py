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
    def test_daily_schedule_maps_to_four_expected_jst_slots(self):
        workflow = load("daily-data-update.yml")
        self.assertIn("workflow_dispatch", workflow["on"])
        cron = workflow["on"]["schedule"][0]["cron"]
        self.assertEqual(jst_slots(cron), [(13, 0), (15, 0), (17, 0), (19, 0)])
        self.assertEqual(workflow["concurrency"], {"group": "osumo-torikumi-update", "cancel-in-progress": "false"})

    def test_realtime_schedule_maps_to_36_expected_jst_slots(self):
        workflow = load("realtime-torikumi-direct-update.yml")
        self.assertIn("workflow_dispatch", workflow["on"])
        slots = jst_slots(workflow["on"]["schedule"][0]["cron"])
        expected = [(hour, minute) for hour in range(13, 19) for minute in range(0, 60, 10)]
        self.assertEqual(slots, expected)
        self.assertEqual(workflow["concurrency"], {"group": "osumo-torikumi-update", "cancel-in-progress": "false"})
        commit = workflow["jobs"]["update-torikumi"]["steps"][4]
        self.assertIn("failure()", workflow["jobs"]["update-torikumi"]["steps"][-1]["if"])
        self.assertIn('bash scripts/ci/push_realtime_update.sh', commit["run"])


if __name__ == "__main__":
    unittest.main()
