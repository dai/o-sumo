import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest
from datetime import date
from contextlib import redirect_stdout
from io import StringIO
from unittest import mock


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


def official_schedule() -> MODULE.OfficialSchedule:
    html = (FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8")
    return MODULE.parse_official_schedule(html, "202609")


def write_authoritative_sources(root: pathlib.Path, *, route_text: str = "", sitemap_source: bool = True) -> None:
    (root / "app/lib").mkdir(parents=True, exist_ok=True)
    (root / "public").mkdir(parents=True, exist_ok=True)
    (root / ".github/workflows").mkdir(parents=True, exist_ok=True)
    (root / "app/lib/archives-data.ts").write_text(
        "const item = { id: '202607', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' };",
        encoding="utf-8",
    )
    (root / "app/lib/torikumi-routes.ts").write_text(route_text, encoding="utf-8")
    (root / "public/_redirects").write_text("", encoding="utf-8")
    if sitemap_source:
        (root / "app/lib/sitemap.ts").write_text(
            "export function getSitemapEntries() { return days.filter((day) => day.status === 'published'); }",
            encoding="utf-8",
        )
    for workflow in MODULE.WORKFLOW_FILES:
        (root / workflow).write_text("on:\n  workflow_dispatch:\n", encoding="utf-8")


class PreflightParsingTests(unittest.TestCase):
    def test_official_schedule_fixture_has_target_month_and_15_consecutive_days(self):
        html = (FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8")
        schedule = MODULE.parse_official_schedule(html, "202609")

        self.assertEqual(schedule.month_key, "202609")
        self.assertEqual(schedule.start_date, date(2026, 9, 13))
        self.assertEqual(schedule.end_date, date(2026, 9, 27))
        self.assertEqual(schedule.days, tuple(date(2026, 9, day) for day in range(13, 28)))
        self.assertEqual(schedule.announcement_date, date(2026, 8, 8))
        self.assertEqual(schedule.banzuke_date, date(2026, 8, 31))

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

    def test_schedule_requires_structural_four_date_fields_and_exact_interval(self):
        malformed = "<tr><td>九月場所</td><td>令和8年8/8(土)</td><td>令和8年8/31(月)</td><td>令和8年9/13(日)</td><td>令和8年9/26(土)</td></tr>"
        with self.assertRaises(ValueError):
            MODULE.parse_official_schedule(malformed, "202609")

    def test_banzuke_identity_must_match_target_dates_in_both_divisions(self):
        payload = json.loads((FIXTURES / "banzuke-202609.json").read_text(encoding="utf-8"))
        payload["juryo"]["BashoInfo"]["start_date"] = "2026-07-12"
        with self.assertRaises(ValueError):
            MODULE.parse_official_banzuke(payload, "202609", schedule=MODULE.parse_official_schedule((FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8"), "202609"))

    def test_official_banzuke_requires_both_explicit_published_complete_divisions(self):
        fixture = json.loads((FIXTURES / "banzuke-202609.json").read_text(encoding="utf-8"))
        required_fields = ("basho_id", "basho_name", "year_jp", "start_date", "end_date")
        for division in ("makuuchi", "juryo"):
            missing_division = json.loads(json.dumps(fixture))
            del missing_division[division]
            with self.subTest(case=f"missing {division}"):
                with self.assertRaises(ValueError):
                    MODULE.parse_official_banzuke(missing_division, "202609")
            missing_result = json.loads(json.dumps(fixture))
            del missing_result[division]["Result"]
            with self.subTest(case=f"missing {division} Result"):
                with self.assertRaises(ValueError):
                    MODULE.parse_official_banzuke(missing_result, "202609")
            missing_info = json.loads(json.dumps(fixture))
            del missing_info[division]["BashoInfo"]
            with self.subTest(case=f"missing {division} BashoInfo"):
                with self.assertRaises(ValueError):
                    MODULE.parse_official_banzuke(missing_info, "202609")
            for field in required_fields:
                missing_field = json.loads(json.dumps(fixture))
                del missing_field[division]["BashoInfo"][field]
                with self.subTest(case=f"missing {division} {field}"):
                    with self.assertRaises(ValueError):
                        MODULE.parse_official_banzuke(missing_field, "202609")

    def test_run_preflight_blocks_official_fetch_failure_and_wrong_count(self):
        schedule = (FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8")
        banzuke = json.loads((FIXTURES / "banzuke-202609.json").read_text(encoding="utf-8"))
        with mock.patch.object(MODULE, "fetch_official_banzuke", side_effect=RuntimeError("official endpoint unavailable")):
            failed_fetch = MODULE.run_preflight(root=pathlib.Path("."), schedule_html=schedule)
        self.assertEqual((failed_fetch.status, failed_fetch.exit_code), ("BLOCKED", 1))

        banzuke["makuuchi"]["makuuchi_count"] = 41
        wrong_count = MODULE.run_preflight(root=pathlib.Path("."), schedule_html=schedule, banzuke_payload=banzuke)
        self.assertEqual((wrong_count.status, wrong_count.exit_code), ("BLOCKED", 1))


class PreflightGateTests(unittest.TestCase):
    def test_current_payload_contract_passes_and_duplicate_day_fails(self):
        banzuke, torikumi = current_payload()
        gates = MODULE.evaluate_local_contracts(banzuke, torikumi, "202607")
        self.assertTrue(all(gate.ok for gate in gates), gates)

        _, duplicate_torikumi = current_payload(duplicate_day=True)
        duplicate_gates = MODULE.evaluate_local_contracts(banzuke, duplicate_torikumi, "202607")
        self.assertTrue(any(not gate.ok for gate in duplicate_gates))

    def test_day_contract_rejects_duplicate_gap_and_out_of_order_dates(self):
        banzuke, torikumi = current_payload()
        for case in ("duplicate", "gap", "out_of_order"):
            mutated = json.loads(json.dumps(torikumi))
            entries = mutated["resultDays"]
            if case == "duplicate":
                entries[1]["pathDate"] = entries[0]["pathDate"]
                entries[1]["isoDate"] = entries[0]["isoDate"]
            elif case == "gap":
                entries[1]["pathDate"] = "20260715"
                entries[1]["isoDate"] = "2026-07-15"
            else:
                entries[0]["pathDate"], entries[1]["pathDate"] = entries[1]["pathDate"], entries[0]["pathDate"]
                entries[0]["isoDate"], entries[1]["isoDate"] = entries[1]["isoDate"], entries[0]["isoDate"]
            with self.subTest(case=case):
                gates = MODULE.evaluate_local_contracts(banzuke, mutated, "202607")
                self.assertFalse(next(gate for gate in gates if gate.name == "local result day contract").ok)

    def test_outgoing_archive_requires_current_month_and_all_current_hubs(self):
        schedule = official_schedule()
        for archive_text in (
            "const item = { id: '202605', resultPath: '/202605-torikumi', schedulePath: '/202605-yotei', banzukePath: '/202605-banzuke' };",
            "const item = { id: '202607', resultPath: '/202605-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' };",
        ):
            with tempfile.TemporaryDirectory() as directory:
                root = pathlib.Path(directory)
                write_authoritative_sources(root)
                (root / "app/lib/archives-data.ts").write_text(archive_text, encoding="utf-8")
                gates = MODULE.evaluate_source_contracts(root, "202607", "202609", schedule)
                archive_gate = next(gate for gate in gates if gate.name == "outgoing archive uniqueness")
                self.assertFalse(archive_gate.ok)

    def test_outgoing_archive_paths_must_belong_to_current_month_record(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            write_authoritative_sources(root)
            (root / "app/lib/archives-data.ts").write_text(
                "const items = ["
                "{ id: '202607', resultPath: '/202605-torikumi', schedulePath: '/202605-yotei', banzukePath: '/202605-banzuke' },"
                "{ id: '202605', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' }"
                "];",
                encoding="utf-8",
            )
            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            archive_gate = next(gate for gate in gates if gate.name == "outgoing archive uniqueness")
            self.assertFalse(archive_gate.ok)

    def test_target_paths_use_official_schedule_days(self):
        paths = MODULE._target_paths(official_schedule())
        self.assertIn("/20260913-torikumi/", paths)
        self.assertIn("/20260927-yotei/", paths)
        self.assertNotIn("/20260901-torikumi/", paths)

    def test_target_route_and_sitemap_collisions_cover_every_official_day(self):
        schedule = official_schedule()
        daily_collision = " ".join(f"'/{day.strftime('%Y%m%d')}-torikumi/'" for day in schedule.days)
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            write_authoritative_sources(root, route_text=f"const paths = [{daily_collision}];")
            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", schedule)
            self.assertFalse(next(g for g in gates if g.name == "simulated target route uniqueness").ok)
            self.assertFalse(next(g for g in gates if g.name == "simulated target sitemap uniqueness").ok)

    def test_missing_authoritative_sitemap_source_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            write_authoritative_sources(root, sitemap_source=False)
            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            self.assertFalse(next(g for g in gates if g.name == "simulated target sitemap uniqueness").ok)

    def test_duplicate_archive_id_fails_the_archive_gate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / "app/lib").mkdir(parents=True)
            (root / "public").mkdir()
            (root / ".github/workflows").mkdir(parents=True)
            (root / "app/lib/archives-data.ts").write_text(
                "const items = [{ id: '202607', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' }, { id: '202607', resultPath: '/202605-torikumi', schedulePath: '/202605-yotei', banzukePath: '/202605-banzuke' }];",
                encoding="utf-8",
            )
            (root / "public/_redirects").write_text("", encoding="utf-8")
            for workflow in MODULE.WORKFLOW_FILES:
                path = root / workflow
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("on:\n  workflow_dispatch:\n", encoding="utf-8")
            archive_gate = next(gate for gate in MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule()) if gate.name == "outgoing archive uniqueness")
            self.assertFalse(archive_gate.ok)

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

            (root / "app/lib/sitemap.ts").write_text("export function getSitemapEntries() { return days.filter((day) => day.status === 'published'); }", encoding="utf-8")
            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            self.assertTrue(all(gate.ok for gate in gates), gates)

            (root / "public/_redirects").write_text("/202609-banzuke /202609-banzuke/ 301", encoding="utf-8")
            blocked = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            self.assertTrue(any(not gate.ok for gate in blocked))

    def test_route_and_sitemap_collision_is_reported_against_existing_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / "app/lib").mkdir(parents=True)
            (root / "public").mkdir()
            (root / ".github/workflows").mkdir(parents=True)
            (root / "app/lib/archives-data.ts").write_text("const item = { id: '202607', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' };", encoding="utf-8")
            (root / "app/lib/torikumi-routes.ts").write_text("const paths = ['/202609-banzuke/'];", encoding="utf-8")
            (root / "public/_redirects").write_text("", encoding="utf-8")
            (root / "public/sitemap.xml").write_text("<loc>https://osada.us/20260901-torikumi/</loc>", encoding="utf-8")
            for workflow in MODULE.WORKFLOW_FILES:
                path = root / workflow
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("on:\n  workflow_dispatch:\n", encoding="utf-8")

            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            route_gate = next(gate for gate in gates if gate.name == "simulated target route uniqueness")
            sitemap_gate = next(gate for gate in gates if gate.name == "simulated target sitemap uniqueness")
            self.assertFalse(route_gate.ok)
            self.assertFalse(sitemap_gate.ok)

    def test_workflow_dispatch_is_required_and_schedule_is_forbidden(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            (root / "app/lib").mkdir(parents=True)
            (root / "public").mkdir()
            (root / "app/lib/archives-data.ts").write_text("const item = { id: '202607', resultPath: '/202607-torikumi', schedulePath: '/202607-yotei', banzukePath: '/202607-banzuke' };", encoding="utf-8")
            (root / "public/_redirects").write_text("", encoding="utf-8")
            (root / ".github/workflows").mkdir(parents=True)
            (root / MODULE.WORKFLOW_FILES[0]).write_text("on:\n  schedule:\n    - cron: '0 0 * * *'\n", encoding="utf-8")
            (root / MODULE.WORKFLOW_FILES[1]).write_text("on:\n", encoding="utf-8")
            gates = MODULE.evaluate_source_contracts(root, "202607", "202609", official_schedule())
            workflow_gate = next(gate for gate in gates if gate.name == "data workflows manual-only")
            self.assertFalse(workflow_gate.ok)

    def test_main_prints_gate_format_and_final_status_exit(self):
        result = MODULE.PreflightResult((MODULE.Gate("example", "yes", "no", "fixture", False),), "BLOCKED")
        original = MODULE.run_preflight
        MODULE.run_preflight = lambda **_: result
        output = StringIO()
        try:
            with redirect_stdout(output):
                exit_code = MODULE.main(["--repo-root", "."])
        finally:
            MODULE.run_preflight = original
        self.assertEqual(exit_code, 1)
        self.assertEqual(output.getvalue().splitlines(), ["[FAIL] example expected=yes actual=no source=fixture", "BLOCKED"])

        ready = MODULE.PreflightResult((MODULE.Gate("example", "yes", "yes", "fixture", True),), "READY")
        MODULE.run_preflight = lambda **_: ready
        output = StringIO()
        try:
            with redirect_stdout(output):
                exit_code = MODULE.main(["--repo-root", "."])
        finally:
            MODULE.run_preflight = original
        self.assertEqual(exit_code, 0)
        self.assertEqual(output.getvalue().splitlines(), ["[OK] example expected=yes actual=yes source=fixture", "READY"])

    def test_preflight_is_read_only(self):
        tracked = [
            pathlib.Path("scripts/preflight_current_basho.py"),
            pathlib.Path("scripts/preflight_current_basho_test.py"),
            pathlib.Path("public/api/v1/banzuke.json"),
            pathlib.Path("public/api/v1/torikumi.json"),
            pathlib.Path("app/lib/archives-data.ts"),
            pathlib.Path("app/lib/torikumi-routes.ts"),
            pathlib.Path("public/_redirects"),
        ]
        before = {path: path.read_bytes() for path in tracked}
        schedule = (FIXTURES / "annual-schedule-202609.html").read_text(encoding="utf-8")
        banzuke = json.loads((FIXTURES / "banzuke-202609.json").read_text(encoding="utf-8"))
        MODULE.run_preflight(root=pathlib.Path("."), schedule_html=schedule, banzuke_payload=banzuke)
        after = {path: path.read_bytes() for path in tracked}
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main()
