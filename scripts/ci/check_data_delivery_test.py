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
FRESH = {"status": "success"}
STALE = {"status": "stale"}


def record(name, **overrides):
    return dict({"name": name, "head_sha": SHA, "event": "push", "id": 1,
                 "status": "completed", "conclusion": "success",
                 "started_at": "2026-09-15T00:00:00Z"}, **overrides)


class DeliveryTests(unittest.TestCase):
    def run_monitor(self, pages=None, ci=None, error=False, production=STALE):
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

        result = delivery.monitor("owner/repo", SHA, 5, 2, production=lambda _: production,
                                  reader=reader, clock=lambda: elapsed[0], sleep=sleep)
        return result, elapsed[0], calls

    def test_success_requires_ci_and_fresh_production(self):
        result, elapsed, calls = self.run_monitor(
            [record("Cloudflare Pages: o-sumo")], [record("Test")], production=FRESH)
        self.assertEqual(result["overall"], "success")
        self.assertEqual(result["sha"], SHA)
        self.assertEqual(elapsed, 0)
        self.assertEqual(len(calls), 2)
        self.assertIn("event=push", calls[1])

    def test_pages_success_alone_does_not_prove_publication(self):
        result, elapsed, _ = self.run_monitor(
            [record("Cloudflare Pages: o-sumo")], [record("Test")], production=STALE)
        self.assertEqual(result["overall"], "production_stale")
        self.assertEqual(elapsed, 5)

    def test_pages_never_reported_but_production_fresh_is_success(self):
        result, _, _ = self.run_monitor([], [record("Test")], production=FRESH)
        self.assertEqual(result["overall"], "success")
        self.assertEqual(result["pages"]["status"], "missing")

    def test_fresh_production_without_ci_success_keeps_waiting(self):
        result, elapsed, _ = self.run_monitor([record("Cloudflare Pages: o-sumo")], [],
                                              production=FRESH)
        self.assertEqual(result["overall"], "timeout")
        self.assertEqual(elapsed, 5)

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
                    [record("Test", conclusion=conclusion)], production=FRESH)
                self.assertEqual(result["overall"], "failure")
                self.assertEqual(elapsed, 0)

    def test_failed_pages_build_is_terminal_even_if_production_is_fresh(self):
        result, _, _ = self.run_monitor(
            [record("Cloudflare Pages: o-sumo", conclusion="failure")], [record("Test")],
            production=FRESH)
        self.assertEqual(result["overall"], "failure")

    def test_queued_rerun_hides_earlier_success(self):
        result, _, _ = self.run_monitor(
            [record("Cloudflare Pages: o-sumo"),
             record("Cloudflare Pages: o-sumo", id=2, started_at=None,
                    created_at="2026-09-15T00:01:00Z", status="queued", conclusion=None)],
            [record("Test")])
        self.assertEqual(result["overall"], "production_stale")
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
            result = delivery.monitor("owner/repo", SHA, production=lambda _: FRESH,
                                      reader=reader, sleep=lambda _: None)
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


class ProductionTests(unittest.TestCase):
    EXPECTED = {"public/api/v1/torikumi.json": "2026-11-09T17:57:42+09:00",
                "public/api/v1/news.json": "2026-11-09T19:14:07+09:00"}

    def status(self, served, expected=None):
        urls = []

        def fetch(url, timeout):
            urls.append(url)
            self.assertGreater(timeout, 0)
            value = served[url.split("?")[0].rsplit("/", 1)[1]]
            if isinstance(value, Exception):
                raise value
            return {"updatedAt": value}

        result = delivery.production_status("https://example.test/", self.EXPECTED if expected is None
                                            else expected, "n1", 10, fetch=fetch)
        return result, urls

    def test_matching_or_newer_production_is_fresh(self):
        result, urls = self.status({"torikumi.json": "2026-11-09T17:57:42+09:00",
                                    "news.json": "2026-11-10T09:31:00+09:00"})
        self.assertEqual(result["status"], "success")
        self.assertEqual(urls, ["https://example.test/api/v1/torikumi.json?delivery=n1",
                                "https://example.test/api/v1/news.json?delivery=n1"])

    def test_timezones_are_compared_as_instants(self):
        result, _ = self.status({"torikumi.json": "2026-11-09T08:57:42Z",
                                 "news.json": "2026-11-09T10:14:07Z"})
        self.assertEqual(result["status"], "success")

    def test_rolled_back_production_is_stale(self):
        result, _ = self.status({"torikumi.json": "2026-11-09T16:43:25+09:00",
                                 "news.json": "2026-11-09T19:14:07+09:00"})
        self.assertEqual(result["status"], "stale")
        self.assertEqual(result["files"]["public/api/v1/torikumi.json"]["served"],
                         "2026-11-09T16:43:25+09:00")
        self.assertEqual(result["files"]["public/api/v1/news.json"]["status"], "fresh")

    def test_fetch_errors_are_unavailable_without_details(self):
        result, _ = self.status({"torikumi.json": OSError("SECRET"),
                                 "news.json": "2026-11-09T19:14:07+09:00"})
        self.assertEqual(result["status"], "unavailable")
        self.assertNotIn("SECRET", json.dumps(result))

    def test_missing_served_timestamp_is_stale(self):
        result, _ = self.status({"torikumi.json": None, "news.json": "2026-11-09T19:14:07+09:00"})
        self.assertEqual(result["status"], "stale")

    def test_nothing_to_compare_is_unavailable(self):
        result, urls = self.status({}, expected={})
        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(urls, [])

    def test_expected_versions_read_published_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "public/api/v1").mkdir(parents=True)
            (root / "public/api/v1/torikumi.json").write_text(
                json.dumps({"updatedAt": "2026-11-09T17:57:42+09:00"}), encoding="utf-8")
            (root / "public/api/v1/banzuke.json").write_text(json.dumps({}), encoding="utf-8")
            self.assertEqual(delivery.expected_versions(root),
                             {"public/api/v1/torikumi.json": "2026-11-09T17:57:42+09:00"})

    def test_production_only_waits_then_reports_stale(self):
        elapsed = [0]

        def sleep(seconds):
            elapsed[0] += seconds

        result = delivery.monitor_production(5, 2, production=lambda _: STALE,
                                             clock=lambda: elapsed[0], sleep=sleep)
        self.assertEqual(result["overall"], "production_stale")
        self.assertEqual(elapsed, [5])

    def test_production_only_succeeds_when_caught_up(self):
        answers = iter([STALE, FRESH])
        result = delivery.monitor_production(5, 2, production=lambda _: next(answers),
                                             clock=lambda: 0, sleep=lambda _: None)
        self.assertEqual(result["overall"], "success")

    def test_stale_production_exits_nonzero(self):
        with patch.object(delivery, "monitor_production", return_value={
                "sha": None, "production": STALE, "overall": "production_stale"}), \
                patch.object(delivery, "expected_versions", return_value=self.EXPECTED), \
                contextlib.redirect_stdout(io.StringIO()):
            code = delivery.main(["--production-only", "--production-url", "https://example.test"])
        self.assertEqual(code, 1)

    def test_production_only_emission_omits_checks(self):
        result = {"sha": None, "production": STALE, "overall": "production_stale"}
        with tempfile.TemporaryDirectory() as directory:
            summary = Path(directory) / "summary"
            with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": str(summary)}), \
                    contextlib.redirect_stdout(io.StringIO()):
                delivery.emit(result)
            text = summary.read_text()
        self.assertIn("Production data: **stale**", text)
        self.assertNotIn("Cloudflare Pages", text)


if __name__ == "__main__":
    unittest.main()
