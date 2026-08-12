import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "update_official_profiles.py"
FIXTURES = ROOT / "scripts" / "fixtures" / "official_profiles"


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


if __name__ == "__main__":
    unittest.main()
