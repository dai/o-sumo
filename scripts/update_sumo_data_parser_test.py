import importlib.util
import pathlib
import unittest
from datetime import date
from unittest import mock


SPEC = importlib.util.spec_from_file_location(
    "update_sumo_data",
    pathlib.Path(__file__).with_name("update_sumo_data.py"),
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


def _make_json_response(payload: bytes = b'{"Result":"1"}'):
    class DummyResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self) -> bytes:
            return payload

    return DummyResponse()


class ParseProfileHtmlTest(unittest.TestCase):
    def test_keeps_shusshin_from_exact_label_without_related_list_override(self) -> None:
        html = """
        <meta property="og:image" content="https://www.sumo.or.jp/images/rikishi/3842.jpg" />
        <table>
          <tr><th>生年月日</th><td>昭和62年5月11日（38歳）</td></tr>
          <tr><th>出身地</th><td>熊本県熊本市東区</td></tr>
          <tr><th>身長</th><td>183.0cm</td></tr>
          <tr><th>体重</th><td>146.0kg</td></tr>
          <tr><th>初土俵</th><td>平成十五年三月場所</td></tr>
          <tr><th>通算成績</th><td>523勝410敗12休</td></tr>
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
        self.assertEqual(profile["careerStats"], {"wins": 523, "losses": 410, "draws": 12})
        self.assertEqual(profile["photoUrl"], "https://www.sumo.or.jp/images/rikishi/3842.jpg")


class PostJsonRequestHeadersTest(unittest.TestCase):
    def test_torikumi_ajax_request_sets_mischeief_cookie(self) -> None:
        captured = {}

        def fake_urlopen(request, timeout=30):
            captured["headers"] = dict(request.header_items())
            return _make_json_response()

        with mock.patch.object(MODULE, "urlopen", side_effect=fake_urlopen):
            MODULE.post_json("/ResultData/torikumiAjax/1/8/", {"basho_id": "635", "kakuzuke_id": "1", "day": "8"})

        self.assertEqual(captured["headers"].get("Cookie"), "mischeief=OK")
        self.assertEqual(
            captured["headers"].get("Referer"),
            f"{MODULE.REQUEST_BASE_URL}/ResultData/torikumi/1/8/",
        )

    def test_banzuke_ajax_request_sets_and_mouse_cookie(self) -> None:
        captured = {}

        def fake_urlopen(request, timeout=30):
            captured["headers"] = dict(request.header_items())
            return _make_json_response()

        with mock.patch.object(MODULE, "urlopen", side_effect=fake_urlopen):
            MODULE.post_json(
                "/ResultBanzuke/tableAjax/1/1/",
                {"kakuzuke_id": "1", "basho_id": "636", "page": "1"},
            )

        self.assertEqual(captured["headers"].get("Cookie"), "and=mouse")
        self.assertEqual(
            captured["headers"].get("Referer"),
            f"{MODULE.REQUEST_BASE_URL}/ResultBanzuke/table/",
        )

    def test_hoshitori_ajax_request_sets_game_cat_cookie(self) -> None:
        captured = {}

        def fake_urlopen(request, timeout=30):
            captured["headers"] = dict(request.header_items())
            return _make_json_response()

        with mock.patch.object(MODULE, "urlopen", side_effect=fake_urlopen):
            MODULE.post_json(
                "/ResultData/hoshitoriAjax/1/1/",
                {"kakuzuke_id": "1", "ew_flg": "1"},
            )

        self.assertEqual(captured["headers"].get("Cookie"), "game=cat")
        self.assertEqual(
            captured["headers"].get("Referer"),
            f"{MODULE.REQUEST_BASE_URL}/ResultData/hoshitori/1/1/",
        )


class LoadBanzukeMetaRequestTest(unittest.TestCase):
    def test_uses_basho_id_from_page_context(self) -> None:
        captured = {}

        def fake_post_json(path, payload):
            captured["path"] = path
            captured["payload"] = payload
            return {"Result": "1"}

        with mock.patch.object(MODULE, "post_json", side_effect=fake_post_json):
            with mock.patch.object(MODULE, "load_banzuke_context", return_value={"basho_id": 636}):
                MODULE.load_banzuke_meta(2)

        self.assertEqual(captured["path"], "/ResultBanzuke/tableAjax/2/1/")
        self.assertEqual(
            captured["payload"],
            {"kakuzuke_id": "2", "basho_id": "636", "page": "1"},
        )


class ParseTorikumiMatchTest(unittest.TestCase):
    def test_keeps_pending_blank_kimarite_empty(self) -> None:
        match = MODULE.parse_torikumi_match(
            {
                "judge": 9,
                "technic_name": "",
                "east": {"shikona": "豊昇龍", "rikishi_id": 3842},
                "west": {"shikona": "藤ノ川", "rikishi_id": 4191},
            },
            "幕内",
            1,
        )

        self.assertIsNone(match["winner"])
        self.assertEqual(match["kimarite"], "")

    def test_uses_pending_label_when_winner_exists_without_kimarite(self) -> None:
        match = MODULE.parse_torikumi_match(
            {
                "judge": 1,
                "technic_name": "",
                "east": {"shikona": "豊昇龍", "rikishi_id": 3842},
                "west": {"shikona": "藤ノ川", "rikishi_id": 4191},
            },
            "幕内",
            1,
        )

        self.assertEqual(match["winner"], "east")
        self.assertEqual(match["kimarite"], "未定")


class LoadDivisionRikishiFallbackTest(unittest.TestCase):
    def test_uses_local_banzuke_when_remote_banzuke_fetch_fails(self) -> None:
        with mock.patch.object(MODULE, "load_banzuke_meta", side_effect=RuntimeError("boom")):
            rikishi = MODULE.load_division_rikishi(1)

        self.assertIn(3761, rikishi)
        self.assertEqual(rikishi[3761]["name"], "若隆景")

    def test_uses_local_banzuke_when_remote_banzuke_is_empty(self) -> None:
        with mock.patch.object(MODULE, "load_banzuke_meta", return_value={"BanzukeTable": []}):
            rikishi = MODULE.load_division_rikishi(2)

        self.assertIn(3334, rikishi)
        self.assertEqual(rikishi[3334]["name"], "白鷹山")


class OfficialBashoScheduleTest(unittest.TestCase):
    def test_extracts_july_2026_start_date_from_annual_schedule(self) -> None:
        html = """
        <h3>令和8年 本場所日程</h3>
        <p>場所 会場 前売り開始日 番付発表 初日 千秋楽</p>
        <p>五月場所 国技館 令和8年 4/4(土) 令和8年 4/27(月) 令和8年 5/10(日) 5/24(日)</p>
        <p>七月場所 ＩＧアリーナ 令和8年 5/16(土) 令和8年 6/29(月) 令和8年 7/12(日) 7/26(日)</p>
        """

        start_date = MODULE.extract_official_basho_start_date(html, "令和八年", "七月場所")

        self.assertEqual(start_date, date(2026, 7, 12))

    def test_load_start_date_falls_back_when_schedule_fetch_fails(self) -> None:
        with mock.patch.object(MODULE, "urlopen", side_effect=OSError("offline")):
            start_date = MODULE.load_official_basho_start_date("令和八年", "七月場所")

        self.assertIsNone(start_date)

    def test_infers_start_date_from_existing_schedule_day_one(self) -> None:
        start_date = MODULE.infer_start_date_from_existing_torikumi(
            {
                "scheduleDays": [
                    {"day": 1, "pathDate": "20260712"},
                ],
                "resultDays": [],
            }
        )

        self.assertEqual(start_date, date(2026, 7, 12))

    def test_returns_zero_day_before_official_start(self) -> None:
        start_date = date(2026, 7, 12)

        self.assertEqual(
            MODULE.determine_current_basho_day(start_date, today=date(2026, 6, 29)),
            0,
        )
        self.assertEqual(
            MODULE.determine_current_basho_day(start_date, today=date(2026, 7, 12)),
            1,
        )
        self.assertEqual(
            MODULE.determine_current_basho_day(start_date, today=date(2026, 7, 26)),
            15,
        )
        self.assertEqual(
            MODULE.determine_current_basho_day(start_date, today=date(2026, 7, 30)),
            15,
        )

    def test_schedule_scope_fetches_day_one_before_official_start(self) -> None:
        self.assertEqual(
            MODULE.resolve_torikumi_fetch_days(
                torikumi_only=True,
                scope="schedule",
                current_day=0,
                existing_torikumi=None,
            ),
            {1},
        )
        self.assertIsNone(
            MODULE.resolve_torikumi_fetch_days(
                torikumi_only=True,
                scope="result",
                current_day=0,
                existing_torikumi={"resultDays": []},
            )
        )
        self.assertEqual(
            MODULE.resolve_torikumi_fetch_days(
                torikumi_only=True,
                scope="result",
                current_day=3,
                existing_torikumi={"resultDays": []},
            ),
            {2, 3},
        )

    def test_explicit_fetch_days_run_before_official_start(self) -> None:
        calls = []

        def fake_try_load_torikumi_day(basho_id, day, kakuzuke_id, *, expected_unpublished=False):
            calls.append((basho_id, day, kakuzuke_id, expected_unpublished))
            return None

        with mock.patch.object(MODULE, "load_division_rikishi", return_value={}):
            with mock.patch.object(MODULE, "try_load_torikumi_day", side_effect=fake_try_load_torikumi_day):
                MODULE.build_torikumi_dataset(
                    636,
                    0,
                    "2026-07-11T13:00:00+09:00",
                    None,
                    fetch_days={1},
                    official_start_date=date(2026, 7, 12),
                )

        self.assertEqual(
            calls,
            [
                (636, 1, 1, True),
                (636, 1, 2, True),
            ],
        )

    def test_strict_fetch_raises_on_unexpected_fetch_failures(self) -> None:
        with mock.patch.object(MODULE, "load_division_rikishi", return_value={}):
            with mock.patch.object(MODULE, "try_load_torikumi_day", return_value=None):
                with self.assertRaisesRegex(RuntimeError, "strict torikumi fetch check failed"):
                    MODULE.build_torikumi_dataset(
                        636,
                        3,
                        "2026-07-12T13:00:00+09:00",
                        None,
                        fetch_days={2, 3},
                        strict_fetch=True,
                    )

    def test_strict_fetch_allows_unpublished_days(self) -> None:
        with mock.patch.object(MODULE, "load_division_rikishi", return_value={}):
            with mock.patch.object(MODULE, "try_load_torikumi_day", return_value=None):
                payload = MODULE.build_torikumi_dataset(
                    636,
                    0,
                    "2026-07-11T13:00:00+09:00",
                    None,
                    fetch_days={1},
                    official_start_date=date(2026, 7, 12),
                    strict_fetch=True,
                )
        self.assertIn("resultDays", payload)


class DeriveAbsenteesTest(unittest.TestCase):
    def test_derives_absentees_from_roster_minus_active_ids(self) -> None:
        division_day = {
            "matches": [
                {
                    "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
                    "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
                }
            ]
        }
        roster = {
            3842: {"id": 3842, "name": "豊昇龍", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"},
            4191: {"id": 4191, "name": "藤ノ川", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/"},
            4227: {"id": 4227, "name": "大の里", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"},
        }

        absentees = MODULE.derive_absentees(division_day, roster)
        self.assertEqual([entry["id"] for entry in absentees], [4227])

    def test_cross_division_active_ids_are_respected(self) -> None:
        division_day = {"matches": [{"eastProfileUrl": "", "westProfileUrl": ""}]}
        roster = {
            4230: {"id": 4230, "name": "安青錦", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"},
        }

        absentees = MODULE.derive_absentees(division_day, roster, {4230})
        self.assertEqual(absentees, [])

    def test_build_dataset_uses_daywide_active_ids_for_juryo_promotion(self) -> None:
        makuuchi_roster = {
            3761: {"id": 3761, "name": "若隆景", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/"},
            4001: {"id": 4001, "name": "幕内出場", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4001/"},
        }
        juryo_roster = {
            3334: {"id": 3334, "name": "白鷹山", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/"},
            4101: {"id": 4101, "name": "十両繰り上げ", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/"},
            4102: {"id": 4102, "name": "十両出場", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4102/"},
        }

        def load_roster(kakuzuke_id: int) -> dict[int, dict]:
            return makuuchi_roster if kakuzuke_id == 1 else juryo_roster

        def load_day(_basho_id: int, day: int, kakuzuke_id: int, *, expected_unpublished: bool) -> dict | None:
            if day != 1:
                return None
            if kakuzuke_id == 1:
                return {
                    "day": 1,
                    "dayName": "取組日 初日",
                    "dayHead": "初日： 令和8年7月12日(日)",
                    "division": "幕内",
                    "matches": [
                        {
                            "division": "幕内",
                            "boutNo": 1,
                            "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4001/",
                            "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
                            "kimarite": "",
                            "winner": "east",
                        }
                    ],
                    "absentees": [],
                }
            return {
                "day": 1,
                "dayName": "取組日 初日",
                "dayHead": "初日： 令和8年7月12日(日)",
                "division": "十両",
                "matches": [
                    {
                        "division": "十両",
                        "boutNo": 1,
                        "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4102/",
                        "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4002/",
                        "kimarite": "",
                        "winner": "east",
                    }
                ],
                "absentees": [],
            }

        with mock.patch.object(MODULE, "load_division_rikishi", side_effect=load_roster):
            with mock.patch.object(MODULE, "try_load_torikumi_day", side_effect=load_day):
                payload = MODULE.build_torikumi_dataset(
                    636,
                    1,
                    "2026-07-12T13:00:00+09:00",
                    None,
                    fetch_days={1},
                    official_start_date=date(2026, 7, 12),
                )

        result_day = payload["resultDays"][0]["data"]
        self.assertEqual([entry["name"] for entry in result_day["makuuchi"]["absentees"]], ["若隆景"])
        self.assertEqual([entry["name"] for entry in result_day["juryo"]["absentees"]], ["白鷹山"])

    def test_returns_existing_absentees_when_roster_unavailable(self) -> None:
        division_day = {
            "matches": [{"eastProfileUrl": "", "westProfileUrl": ""}],
            "absentees": [{"id": 1, "name": "既存", "profileUrl": "https://example.test/profile/1/"}],
        }
        self.assertEqual(MODULE.derive_absentees(division_day, {}), division_day["absentees"])


class ApplyTorikumiScopeTest(unittest.TestCase):
    def test_result_scope_preserves_existing_schedule_summary(self) -> None:
        existing = {
            "updatedAt": "2026-07-10T13:30:00+09:00",
            "resultUpdatedAt": "2026-06-29T16:26:01+09:00",
            "scheduleUpdatedAt": "2026-07-10T13:30:00+09:00",
            "today": None,
            "tomorrow": {"makuuchi": {"matches": [{"kimarite": ""}]}},
            "resultDays": [{"pathDate": "20260712"}],
            "scheduleDays": [{"pathDate": "20260712", "data": {"makuuchi": {"matches": [{"kimarite": ""}]}}}],
        }
        candidate = {
            **existing,
            "updatedAt": "2026-07-11T13:00:00+09:00",
            "resultUpdatedAt": "2026-07-11T13:00:00+09:00",
            "scheduleUpdatedAt": "2026-07-11T13:00:00+09:00",
            "tomorrow": {"makuuchi": {"matches": [{"kimarite": "未定"}]}},
            "scheduleDays": [{"pathDate": "20260712", "data": {"makuuchi": {"matches": [{"kimarite": "未定"}]}}}],
        }

        merged = MODULE.apply_torikumi_scope(candidate, "result", existing)

        self.assertEqual(merged["tomorrow"], existing["tomorrow"])
        self.assertEqual(merged["scheduleDays"], existing["scheduleDays"])
        self.assertEqual(merged["scheduleUpdatedAt"], existing["scheduleUpdatedAt"])

    def test_result_scope_preserves_existing_results_when_candidate_has_no_published_results(self) -> None:
        existing = {
            "updatedAt": "2026-07-10T13:30:00+09:00",
            "resultUpdatedAt": "2026-06-29T16:26:01+09:00",
            "scheduleUpdatedAt": "2026-07-10T13:30:00+09:00",
            "today": {"makuuchi": {"matches": [{"kimarite": ""}]}},
            "tomorrow": None,
            "resultDays": [{"pathDate": "20260712", "status": "published"}],
            "scheduleDays": [{"pathDate": "20260712"}],
        }
        candidate = {
            **existing,
            "updatedAt": "2026-07-11T13:00:00+09:00",
            "resultUpdatedAt": "2026-07-11T13:00:00+09:00",
            "today": None,
            "resultDays": [{"pathDate": "20260712", "status": "pending"}],
        }

        merged = MODULE.apply_torikumi_scope(candidate, "result", existing)

        self.assertEqual(merged["today"], existing["today"])
        self.assertEqual(merged["resultDays"], existing["resultDays"])
        self.assertEqual(merged["resultUpdatedAt"], existing["resultUpdatedAt"])

    def test_schedule_scope_preserves_existing_result_summary(self) -> None:
        existing = {
            "updatedAt": "2026-07-13T18:00:00+09:00",
            "resultUpdatedAt": "2026-07-13T18:00:00+09:00",
            "scheduleUpdatedAt": "2026-07-13T13:00:00+09:00",
            "today": {"makuuchi": {"matches": [{"winner": "east"}]}},
            "tomorrow": None,
            "resultDays": [{"pathDate": "20260712", "data": {"makuuchi": {"matches": [{"winner": "east"}]}}}],
            "scheduleDays": [{"pathDate": "20260712"}],
        }
        candidate = {**existing, "today": None, "resultDays": [{"pathDate": "20260712", "data": {"makuuchi": {"matches": []}}}]}

        merged = MODULE.apply_torikumi_scope(candidate, "schedule", existing)

        self.assertEqual(merged["today"], existing["today"])
        self.assertEqual(merged["resultDays"], existing["resultDays"])
        self.assertEqual(merged["resultUpdatedAt"], existing["resultUpdatedAt"])


class TorikumiSubstantiveDiffTest(unittest.TestCase):
    def make_dataset(
        self,
        *,
        updated_at: str,
        result_kimarite: str = "押し出し",
        result_winner: str | None = "east",
        schedule_kimarite: str = "",
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
            MODULE.determine_current_basho_day(date(2026, 5, 10), date(2026, 5, 11)),
            2,
        )


if __name__ == "__main__":
    unittest.main()
