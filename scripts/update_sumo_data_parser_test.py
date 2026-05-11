import importlib.util
import pathlib
import unittest
from datetime import date


SPEC = importlib.util.spec_from_file_location(
    "update_sumo_data",
    pathlib.Path(__file__).with_name("update_sumo_data.py"),
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class ParseProfileHtmlTest(unittest.TestCase):
    def test_keeps_shusshin_from_exact_label_without_related_list_override(self) -> None:
        html = """
        <table>
          <tr><th>生年月日</th><td>昭和62年5月11日（38歳）</td></tr>
          <tr><th>出身地</th><td>熊本県熊本市東区</td></tr>
          <tr><th>身長</th><td>183.0cm</td></tr>
          <tr><th>体重</th><td>146.0kg</td></tr>
          <tr><th>初土俵</th><td>平成十五年三月場所</td></tr>
        </table>
        <section>
          <h2>熊本県出身の他の力士</h2>
          <a>東前頭二枚目</a>
        </section>
        """

        profile = MODULE.parse_profile_html(html)

        self.assertIsNotNone(profile)
        assert profile is not None
        self.assertEqual(profile["birthDate"], "昭和62年5月11日（38歳）")
        self.assertEqual(profile["shusshin"], "熊本県熊本市東区")
        self.assertEqual(profile["height"], 183)
        self.assertEqual(profile["weight"], 146)
        self.assertEqual(profile["debut"], "平成十五年三月場所")


class ParseOfficialAbsenceTest(unittest.TestCase):
    def setUp(self) -> None:
        self.html = """
        <html>
          <body>
            <input type="hidden" class="datetime" value="2026-05-11 10:00:07">
            <p class="mdDate">2026-05-11 10:00:07</p>
            <span class="dayNum fnt16">幕内・十両</span>
            <table class="mdTable3 type4">
              <tr>
                <td><dl><dt>東横綱</dt><dd><img alt="ほうしょうりゅう" /></dd></dl></td>
                <td><span class="fnt16">二日目から休場いたします。</span></td>
              </tr>
            </table>
            <p class="txtR mb5">令和8年5月8日更新</p>
            <table class="mdTable3 type4">
              <tr>
                <td><dl><dt>西横綱</dt><dd><img alt="おおのさと" /></dd></dl></td>
                <td><span class="fnt16">初日から休場いたします。</span></td>
              </tr>
              <tr>
                <td><dl><dt>西大関</dt><dd><img alt="あおにしき" /></dd></dl></td>
                <td><span class="fnt16">初日から休場いたします。</span></td>
              </tr>
            </table>
            <span class="dayNum fnt16">幕下以下</span>
            <table class="mdTable3 type4">
              <tr>
                <td><dl><dt>東幕下</dt><dd><img alt="対象外" /></dd></dl></td>
                <td><span class="fnt16">初日から休場いたします。</span></td>
              </tr>
            </table>
          </body>
        </html>
        """
        self.rosters = {
            "makuuchi": {
                3842: {
                    "id": 3842,
                    "name": "豊昇龍",
                    "yomi": "ほうしょうりゅう",
                    "rankText": "東横綱",
                    "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
                },
                4227: {
                    "id": 4227,
                    "name": "大の里",
                    "yomi": "おおのさと",
                    "rankText": "西横綱",
                    "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/",
                },
                4191: {
                    "id": 4191,
                    "name": "藤ノ川",
                    "yomi": "ふじのかわ",
                    "rankText": "東前頭十四",
                    "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
                },
            },
            "juryo": {
                4230: {
                    "id": 4230,
                    "name": "安青錦",
                    "yomi": "あおにしき",
                    "rankText": "西大関",
                    "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/",
                },
            },
        }

    def test_parses_and_resolves_official_makuuchi_juryo_absences(self) -> None:
        report = MODULE.parse_absence_html(self.html)
        absence_lookup = MODULE.resolve_official_absences(report["entries"], self.rosters)

        makuuchi_names = [entry["name"] for entry in absence_lookup["makuuchi"]]
        juryo_names = [entry["name"] for entry in absence_lookup["juryo"]]

        self.assertEqual(report["updatedAt"], "2026-05-11 10:00:07")
        self.assertEqual(makuuchi_names, ["豊昇龍", "大の里"])
        self.assertEqual(juryo_names, ["安青錦"])
        self.assertEqual(absence_lookup["makuuchi"][0]["startDay"], 2)
        self.assertEqual(absence_lookup["makuuchi"][1]["startDay"], 1)

    def test_uses_start_day_when_deriving_daily_absentees(self) -> None:
        report = MODULE.parse_absence_html(self.html)
        absence_lookup = MODULE.resolve_official_absences(report["entries"], self.rosters)

        day1 = MODULE.derive_absentees("makuuchi", 1, absence_lookup)
        day2 = MODULE.derive_absentees("makuuchi", 2, absence_lookup)

        self.assertEqual([entry["name"] for entry in day1], ["大の里"])
        self.assertEqual([entry["name"] for entry in day2], ["豊昇龍", "大の里"])

    def test_removed_official_entries_are_not_derived_as_absent(self) -> None:
        html = self.html.replace(
            """
              <tr>
                <td><dl><dt>東横綱</dt><dd><img alt="ほうしょうりゅう" /></dd></dl></td>
                <td><span class="fnt16">二日目から休場いたします。</span></td>
              </tr>
            """,
            "",
        )
        report = MODULE.parse_absence_html(html)
        absence_lookup = MODULE.resolve_official_absences(report["entries"], self.rosters)

        self.assertNotIn("豊昇龍", [entry["name"] for entry in MODULE.derive_absentees("makuuchi", 2, absence_lookup)])

    def test_marks_opponent_as_fusen_winner_for_absent_scheduled_match(self) -> None:
        division_day = {
            "matches": [
                {
                    "boutNo": 20,
                    "eastName": "豊昇龍",
                    "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
                    "westName": "藤ノ川",
                    "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
                    "kimarite": "未定",
                    "winner": None,
                }
            ]
        }
        absentees = [
            {
                "id": 3842,
                "name": "豊昇龍",
                "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
            }
        ]

        updated = MODULE.apply_absence_results(division_day, absentees)

        self.assertEqual(updated["matches"][0]["kimarite"], "不戦")
        self.assertEqual(updated["matches"][0]["winner"], "west")


class TorikumiSubstantiveDiffTest(unittest.TestCase):
    def make_dataset(
        self,
        *,
        updated_at: str,
        result_kimarite: str = "押し出し",
        result_winner: str | None = "east",
        schedule_kimarite: str = "未定",
        schedule_winner: str | None = None,
        absentees: list[int] | None = None,
    ) -> dict:
        absentees = absentees or [4227]
        absentee_entries = [
            {
                "id": rikishi_id,
                "name": f"力士{rikishi_id}",
                "profileUrl": f"https://www.sumo.or.jp/ResultRikishiData/profile/{rikishi_id}/",
            }
            for rikishi_id in absentees
        ]
        base_match = {
            "division": "幕内",
            "boutNo": 20,
            "eastName": "豊昇龍",
            "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
            "westName": "藤ノ川",
            "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
        }
        result_match = {**base_match, "kimarite": result_kimarite, "winner": result_winner}
        schedule_match = {**base_match, "kimarite": schedule_kimarite, "winner": schedule_winner}
        return {
            "bashoName": "五月場所",
            "year": "令和八年",
            "updatedAt": updated_at,
            "resultUpdatedAt": updated_at,
            "scheduleUpdatedAt": updated_at,
            "today": {
                "makuuchi": {
                    "day": 2,
                    "division": "幕内",
                    "matches": [result_match],
                    "absentees": absentee_entries,
                },
                "juryo": {
                    "day": 2,
                    "division": "十両",
                    "matches": [],
                    "absentees": [],
                },
            },
            "tomorrow": {
                "makuuchi": {
                    "day": 3,
                    "division": "幕内",
                    "matches": [],
                    "absentees": absentee_entries,
                },
                "juryo": {
                    "day": 3,
                    "division": "十両",
                    "matches": [],
                    "absentees": [],
                },
            },
            "resultDays": [
                {
                    "day": 2,
                    "pathDate": "20260511",
                    "status": "published",
                    "statusMessage": None,
                    "data": {
                        "makuuchi": {
                            "day": 2,
                            "division": "幕内",
                            "matches": [result_match],
                            "absentees": absentee_entries,
                        },
                        "juryo": {
                            "day": 2,
                            "division": "十両",
                            "matches": [],
                            "absentees": [],
                        },
                    },
                }
            ],
            "scheduleDays": [
                {
                    "day": 2,
                    "pathDate": "20260511",
                    "status": "published",
                    "statusMessage": None,
                    "data": {
                        "makuuchi": {
                            "day": 2,
                            "division": "幕内",
                            "matches": [schedule_match],
                            "absentees": absentee_entries,
                        },
                        "juryo": {
                            "day": 2,
                            "division": "十両",
                            "matches": [],
                            "absentees": [],
                        },
                    },
                }
            ],
        }

    def test_ignores_timestamp_only_changes(self) -> None:
        existing = self.make_dataset(updated_at="2026-05-11T10:00:00+09:00")
        candidate = self.make_dataset(updated_at="2026-05-11T10:05:00+09:00")

        self.assertFalse(MODULE.has_substantive_torikumi_diff(candidate, existing))

    def test_detects_result_winner_change(self) -> None:
        existing = self.make_dataset(updated_at="2026-05-11T10:00:00+09:00")
        candidate = self.make_dataset(
            updated_at="2026-05-11T10:05:00+09:00",
            result_kimarite="不戦",
            result_winner="west",
        )

        self.assertTrue(MODULE.has_substantive_torikumi_diff(candidate, existing))

    def test_detects_absentee_change(self) -> None:
        existing = self.make_dataset(updated_at="2026-05-11T10:00:00+09:00", absentees=[4227])
        candidate = self.make_dataset(updated_at="2026-05-11T10:05:00+09:00", absentees=[4230])

        self.assertTrue(MODULE.has_substantive_torikumi_diff(candidate, existing))

    def test_detects_schedule_fusen_change(self) -> None:
        existing = self.make_dataset(updated_at="2026-05-11T10:00:00+09:00")
        candidate = self.make_dataset(
            updated_at="2026-05-11T10:05:00+09:00",
            schedule_kimarite="不戦",
            schedule_winner="west",
        )

        self.assertTrue(MODULE.has_substantive_torikumi_diff(candidate, existing))

    def test_preserves_existing_timestamps_when_no_substantive_diff(self) -> None:
        existing = self.make_dataset(updated_at="2026-05-11T10:00:00+09:00")
        candidate = self.make_dataset(updated_at="2026-05-11T10:05:00+09:00")

        merged, changed = MODULE.preserve_torikumi_timestamps_if_unchanged(candidate, existing)

        self.assertFalse(changed)
        self.assertEqual(merged["updatedAt"], existing["updatedAt"])
        self.assertEqual(merged["resultUpdatedAt"], existing["resultUpdatedAt"])
        self.assertEqual(merged["scheduleUpdatedAt"], existing["scheduleUpdatedAt"])


class ResolveCurrentBashoDayTest(unittest.TestCase):
    def test_uses_calendar_day_when_banzuke_metadata_is_stale(self) -> None:
        self.assertEqual(
            MODULE.resolve_current_basho_day(date(2026, 5, 10), 1, date(2026, 5, 11)),
            2,
        )


if __name__ == "__main__":
    unittest.main()
