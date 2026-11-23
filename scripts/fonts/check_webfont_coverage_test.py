"""Unit tests for scripts/fonts/check_webfont_coverage.py."""

from __future__ import annotations

from pathlib import Path
import tempfile
import unittest

from scripts.fonts import check_webfont_coverage as M


class CheckWebfontCoverageTest(unittest.TestCase):
    def _setup_repo(self, root: Path, *, coverage: list[str], unsupported: list[str] | None = None) -> None:
        fonts_dir = root / "scripts" / "fonts"
        fonts_dir.mkdir(parents=True)
        (fonts_dir / "coverage.txt").write_text("\n".join(coverage) + "\n", encoding="utf-8")
        (fonts_dir / "unsupported.txt").write_text("\n".join(unsupported or []) + "\n", encoding="utf-8")
        (root / "app").mkdir()

    def test_passes_when_all_required_characters_are_covered_or_ignored(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._setup_repo(root, coverage=["0041", "5927"], unsupported=["8A03"])
            (root / "app" / "page.tsx").write_text("A大訃\n\t\U0001F525\uFE0F\u200D", encoding="utf-8")
            (root / "app" / "images").mkdir()
            (root / "app" / "images" / "skip.txt").write_text("秘", encoding="utf-8")
            (root / "app" / "icon.png").write_bytes(b"\x89PNG\x00\xe7\xa7\x98")
            (root / "app" / "invalid.txt").write_bytes(b"\xff\xfe\xfd")

            self.assertEqual(M.find_missing_codepoints(root), [])
            self.assertEqual(M.main(["--root", str(root)]), 0)

    def test_fails_and_reports_missing_codepoints(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._setup_repo(root, coverage=["0041"])
            (root / "public").mkdir()
            (root / "public" / "news.json").write_text('{"title":"訃報"}', encoding="utf-8")

            missing = M.find_missing_codepoints(root)
            codes = {code for code, _ in missing}
            self.assertIn("U+8A03", codes)
            self.assertIn("U+5831", codes)
            self.assertEqual(M.main(["--root", str(root)]), 1)


if __name__ == "__main__":
    unittest.main()
