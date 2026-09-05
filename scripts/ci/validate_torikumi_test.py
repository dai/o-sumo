import importlib.util
import json
import pathlib
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("validate_torikumi", pathlib.Path(__file__).with_name("validate_torikumi.py"))
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


def match(east=1, west=2, *, kimarite="", winner=None, is_playoff=False):
    value = {
        "eastProfileUrl": f"https://www.sumo.or.jp/ResultRikishiData/profile/{east}/",
        "westProfileUrl": f"https://www.sumo.or.jp/ResultRikishiData/profile/{west}/",
        "kimarite": kimarite,
        "winner": winner,
    }
    if is_playoff:
        value["isPlayoff"] = True
    return value


def payload(makuuchi=None, juryo=None, *, absentees=None):
    pending = {"status": "pending", "data": {"makuuchi": {"matches": []}, "juryo": {"matches": []}}}
    days = [pending for _ in range(14)]
    days.insert(0, {"day": 1, "status": "published", "data": {
        "makuuchi": {"matches": makuuchi if makuuchi is not None else [match(1, 2)], "absentees": absentees or []},
        "juryo": {"matches": juryo if juryo is not None else [match(3, 4)], "absentees": []},
    }})
    return {"bashoId": 637, "updatedAt": "x", "resultUpdatedAt": "x", "scheduleUpdatedAt": "x",
            "resultDays": [pending for _ in range(15)], "scheduleDays": days}


def set_published_day(value, day):
    value["scheduleDays"][0]["day"] = day
    return value


class ValidateTorikumiTest(unittest.TestCase):
    def run_payload(self, value):
        with tempfile.TemporaryDirectory() as folder:
            path = pathlib.Path(folder) / "torikumi.json"
            path.write_text(json.dumps(value), encoding="utf-8")
            return MODULE.main(str(path))

    def test_accepts_complete_published_schedule_and_cross_division_participant(self):
        self.assertEqual(self.run_payload(payload(makuuchi=[match(10, 30)], juryo=[match(31, 32)])), 0)

    def test_rejects_empty_division_invalid_ids_duplicate_bouts_and_participants(self):
        invalid_cases = [
            payload(makuuchi=[]),
            payload(makuuchi=[match(0, 2)]),
            payload(makuuchi=[match(1, 2)], juryo=[match(2, 1)]),
            payload(makuuchi=[match(1, 2), match(1, 5)]),
        ]
        for value in invalid_cases:
            with self.subTest(value=value):
                self.assertEqual(self.run_payload(value), 1)

    def test_absentee_overlap_only_allows_precise_fusen_loser(self):
        absentee = [{"id": 2}]
        self.assertEqual(self.run_payload(payload(makuuchi=[match(1, 2)], absentees=absentee)), 1)
        self.assertEqual(self.run_payload(payload(makuuchi=[match(1, 2, kimarite="不戦", winner="east")], absentees=absentee)), 0)
        self.assertEqual(self.run_payload(payload(makuuchi=[match(1, 2, kimarite="不戦", winner="west")], absentees=absentee)), 1)
        self.assertEqual(self.run_payload(payload(makuuchi=[match(1, 2, kimarite="不戦", winner="east"), match(2, 5)], absentees=absentee)), 1)

    def test_malformed_structure_returns_one(self):
        value = payload()
        value["scheduleDays"][0]["data"]["makuuchi"]["matches"] = "bad"
        self.assertEqual(self.run_payload(value), 1)
        self.assertEqual(self.run_payload([]), 1)

    def test_allows_senshuraku_playoff_repeat_but_not_duplicate_pair(self):
        playoff = set_published_day(payload(makuuchi=[match(1, 2), match(1, 5, is_playoff=True)]), 15)
        ordinary = set_published_day(payload(makuuchi=[match(1, 2), match(1, 5)]), 15)
        duplicate = set_published_day(payload(makuuchi=[match(1, 2), match(2, 1)]), 15)
        self.assertEqual(self.run_payload(playoff), 0)
        self.assertEqual(self.run_payload(ordinary), 1)
        self.assertEqual(self.run_payload(duplicate), 1)


if __name__ == "__main__":
    unittest.main()
