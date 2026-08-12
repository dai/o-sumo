import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "update_official_profiles.py"
FIXTURES = ROOT / "scripts" / "fixtures" / "official_profiles"


def load_generator_module():
    specification = importlib.util.spec_from_file_location("official_profile_generator", SCRIPT)
    module = importlib.util.module_from_spec(specification)
    assert specification.loader is not None
    specification.loader.exec_module(module)
    return module


GENERATOR = load_generator_module()


class OfficialProfileGeneratorTest(unittest.TestCase):
    def test_generates_validated_numeric_profiles_from_injected_fixture_fetch(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_root = Path(temporary_directory)
            (output_root / "gyoji").mkdir()
            (output_root / "yobidashi").mkdir()
            (output_root / "gyoji" / "legacy-name.json").write_text("{}", encoding="utf-8")
            (output_root / "yobidashi" / "old-name.json").write_text("{}", encoding="utf-8")
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--fixtures-dir",
                    str(FIXTURES),
                    "--output-root",
                    str(output_root),
                    "--retrieved-at",
                    "2026-08-12T00:00:00Z",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            gyoji = json.loads((output_root / "gyoji.json").read_text(encoding="utf-8"))
            yobidashi = json.loads((output_root / "yobidashi.json").read_text(encoding="utf-8"))
            profile = json.loads((output_root / "gyoji" / "1986.json").read_text(encoding="utf-8"))
            yobidashi_profile = json.loads((output_root / "yobidashi" / "1936.json").read_text(encoding="utf-8"))

            self.assertEqual([official["id"] for official in gyoji["officials"]], [1986, 1987])
            self.assertEqual(gyoji["officials"][0]["rankCode"], "tate-gyoji")
            self.assertEqual(gyoji["officials"][1]["rankCode"], "sanyaku-gyoji")
            self.assertEqual(yobidashi["officials"][1]["rankCode"], "fuku-tate-yobidashi")
            self.assertEqual(profile["birthDate"], "1961-10-30")
            self.assertEqual(profile["adoptedAt"], "1977-10")
            self.assertEqual(yobidashi_profile["adoptedAt"], "1989-03")
            self.assertEqual(profile["nameHistory"], ["木村 裕司", "木村 恵之助", "木村 庄之助"])
            self.assertEqual(profile["sourceUrl"], "https://www.sumo.or.jp/Profile/gyoji/1986/")
            self.assertEqual(profile["retrievedAt"], "2026-08-12T00:00:00Z")
            self.assertNotIn("photoUrl", profile)
            self.assertFalse((output_root / "gyoji" / "legacy-name.json").exists())
            self.assertFalse((output_root / "yobidashi" / "old-name.json").exists())

    def test_rejects_a_mismatched_detail_before_writing_any_output(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary_path = Path(temporary_directory)
            fixtures = temporary_path / "fixtures"
            output_root = temporary_path / "output"
            shutil.copytree(FIXTURES, fixtures)
            malformed = fixtures / "gyoji-1986.html"
            malformed.write_text(
                malformed.read_text(encoding="utf-8").replace("木村&nbsp;庄之助", "木村&nbsp;不一致", 1),
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--fixtures-dir", str(fixtures), "--output-root", str(output_root)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("name mismatch", result.stderr)
            self.assertFalse((output_root / "gyoji.json").exists())
            self.assertFalse((output_root / "yobidashi.json").exists())

    def test_rejects_a_malformed_list_row_before_writing_any_output(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary_path = Path(temporary_directory)
            fixtures = temporary_path / "fixtures"
            output_root = temporary_path / "output"
            shutil.copytree(FIXTURES, fixtures)
            malformed = fixtures / "gyoji-list.html"
            malformed.write_text(
                malformed.read_text(encoding="utf-8").replace("</table>", "<tr><td>unexpected</td></tr></table>"),
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--fixtures-dir", str(fixtures), "--output-root", str(output_root)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("invalid row", result.stderr)
            self.assertFalse((output_root / "gyoji.json").exists())
            self.assertFalse((output_root / "yobidashi.json").exists())

    def test_rejects_a_detail_heading_with_an_embedded_but_nonidentical_name(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary_path = Path(temporary_directory)
            fixtures = temporary_path / "fixtures"
            output_root = temporary_path / "output"
            shutil.copytree(FIXTURES, fixtures)
            malformed = fixtures / "gyoji-1986.html"
            malformed.write_text(
                malformed.read_text(encoding="utf-8").replace("木村&nbsp;庄之助", "木村&nbsp;庄之助&nbsp;追加", 1),
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--fixtures-dir", str(fixtures), "--output-root", str(output_root)],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("name mismatch", result.stderr)
            self.assertFalse((output_root / "gyoji.json").exists())

    def test_requires_a_utc_retrieval_timestamp_and_canonicalizes_utc_offset(self):
        fetch = GENERATOR.fixture_fetcher(FIXTURES)
        for invalid_timestamp in ("2026-08-12", "2026-08-12T00:00:00", "2026-08-12T09:00:00+09:00"):
            with self.subTest(invalid_timestamp=invalid_timestamp):
                with self.assertRaisesRegex(ValueError, "retrievedAt must be a UTC ISO 8601 timestamp"):
                    GENERATOR.generate(fetch, invalid_timestamp)

        generated = GENERATOR.generate(fetch, "2026-08-12T00:00:00+00:00")
        self.assertEqual(generated["gyoji"][0]["retrievedAt"], "2026-08-12T00:00:00Z")
        self.assertEqual(generated["gyoji"][1][0]["retrievedAt"], "2026-08-12T00:00:00Z")

    def test_rolls_back_every_target_after_an_injected_mid_install_failure(self):
        generated = GENERATOR.generate(GENERATOR.fixture_fetcher(FIXTURES), "2026-08-12T00:00:00Z")
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_root = Path(temporary_directory)
            (output_root / "gyoji").mkdir()
            (output_root / "yobidashi").mkdir()
            (output_root / "gyoji.json").write_bytes(b"old gyoji index\n")
            (output_root / "yobidashi.json").write_bytes(b"old yobidashi index\n")
            (output_root / "gyoji" / "old.json").write_bytes(b"old gyoji profile\n")
            (output_root / "yobidashi" / "old.json").write_bytes(b"old yobidashi profile\n")
            expected_files = {path.relative_to(output_root): path.read_bytes() for path in output_root.rglob("*") if path.is_file()}
            calls = 0

            def fail_during_second_install(source, destination):
                nonlocal calls
                calls += 1
                if calls == 6:
                    raise OSError("injected install failure")
                os.replace(source, destination)

            with self.assertRaisesRegex(OSError, "injected install failure"):
                GENERATOR.write_json_outputs(output_root, generated, replace_operation=fail_during_second_install)

            actual_files = {path.relative_to(output_root): path.read_bytes() for path in output_root.rglob("*") if path.is_file()}
            self.assertEqual(actual_files, expected_files)

    def test_preserves_backups_when_install_and_restoration_both_fail(self):
        generated = GENERATOR.generate(GENERATOR.fixture_fetcher(FIXTURES), "2026-08-12T00:00:00Z")
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_root = Path(temporary_directory)
            (output_root / "gyoji").mkdir()
            (output_root / "yobidashi").mkdir()
            (output_root / "gyoji.json").write_bytes(b"old gyoji index\n")
            (output_root / "yobidashi.json").write_bytes(b"old yobidashi index\n")
            (output_root / "gyoji" / "old.json").write_bytes(b"old gyoji profile\n")
            (output_root / "yobidashi" / "old.json").write_bytes(b"old yobidashi profile\n")
            calls = 0

            def fail_during_install_and_restoration(source, destination):
                nonlocal calls
                calls += 1
                if calls == 6:
                    raise OSError("injected install failure")
                if calls == 7:
                    raise OSError("injected restoration failure")
                os.replace(source, destination)

            with self.assertRaises(RuntimeError) as caught:
                GENERATOR.write_json_outputs(output_root, generated, replace_operation=fail_during_install_and_restoration)

            message = str(caught.exception)
            match = re.search(r"recovery backup preserved at: (.+)$", message)
            self.assertIsNotNone(match, message)
            recovery_root = Path(match.group(1))
            self.assertTrue(recovery_root.is_dir(), message)
            self.assertEqual((recovery_root / "backup-gyoji.json").read_bytes(), b"old gyoji index\n")
            self.assertEqual((recovery_root / "backup-yobidashi.json").read_bytes(), b"old yobidashi index\n")
            self.assertEqual((recovery_root / "backup-gyoji" / "old.json").read_bytes(), b"old gyoji profile\n")
            self.assertEqual((recovery_root / "backup-yobidashi" / "old.json").read_bytes(), b"old yobidashi profile\n")


if __name__ == "__main__":
    unittest.main()
