import importlib.util
import json
import pathlib
import tempfile
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


def _profile_history_html(
    shikona_history: str,
    place: str,
    opponents: list[str],
    outcomes: list[str],
    *,
    duplicate: bool = False,
    place_shikona: str | None = None,
) -> str:
    day_labels = [f"{day}日目" for day in range(1, 16)]
    current_shikona = shikona_history.split("→")[-1].strip()
    opponent_cells = "".join(f"<td>{opponent}</td>" for opponent in opponents)
    outcome_cells = "".join(
        f'<td><img src="/result.gif" alt="{outcome}"></td>'
        for outcome in outcomes
    )
    history_rows = f"""
      <tr>
        <td class="player" rowspan="2">
          <div class="box">
            <span>{place}</span><span>東前頭筆頭</span><span>{place_shikona or current_shikona}&nbsp;太郎</span>
          </div>
        </td>
        {outcome_cells}
      </tr>
      <tr class="name">{opponent_cells}</tr>
    """
    if duplicate:
        history_rows += history_rows
    return f"""
      <table class="mdTable2">
        <tr><th>しこ名履歴</th><td>{shikona_history}</td></tr>
        <tr><th>生年月日</th><td>平成13年6月25日</td></tr>
      </table>
      <table class="main">
        <tr><th></th>{''.join(f'<th>{label}</th>' for label in day_labels)}</tr>
        {history_rows}
      </table>
    """


def _active_rikishi(rikishi_id: int, name: str) -> dict:
    return {
        "id": rikishi_id,
        "name": name,
        "yomi": "",
        "currentRank": "前頭",
        "profileUrl": f"https://www.sumo.or.jp/ResultRikishiData/profile/{rikishi_id}/",
    }


def _single_bout_history_html(
    shikona_history: str,
    place: str,
    day: int,
    opponent: str,
    outcome: str,
    *,
    place_shikona: str | None = None,
) -> str:
    opponents = [""] * 15
    outcomes = [""] * 15
    opponents[day - 1] = opponent
    outcomes[day - 1] = outcome
    return _profile_history_html(
        shikona_history,
        place,
        opponents,
        outcomes,
        place_shikona=place_shikona,
    )


def _make_json_response(payload: bytes = b'{"Result":"1"}'):
    class DummyResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self) -> bytes:
            return payload

    return DummyResponse()


def _official_torikumi_match(
    label: str,
    east_kaku_id: int,
    west_kaku_id: int,
    rikishi_id: int,
) -> dict:
    return {
        "judge": 9,
        "technic_name": "",
        "east": {
            "shikona": f"{label}東",
            "shikona_kana": "",
            "shikona_eng": f"{label} east",
            "banzuke_name": "前頭",
            "rikishi_id": rikishi_id,
            "kaku_id": east_kaku_id,
        },
        "west": {
            "shikona": f"{label}西",
            "shikona_kana": "",
            "shikona_eng": f"{label} west",
            "banzuke_name": "前頭",
            "rikishi_id": rikishi_id + 100,
            "kaku_id": west_kaku_id,
        },
    }


def _official_makuuchi_payload_with_mixed_bout() -> dict:
    mixed_bout = _official_torikumi_match("混合", 1, 2, 1000)
    pure_makuuchi_bouts = [
        _official_torikumi_match(f"幕内{bout_no}", 1, 1, 1000 + bout_no)
        for bout_no in range(1, 21)
    ]
    return {
        "Result": "1",
        "dayName": "取組日 初日",
        "dayHead": "初日： 令和8年7月12日(日)",
        "TorikumiData": [mixed_bout, *pure_makuuchi_bouts],
        "FinalMuch": [],
    }


