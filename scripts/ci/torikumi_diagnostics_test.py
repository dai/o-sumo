"""Tests for scripts/ci/torikumi_diagnostics.py."""

from __future__ import annotations

import importlib.util
import pathlib
import unittest


SPEC = importlib.util.spec_from_file_location(
    "torikumi_diagnostics",
    pathlib.Path(__file__).with_name("torikumi_diagnostics.py"),
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExtractDiagnosticsTest(unittest.TestCase):
    def test_extracts_day_division_and_category(self) -> None:
        stderr = (
            "[warn] torikumi fetch failed: basho_id=637, day=3, division=幕内 (boom)\n"
            "incomplete official schedule fetch: day=4 division=十両\n"
        )
        result = MODULE.extract_diagnostics(stderr, run_url="https://example/runs/1")

        self.assertEqual(result["days"], [3, 4])
        self.assertEqual(result["divisions"], ["juryo", "makuuchi"])
        self.assertEqual(result["categories"], ["network", "validation"])
        self.assertEqual(result["run_url"], "https://example/runs/1")
        self.assertFalse(result["unknown"])

    def test_unknown_when_no_allowlisted_signal(self) -> None:
        stderr = "RuntimeError: something broke\n"
        result = MODULE.extract_diagnostics(stderr, run_url="https://example/runs/2")

        self.assertTrue(result["unknown"])
        self.assertEqual(result["days"], [])
        self.assertEqual(result["divisions"], [])
        self.assertEqual(result["categories"], [])

    def test_drops_invalid_day_numbers(self) -> None:
        stderr = "day=0, day=16, day=8\n"
        result = MODULE.extract_diagnostics(stderr, run_url="https://example/runs/3")

        self.assertEqual(result["days"], [8])

    def test_never_echoes_raw_stderr_or_secrets(self) -> None:
        secret = "ghp_abcdefghij1234567890"
        stderr = f"[error] leaked token: {secret}\nday=1 division=幕内\n"
        result = MODULE.extract_diagnostics(stderr, run_url="https://example/runs/4")

        markdown = MODULE.format_diagnostics_markdown(result)
        discord = MODULE.format_diagnostics_discord(result)
        self.assertNotIn(secret, markdown)
        self.assertNotIn(secret, discord)
        self.assertNotIn("leaked token", markdown)
        self.assertNotIn(stderr, markdown)

    def test_handles_empty_stderr(self) -> None:
        result = MODULE.extract_diagnostics("", run_url="https://example/runs/5")

        self.assertTrue(result["unknown"])
        self.assertEqual(result["days"], [])

    def test_handles_none_stderr(self) -> None:
        result = MODULE.extract_diagnostics(None, run_url="https://example/runs/6")  # type: ignore[arg-type]

        self.assertTrue(result["unknown"])


class FormatDiagnosticsTest(unittest.TestCase):
    def test_markdown_includes_run_link_when_present(self) -> None:
        result = MODULE.extract_diagnostics(
            "day=2 division=十両 strict torikumi fetch check failed", run_url="https://example/runs/7"
        )

        markdown = MODULE.format_diagnostics_markdown(result)

        self.assertIn("days: 2", markdown)
        self.assertIn("divisions: 十両", markdown)
        self.assertIn("category: validation", markdown)
        self.assertIn("https://example/runs/7", markdown)

    def test_discord_output_is_bounded(self) -> None:
        huge = "day=1 division=幕内\n" * 5000
        result = MODULE.extract_diagnostics(huge, run_url="https://example/runs/8")

        discord = MODULE.format_diagnostics_discord(result)

        self.assertLessEqual(len(discord), MODULE._DISCORD_DESCRIPTION_LIMIT)

    def test_unknown_markdown_marks_category_and_includes_run(self) -> None:
        result = MODULE.extract_diagnostics("traceback goes here", run_url="https://example/runs/9")

        markdown = MODULE.format_diagnostics_markdown(result)

        self.assertIn("category: unknown", markdown)
        self.assertIn("https://example/runs/9", markdown)

    def test_markdown_omits_run_line_when_run_url_missing(self) -> None:
        result = {
            "days": [1],
            "divisions": ["makuuchi"],
            "categories": ["network"],
            "run_url": "",
            "unknown": False,
        }

        markdown = MODULE.format_diagnostics_markdown(result)

        self.assertNotIn("- run:", markdown)


if __name__ == "__main__":
    unittest.main()
