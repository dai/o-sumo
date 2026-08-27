import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest
from datetime import date


SCRIPT = pathlib.Path(__file__).with_name("preflight_current_basho.py")
SPEC = importlib.util.spec_from_file_location("preflight_current_basho", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)

FIXTURES = pathlib.Path(__file__).parent / "fixtures" / "preflight"


def current_payload(*, month: str = "202607", duplicate_day: bool = False) -> tuple[dict, dict]:
    banzuke = {
        "bashoName": "七月場所",
        "year": "令和八年",
        "updatedAt": "2026-07-26T18:44:23+09:00",
        "makuuchi": [{"title": "幕内", "east": [{"id": i} for i in range(42)], "west": []}],
        "juryo": [{"title": "十両", "east": [{"id": 1000 + i} for i in range(28)], "west": []}],
    }
    def days(mode: str) -> list[dict]:
        result = []
        for day in range(1, 16):
            day_date = date(2026, 7, 11 + day).strftime("%Y%m%d")
            result.append({
                "day": day,
                "pathDate": day_date,
                "isoDate": date(2026, 7, 11 + day).isoformat(),
                "status": "published" if mode == "result" or day == 15 else "pending",
                "data": {"makuuchi": {"matches": []}, "juryo": {"matches": []}},
            })
        if duplicate_day:
            result.append(dict(result[-1]))
        return result
    torikumi = {
        "bashoName": "七月場所",
        "year": "令和八年",
        "resultDays": days("result"),
        "scheduleDays": days("schedule"),
    }
    if month != "202607":
        banzuke["bashoName"] = "九月場所"
        torikumi["bashoName"] = "九月場所"
        for entries in (torikumi["resultDays"], torikumi["scheduleDays"]):
            for entry in entries:
                entry["pathDate"] = "202609" + f"{entry['day']:02d}"
                entry["isoDate"] = date(2026, 9, entry["day"]).isoformat()
    return banzuke, torikumi


class PreflightParsingTests(unittest.TestCase):
    def test_official_schedule_fixture_has_target_month_and_15_consecutive_days(self):
        html = (FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8")
        schedule = MODULE.parse_official_schedule(html, "202609")

        self.assertEqual(schedule.month_key, "202609")
        self.assertEqual(schedule.start_date, date(2026, 9, 13))
        self.assertEqual(schedule.end_date, date(2026, 9, 27))
        self.assertEqual(schedule.days, tuple(date(2026, 9, day) for day in range(13, 28)))

    def test_official_banzuke_fixture_has_expected_division_counts(self):
        payload = json.loads((FIXTURES / "banzuke-202609.json").read_text(encoding="utf-8"))
        banzuke = MODULE.parse_official_banzuke(payload, "202609")

        self.assertEqual(banzuke.month_key, "202609")
        self.assertEqual(banzuke.makuuchi_count, 42)
        self.assertEqual(banzuke.juryo_count, 28)

    def test_unpublished_official_fixture_is_rejected_without_local_fallback(self):
        with self.assertRaises(ValueError):
            MODULE.parse_official_schedule("<html><body>七月場所 令和8年7月12日</body></html>", "202609")
        payload = {"Result": "1", "month_key": "202607", "makuuchi_count": 42, "juryo_count": 28}
        with self.assertRaises(ValueError):
            MODULE.parse_official_banzuke(payload, "202609")


class PreflightGateTests(unittest.TestCase):
    def test_current_payload_contract_passes_and_duplicate_day_fails(self):
        banzuke, torikumi = current_payload()
        gates = MODULE.evaluate_local_contracts(banzuke, torikumi, "202607")
        self.assertTrue(all(gate.ok for gate in gates), gates)

        _, duplicate_torikumi = current_payload(duplicate_day=True)
        duplicate_gates = MODULE.evaluate_local_contracts(banzuke, duplicate_torikumi, "202607")
        self.assertTrue(any(not gate.ok for gate in duplicate_gates))

    def test_target_routes_are_unique_and_absent_from_current_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / "app/lib").mkdir(parents=True)
            (root / "public").mkdir()
            (root / ".github/workflows").mkdir(parents=True)
            (root / "app/lib/archives-data.ts").write_text("const item = { id: '202607', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' };", encoding="utf-8")
            (root / "app/lib/torikumi-routes.ts").write_text("const paths = ['202607-banzuke'];", encoding="utf-8")
            (root / "public/_redirects").write_text("/202607-banzuke /202607-banzuke/ 301", encoding="utf-8")
            (root / "public/sitemap.xml").write_text("<loc>https://osada.us/202607-banzuke/</loc>", encoding="utf-8")
            (root / ".github/workflows/daily-data-update.yml").write_text("on:\n  workflow_dispatch:\n", encoding="utf-8")
            (root / ".github/workflows/realtime-torikumi-direct-update.yml").write_text("on:\n  workflow_dispatch:\n", encoding="utf-8")

            gates = MODULE.evaluate_source_contracts(root, "202607", "202609")
            self.assertTrue(all(gate.ok for gate in gates), gates)

            (root / "public/_redirects").write_text("/202609-banzuke /202609-banzuke/ 301", encoding="utf-8")
            blocked = MODULE.evaluate_source_contracts(root, "202607", "202609")
            self.assertTrue(any(not gate.ok for gate in blocked))


if __name__ == "__main__":
    unittest.main()