class ParseProfileHtmlTest(unittest.TestCase):
    def test_parses_shikona_history_and_settled_bout_history(self) -> None:
        html = _profile_history_html(
            "草野 → 義ノ富士",
            "令和七年五月場所",
            ["安青錦", "大の里", "休場相手", "取組なし", *([""] * 11)],
            ["白丸", "黒丸", "やすみ", "－", *([""] * 11)],
        )

        profile = MODULE.parse_profile_html(html)

        self.assertIsNotNone(profile)
        assert profile is not None
        self.assertEqual(profile["shikonaHistory"], ["草野", "義ノ富士"])
        self.assertEqual(
            profile["boutHistory"],
            [
                {
                    "place": "令和七年五月場所",
                    "day": 1,
                    "opponent": "安青錦",
                    "outcome": "win",
                },
                {
                    "place": "令和七年五月場所",
                    "day": 2,
                    "opponent": "大の里",
                    "outcome": "loss",
                },
            ],
        )

    def test_deduplicates_repeated_history_markup_by_place_and_day(self) -> None:
        html = _profile_history_html(
            "安青錦",
            "令和七年五月場所",
            ["草野", *([""] * 14)],
            ["白丸", *([""] * 14)],
            duplicate=True,
        )

        profile = MODULE.parse_profile_html(html)

        self.assertIsNotNone(profile)
        assert profile is not None
        self.assertEqual(len(profile["boutHistory"]), 1)

    def test_parses_current_lifetime_record_label(self) -> None:
        html = """
        <dl>
          <dt>生涯戦歴</dt>
          <dd>401勝235敗34休（51場所）</dd>
          <dt>幕内戦歴</dt>
          <dd>319勝187敗34休（36場所）</dd>
        </dl>
        <table>
          <tr><th>生年月日</th><td>平成11年5月22日（27歳）</td></tr>
        </table>
        """

        profile = MODULE.parse_profile_html(html)

        self.assertIsNotNone(profile)
        assert profile is not None
        self.assertEqual(profile["careerStats"], {"wins": 401, "losses": 235, "draws": 34})

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


class BuildRikishiMatchupsTest(unittest.TestCase):
    def test_ignores_reused_name_when_active_owner_did_not_use_it_at_that_place(self) -> None:
        active = [_active_rikishi(100, "現役一"), _active_rikishi(200, "現役二")]
        profiles = {
            100: {
                "shikonaHistory": ["現役一"],
                "shikonaByPlace": {"平成二十四年七月場所": "現役一"},
                "boutHistory": [
                    {
                        "place": "平成二十四年七月場所",
                        "day": 1,
                        "opponent": "再利用名",
                        "outcome": "win",
                    }
                ],
            },
            200: {
                "debut": "平成二十八年三月場所",
                "shikonaHistory": ["再利用名", "現役二"],
                "shikonaByPlace": {"平成二十八年三月場所": "再利用名"},
                "boutHistory": [
                    {
                        "place": "平成二十八年三月場所",
                        "day": 1,
                        "opponent": "引退力士",
                        "outcome": "loss",
                    }
                ],
            },
        }

        self.assertEqual(MODULE.build_rikishi_matchup_records(active, profiles), [])

    def test_ignores_opponents_outside_active_roster(self) -> None:
        active = [_active_rikishi(100, "現役一"), _active_rikishi(200, "現役二")]
        profiles = {
            100: {
                "shikonaHistory": ["現役一"],
                "shikonaByPlace": {"第一場所": "現役一"},
                "boutHistory": [
                    {"place": "第一場所", "day": 1, "opponent": "引退一", "outcome": "win"}
                ],
            },
            200: {
                "shikonaHistory": ["現役二"],
                "shikonaByPlace": {"第二場所": "現役二"},
                "boutHistory": [
                    {"place": "第二場所", "day": 1, "opponent": "引退二", "outcome": "loss"}
                ],
            },
        }

        self.assertEqual(MODULE.build_rikishi_matchup_records(active, profiles), [])

    def test_resolves_reused_historical_alias_by_place(self) -> None:
        active = [
            _active_rikishi(100, "新一"),
            _active_rikishi(200, "新二"),
            _active_rikishi(300, "対戦者"),
        ]
        profiles = {
            100: MODULE.parse_profile_html(
                _single_bout_history_html(
                    "同名 → 新一", "旧場所", 1, "対戦者", "黒丸", place_shikona="同名"
                )
            ),
            200: MODULE.parse_profile_html(
                _single_bout_history_html(
                    "同名 → 新二", "新場所", 1, "引退力士", "白丸", place_shikona="同名"
                )
            ),
            300: MODULE.parse_profile_html(
                _single_bout_history_html("対戦者", "旧場所", 1, "同名", "白丸")
            ),
        }

        records = MODULE.build_rikishi_matchup_records(active, profiles)

        self.assertEqual(
            records,
            [
                {
                    "rikishi1Id": 100,
                    "rikishi2Id": 300,
                    "rikishi1Wins": 0,
                    "rikishi2Wins": 1,
                }
            ],
        )

    def test_resolves_historical_shikona_and_normalizes_pair_order(self) -> None:
        active = [_active_rikishi(4279, "義ノ富士"), _active_rikishi(4230, "安青錦")]
        profiles = {
            4230: MODULE.parse_profile_html(
                _profile_history_html(
                    "安青錦",
                    "令和七年五月場所",
                    ["草野", *([""] * 14)],
                    ["白丸", *([""] * 14)],
                )
            ),
            4279: MODULE.parse_profile_html(
                _profile_history_html(
                    "草野 → 義ノ富士",
                    "令和七年五月場所",
                    ["安青錦", *([""] * 14)],
                    ["黒丸", *([""] * 14)],
                    place_shikona="草野",
                )
            ),
        }

        records = MODULE.build_rikishi_matchup_records(active, profiles)

        self.assertEqual(
            records,
            [
                {
                    "rikishi1Id": 4230,
                    "rikishi2Id": 4279,
                    "rikishi1Wins": 1,
                    "rikishi2Wins": 0,
                }
            ],
        )

    def test_rejects_conflicting_mirrored_bout_results(self) -> None:
        active = [_active_rikishi(4230, "安青錦"), _active_rikishi(4279, "義ノ富士")]
        profiles = {
            4230: MODULE.parse_profile_html(
                _profile_history_html(
                    "安青錦",
                    "令和七年五月場所",
                    ["義ノ富士", *([""] * 14)],
                    ["白丸", *([""] * 14)],
                )
            ),
            4279: MODULE.parse_profile_html(
                _profile_history_html(
                    "草野 → 義ノ富士",
                    "令和七年五月場所",
                    ["安青錦", *([""] * 14)],
                    ["白丸", *([""] * 14)],
                )
            ),
        }

        with self.assertRaisesRegex(MODULE.MatchupDataError, "Conflicting mirrored bout"):
            MODULE.build_rikishi_matchup_records(active, profiles)

    def test_representative_official_fixture_produces_one_five_from_4230(self) -> None:
        active = [_active_rikishi(4230, "安青錦"), _active_rikishi(4279, "義ノ富士")]
        official_bouts = [
            ("令和六年五月場所", 11, "草野", "黒丸"),
            ("令和七年七月場所", 14, "草野", "黒丸"),
            ("令和七年十一月場所", 11, "義ノ富士", "黒丸"),
            ("令和八年一月場所", 2, "義ノ富士", "白丸"),
            ("令和八年三月場所", 2, "義ノ富士", "黒丸"),
            ("令和八年七月場所", 4, "義ノ富士", "黒丸"),
        ]
        profiles = {
            4230: MODULE.parse_profile_html(
                "".join(
                    _single_bout_history_html("安青錦", place, day, opponent, outcome)
                    for place, day, opponent, outcome in official_bouts
                )
            ),
            4279: MODULE.parse_profile_html(
                "".join(
                    _single_bout_history_html(
                        "草野 → 義ノ富士",
                        place,
                        day,
                        "安青錦",
                        "白丸" if outcome == "黒丸" else "黒丸",
                        place_shikona=_opponent,
                    )
                    for place, day, _opponent, outcome in official_bouts
                )
            ),
        }

        records = MODULE.build_rikishi_matchup_records(active, profiles)

        self.assertEqual(records[0]["rikishi1Wins"], 1)
        self.assertEqual(records[0]["rikishi2Wins"], 5)


class GenerateRikishiMatchupsTest(unittest.TestCase):
    def test_all_active_observations_skipped_preserves_previous_file_byte_for_byte(self) -> None:
        active = [_active_rikishi(100, "現役一"), _active_rikishi(200, "現役二")]
        profiles = {
            100: {
                "debut": "令和元年一月場所",
                "shikonaHistory": ["現役一"],
                "shikonaByPlace": {},
                "boutHistory": [
                    {"place": "令和二年一月場所", "day": 1, "opponent": "現役二", "outcome": "win"}
                ],
            },
            200: {
                "debut": "令和元年一月場所",
                "shikonaHistory": ["現役二"],
                "shikonaByPlace": {},
                "boutHistory": [
                    {"place": "令和二年一月場所", "day": 1, "opponent": "現役一", "outcome": "loss"}
                ],
            },
        }
        known_good = b'{"known":"good"}\n'

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"
            output_path.write_bytes(known_good)

            with self.assertRaisesRegex(MODULE.MatchupDataError, "Unresolved active alias"):
                MODULE.generate_rikishi_matchup_endpoint(
                    active,
                    profiles,
                    profile_limit=0,
                    output_path=output_path,
                )

            self.assertEqual(output_path.read_bytes(), known_good)

    def test_one_sided_active_bout_preserves_previous_file_byte_for_byte(self) -> None:
        active = [_active_rikishi(100, "現役一"), _active_rikishi(200, "現役二")]
        profiles = {
            100: {
                "shikonaHistory": ["現役一"],
                "shikonaByPlace": {"対象場所": "現役一"},
                "boutHistory": [
                    {"place": "対象場所", "day": 1, "opponent": "現役二", "outcome": "win"}
                ],
            },
            200: {
                "shikonaHistory": ["現役二"],
                "shikonaByPlace": {"対象場所": "現役二", "別場所": "現役二"},
                "boutHistory": [
                    {"place": "別場所", "day": 1, "opponent": "引退力士", "outcome": "win"}
                ],
            },
        }
        known_good = b'{"known":"good"}\n'

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"
            output_path.write_bytes(known_good)

            with self.assertRaisesRegex(MODULE.MatchupDataError, "Missing mirrored bout"):
                MODULE.generate_rikishi_matchup_endpoint(
                    active,
                    profiles,
                    profile_limit=0,
                    output_path=output_path,
                )

            self.assertEqual(output_path.read_bytes(), known_good)

    def test_unresolved_active_alias_preserves_previous_file_byte_for_byte(self) -> None:
        active = [_active_rikishi(100, "現役一"), _active_rikishi(200, "現役二")]
        profiles = {
            100: {
                "shikonaHistory": ["現役一"],
                "shikonaByPlace": {"旧場所": "現役一"},
                "boutHistory": [
                    {"place": "旧場所", "day": 1, "opponent": "旧名二", "outcome": "win"}
                ],
            },
            200: {
                "shikonaHistory": ["現役二"],
                "shikonaByPlace": {"旧場所": "旧名二"},
                "boutHistory": [
                    {"place": "旧場所", "day": 1, "opponent": "現役一", "outcome": "loss"}
                ],
            },
        }
        known_good = b'{"known":"good"}\n'

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"
            output_path.write_bytes(known_good)

            with self.assertRaisesRegex(MODULE.MatchupDataError, "Unresolved active alias"):
                MODULE.generate_rikishi_matchup_endpoint(
                    active,
                    profiles,
                    profile_limit=0,
                    output_path=output_path,
                )

            self.assertEqual(output_path.read_bytes(), known_good)

    def test_partial_generation_preserves_previous_file_byte_for_byte(self) -> None:
        active = [_active_rikishi(4230, "安青錦"), _active_rikishi(4279, "義ノ富士")]
        profiles = {4230: {"shikonaHistory": ["安青錦"], "boutHistory": []}}
        known_good = b'{"known":"good"}\n'

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"
            output_path.write_bytes(known_good)

            wrote = MODULE.generate_rikishi_matchup_endpoint(
                active,
                profiles,
                profile_limit=1,
                output_path=output_path,
            )

            self.assertFalse(wrote)
            self.assertEqual(output_path.read_bytes(), known_good)

    def test_conflict_preserves_previous_file_byte_for_byte(self) -> None:
        active = [_active_rikishi(4230, "安青錦"), _active_rikishi(4279, "義ノ富士")]
        profiles = {
            4230: {
                "shikonaHistory": ["安青錦"],
                "shikonaByPlace": {"代表場所": "安青錦"},
                "boutHistory": [
                    {"place": "代表場所", "day": 1, "opponent": "義ノ富士", "outcome": "win"}
                ],
            },
            4279: {
                "shikonaHistory": ["草野", "義ノ富士"],
                "shikonaByPlace": {"代表場所": "義ノ富士"},
                "boutHistory": [
                    {"place": "代表場所", "day": 1, "opponent": "安青錦", "outcome": "win"}
                ],
            },
        }
        known_good = b'{"known":"good"}\n'

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"
            output_path.write_bytes(known_good)

            with self.assertRaises(MODULE.MatchupDataError):
                MODULE.generate_rikishi_matchup_endpoint(
                    active,
                    profiles,
                    profile_limit=0,
                    output_path=output_path,
                )

            self.assertEqual(output_path.read_bytes(), known_good)

    def test_successful_generation_writes_valid_endpoint_document(self) -> None:
        active = [_active_rikishi(4230, "安青錦"), _active_rikishi(4279, "義ノ富士")]
        profiles = {
            4230: {
                "shikonaHistory": ["安青錦"],
                "shikonaByPlace": {"代表場所": "安青錦"},
                "boutHistory": [
                    {"place": "代表場所", "day": 1, "opponent": "草野", "outcome": "win"}
                ],
            },
            4279: {
                "shikonaHistory": ["草野", "義ノ富士"],
                "shikonaByPlace": {"代表場所": "草野"},
                "boutHistory": [
                    {"place": "代表場所", "day": 1, "opponent": "安青錦", "outcome": "loss"}
                ],
            },
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = pathlib.Path(temp_dir) / "rikishi-matchups.json"

            wrote = MODULE.generate_rikishi_matchup_endpoint(
                active,
                profiles,
                profile_limit=0,
                output_path=output_path,
            )
            document = json.loads(output_path.read_text(encoding="utf-8"))

        self.assertTrue(wrote)
        self.assertRegex(document["updatedAt"], r"^\d{4}-\d{2}-\d{2}T")
        self.assertEqual(
            document["matchups"],
            [
                {
                    "rikishi1Id": 4230,
                    "rikishi2Id": 4279,
                    "rikishi1Wins": 1,
                    "rikishi2Wins": 0,
                }
            ],
        )


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


class LoadTorikumiDayTest(unittest.TestCase):
    def test_makuuchi_keeps_mixed_bout_and_all_twenty_pure_bouts(self) -> None:
        payload = _official_makuuchi_payload_with_mixed_bout()

        with mock.patch.object(MODULE, "post_json", return_value=payload):
            division_day = MODULE.load_torikumi_day(636, 1, 1)

        self.assertEqual(len(division_day["matches"]), 21)
        self.assertEqual(
            [match["boutNo"] for match in division_day["matches"]],
            list(range(1, 22)),
        )
        self.assertEqual(division_day["matches"][0]["eastName"], "混合東")
        self.assertEqual(division_day["matches"][-1]["eastName"], "幕内20東")

    def test_juryo_does_not_select_mixed_bout_owned_by_makuuchi(self) -> None:
        payload = _official_makuuchi_payload_with_mixed_bout()

        merged = MODULE.merge_torikumi_raw_matches(payload, kakuzuke_id=2)

        self.assertEqual(merged, [])

    def test_senshuraku_accepts_wrapped_torikumi_and_single_final_match(self) -> None:
        regular = _official_torikumi_match("千秋楽通常", 1, 1, 2000)
        playoff = _official_torikumi_match("優勝決定", 1, 1, 3000)
        payload = {
            "Result": "1",
            "dayName": "取組日 千秋楽",
            "dayHead": "千秋楽： 令和8年7月26日(日)",
            "TorikumiData": {"matches": [regular]},
            "FinalMuch": playoff,
        }

        with mock.patch.object(MODULE, "post_json", return_value=payload):
            division_day = MODULE.load_torikumi_day(636, 15, 1)

        self.assertEqual(len(division_day["matches"]), 2)
        self.assertEqual(
            [match["eastName"] for match in division_day["matches"]],
            ["千秋楽通常東", "優勝決定東"],
        )
        self.assertEqual([match["boutNo"] for match in division_day["matches"]], [1, 2])

    def test_final_match_does_not_replace_regular_bout_when_number_restarts(self) -> None:
        regular = {**_official_torikumi_match("通常", 1, 1, 4000), "torikumi_no": 1}
        playoff = {**_official_torikumi_match("決定", 1, 1, 5000), "torikumi_no": 1}

        merged = MODULE.merge_torikumi_raw_matches(
            {"TorikumiData": [regular], "FinalMuch": [playoff]},
            kakuzuke_id=1,
        )

        self.assertEqual([raw["east"]["shikona"] for _, raw in merged], ["通常東", "決定東"])

    def test_duplicate_final_match_is_only_merged_once(self) -> None:
        final_match = _official_torikumi_match("結び", 1, 1, 6000)

        merged = MODULE.merge_torikumi_raw_matches(
            {"TorikumiData": [final_match], "FinalMuch": {"match": final_match}},
            kakuzuke_id=1,
        )

        self.assertEqual(len(merged), 1)


class SenshurakuPublicationStatusTest(unittest.TestCase):
    def make_day(self, *, winner: str | None, kimarite: str) -> dict:
        match = {
            "winner": winner,
            "kimarite": kimarite,
            "eastName": "東力士",
            "westName": "西力士",
        }
        return {
            "makuuchi": {"matches": [match]},
            "juryo": {"matches": [match]},
        }

    def test_senshuraku_schedule_is_published_before_results_settle(self) -> None:
        pending_day = self.make_day(winner=None, kimarite="")

        result_status, schedule_status = MODULE.determine_archive_statuses(
            15,
            15,
            pending_day,
            pending_day,
        )

        self.assertEqual(result_status, "pending")
        self.assertEqual(schedule_status, "published")

    def test_senshuraku_changes_from_unpublished_to_published_and_settled(self) -> None:
        unpublished_day = {"makuuchi": {"matches": []}, "juryo": {"matches": []}}
        settled_day = self.make_day(winner="east", kimarite="押し出し")

        self.assertEqual(
            MODULE.determine_archive_statuses(15, 14, unpublished_day, unpublished_day),
            ("pending", "pending"),
        )
        self.assertEqual(
            MODULE.determine_archive_statuses(15, 15, settled_day, settled_day),
            ("published", "published"),
        )


class LoadDivisionRikishiFallbackTest(unittest.TestCase):
    def test_uses_local_banzuke_when_remote_banzuke_fetch_fails(self) -> None:
        with mock.patch.object(MODULE, "load_banzuke_meta", side_effect=RuntimeError("boom")):
            rikishi = MODULE.load_division_rikishi(1)

        self.assertIn(3761, rikishi)
        self.assertEqual(rikishi[3761]["name"], "若隆景")

    def test_uses_local_banzuke_when_remote_banzuke_is_empty(self) -> None:
        with mock.patch.object(MODULE, "load_banzuke_meta", return_value={"BanzukeTable": []}):
            rikishi = MODULE.load_division_rikishi(2)

        self.assertIn(3983, rikishi)
        self.assertEqual(rikishi[3983]["name"], "出羽ノ龍")


class OfficialBashoScheduleTest(unittest.TestCase):
    def test_metadata_fallback_reuses_official_basho_id(self) -> None:
        metadata = MODULE.build_torikumi_meta_fallback(
            {
                "bashoId": 636,
                "bashoName": "七月場所",
                "year": "令和八年",
                "updatedAt": "2026-07-26T10:23:38+09:00",
                "resultDays": [{"day": 15, "pathDate": "20260726", "isoDate": "2026-07-26"}],
                "scheduleDays": [],
            }
        )

        self.assertEqual(metadata["BashoInfo"]["basho_id"], 636)

    def test_metadata_fallback_rejects_archive_month_as_basho_id(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "no valid bashoId"):
            MODULE.build_torikumi_meta_fallback(
                {
                    "bashoName": "七月場所",
                    "year": "令和八年",
                    "updatedAt": "2026-07-26T10:23:38+09:00",
                    "resultDays": [{"day": 15, "pathDate": "20260726", "isoDate": "2026-07-26"}],
                    "scheduleDays": [],
                }
            )

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

    def test_schedule_scope_only_fetches_current_and_next_day(self) -> None:
        self.assertEqual(
            MODULE.resolve_torikumi_fetch_days(
                torikumi_only=True,
                scope="schedule",
                current_day=14,
                existing_torikumi={"scheduleDays": []},
            ),
            {14, 15},
        )
        self.assertEqual(
            MODULE.resolve_torikumi_fetch_days(
                torikumi_only=True,
                scope="schedule",
                current_day=15,
                existing_torikumi={"scheduleDays": []},
            ),
            {15},
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
