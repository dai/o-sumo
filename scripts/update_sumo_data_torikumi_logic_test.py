from pathlib import Path
import importlib.util


def _load_update_module():
    module_path = Path(__file__).with_name("update_sumo_data.py")
    spec = importlib.util.spec_from_file_location("update_sumo_data_module", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Failed to load update_sumo_data.py for testing")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_module = _load_update_module()
determine_archive_statuses = _module.determine_archive_statuses
pick_existing_division_day = _module.pick_existing_division_day
derive_absentees = _module.derive_absentees
parse_torikumi_match = _module.parse_torikumi_match
has_substantive_torikumi_diff = _module.has_substantive_torikumi_diff
preserve_torikumi_timestamps_if_unchanged = _module.preserve_torikumi_timestamps_if_unchanged
apply_result_days_to_rank_groups = _module.apply_result_days_to_rank_groups


def _division(matches: int) -> dict:
    return {
        "day": 1,
        "dayName": "取組日 初日",
        "dayHead": "初日： 令和8年5月10日(日)",
        "division": "幕内",
        "matches": [
            {
                "division": "幕内",
                "boutNo": i + 1,
                "eastName": f"east{i}",
                "eastYomi": f"east{i}",
                "eastEnglish": f"east{i}",
                "eastRank": "前頭",
                "eastProfileUrl": "https://example.com/east",
                "westName": f"west{i}",
                "westYomi": f"west{i}",
                "westEnglish": f"west{i}",
                "westRank": "前頭",
                "westProfileUrl": "https://example.com/west",
                "kimarite": "未定",
                "winner": None,
            }
            for i in range(matches)
        ],
    }


def _dataset(updated_at: str, winner: str | None = "east") -> dict:
    return {
        "bashoName": "五月場所",
        "year": "令和八年",
        "updatedAt": updated_at,
        "resultUpdatedAt": updated_at,
        "scheduleUpdatedAt": updated_at,
        "today": None,
        "tomorrow": None,
        "resultDays": [
            {
                "day": 1,
                "pathDate": "20260510",
                "status": "published",
                "data": {
                    "makuuchi": {
                        **_division(1),
                        "matches": [{**_division(1)["matches"][0], "winner": winner}],
                    },
                    "juryo": _division(0),
                },
            }
        ],
        "scheduleDays": [
            {
                "day": 1,
                "pathDate": "20260510",
                "status": "published",
                "data": {
                    "makuuchi": _division(1),
                    "juryo": _division(0),
                },
            }
        ],
    }


def test_pick_existing_division_day_respects_source_key() -> None:
    existing = {
        "resultDays": [
            {
                "day": 3,
                "data": {
                    "makuuchi": _division(20),
                },
            }
        ],
        "scheduleDays": [
            {
                "day": 3,
                "data": {
                    "makuuchi": _division(0),
                },
            }
        ],
    }

    result = pick_existing_division_day(existing, 3, "makuuchi", "resultDays")
    schedule = pick_existing_division_day(existing, 3, "makuuchi", "scheduleDays")
    assert result is not None
    assert schedule is not None
    assert len(result["matches"]) == 20
    assert len(schedule["matches"]) == 0


def test_determine_archive_statuses_limits_publication_window() -> None:
    result_day_data = {
        "makuuchi": _division(20),
        "juryo": _division(14),
    }
    schedule_day_data = {
        "makuuchi": _division(20),
        "juryo": _division(14),
    }

    # 2026-05-13 想定: resultは3日目まで、scheduleは4日目まで公開
    result3, schedule3 = determine_archive_statuses(3, 3, result_day_data, schedule_day_data)
    result4, schedule4 = determine_archive_statuses(4, 3, result_day_data, schedule_day_data)
    result5, schedule5 = determine_archive_statuses(5, 3, result_day_data, schedule_day_data)

    assert result3 == "pending"
    assert schedule3 == "published"
    assert result4 == "pending"
    assert schedule4 == "published"
    assert result5 == "pending"
    assert schedule5 == "pending"


def test_determine_archive_statuses_publishes_settled_results_beyond_today_day() -> None:
    settled_result_day_data = {
        "makuuchi": {
            **_division(20),
            "matches": [{**m, "winner": "east"} for m in _division(20)["matches"]],
        },
        "juryo": {
            **_division(14),
            "matches": [{**m, "winner": "west"} for m in _division(14)["matches"]],
        },
    }
    schedule_day_data = {
        "makuuchi": _division(20),
        "juryo": _division(14),
    }

    # today_day=2 でも、day=3 に実結果が確定していれば result は published にする
    result3, schedule3 = determine_archive_statuses(3, 2, settled_result_day_data, schedule_day_data)
    assert result3 == "published"
    assert schedule3 == "published"


def test_determine_archive_statuses_publishes_partially_settled_results() -> None:
    makuuchi = _division(2)
    result_day_data = {
        "makuuchi": {
            **makuuchi,
            "matches": [
                {**makuuchi["matches"][0], "winner": "east"},
                {**makuuchi["matches"][1], "winner": None},
            ],
        },
        "juryo": _division(1),
    }
    schedule_day_data = {
        "makuuchi": _division(2),
        "juryo": _division(1),
    }

    result_status, _ = determine_archive_statuses(3, 3, result_day_data, schedule_day_data)

    assert result_status == "published"


def test_derive_absentees_excludes_cross_division_special_bout_rikishi() -> None:
    roster = {
        4116: {"id": 4116, "name": "大青山", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/"},
        9999: {"id": 9999, "name": "休場力士", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/9999/"},
    }
    juryo_day = _division(1)
    day_active_ids = {4116}

    absentees = derive_absentees(juryo_day, roster, day_active_ids)

    assert [entry["id"] for entry in absentees] == [9999]


def test_derive_absentees_excludes_only_same_division_active_rikishi() -> None:
    """The day_active_ids argument should be the same-division active set;
    cross-division participants (e.g. juryo rikishi showing up via the special
    bout path) must NOT silently flip the makuuchi absentee list. We simulate
    that by passing an active id set that contains a rikishi not present in
    the roster at all — the result must still equal roster - same-division
    active ids, not roster - day_active_ids.
    """
    roster = {
        4227: {"id": 4227, "name": "若隆景", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"},
    }
    # Build a division day whose matches include someone outside the roster,
    # so passing `day_active_ids` that excludes cross-division entries still
    # returns 4227 (the only roster member) as an absentee.
    makuuchi_day = _division(1)
    makuuchi_day["matches"] = [
        {
            "division": "幕内",
            "boutNo": 1,
            "eastName": "他",
            "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/8000/",
            "westName": "他",
            "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/8001/",
        }
    ]
    # Only the active ids from the makuuchi division itself; the cross-division
    # participant (8000) appears in makuuchi matches but is not in our roster,
    # so the absentee list should still report 4227 (roster - same-division active).
    makuuchi_active_ids = {8000}

    absentees = derive_absentees(makuuchi_day, roster, makuuchi_active_ids)

    assert [entry["id"] for entry in absentees] == [4227]


def test_parse_torikumi_match_accepts_plain_text_shikona() -> None:
    raw = {
        "judge": 1,
        "technic_name": "",
        "east": {
            "shikona": "若隆景",
            "shikona_kana": "",
            "shikona_eng": "",
            "banzuke_name": "十両一枚目",
            "rikishi_id": 1234,
        },
        "west": {
            "shikona": "朝紅龍",
            "shikona_kana": "",
            "shikona_eng": "",
            "banzuke_name": "十両二枚目",
            "rikishi_id": 5678,
        },
    }

    parsed = parse_torikumi_match(raw, "十両", 6)

    assert parsed["eastName"] == "若隆景"
    assert parsed["westName"] == "朝紅龍"
    assert parsed["kimarite"] == "未定"
    assert parsed["winner"] == "east"


def test_has_substantive_torikumi_diff_ignores_timestamp_only_change() -> None:
    existing = _dataset("2026-05-11T10:00:00+09:00")
    candidate = _dataset("2026-05-11T10:05:00+09:00")

    assert has_substantive_torikumi_diff(candidate, existing) is False


def test_preserve_torikumi_timestamps_if_unchanged_restores_existing_values() -> None:
    existing = _dataset("2026-05-11T10:00:00+09:00")
    candidate = _dataset("2026-05-11T10:05:00+09:00")

    merged, changed = preserve_torikumi_timestamps_if_unchanged(candidate, existing)

    assert changed is False
    assert merged["updatedAt"] == "2026-05-11T10:00:00+09:00"
    assert merged["resultUpdatedAt"] == "2026-05-11T10:00:00+09:00"
    assert merged["scheduleUpdatedAt"] == "2026-05-11T10:00:00+09:00"


def test_apply_result_days_to_rank_groups_keeps_unsettled_and_unknown_marks_null() -> None:
    def rikishi(rikishi_id: int) -> dict:
        return {
            "id": rikishi_id,
            "name": f"力士{rikishi_id}",
            "yomi": f"りきし{rikishi_id}",
            "rank": "前頭1",
            "side": "east" if rikishi_id % 2 else "west",
            "profileUrl": f"https://www.sumo.or.jp/ResultRikishiData/profile/{rikishi_id}/",
            "results": [],
            "wins": 0,
            "losses": 0,
            "draws": 0,
        }

    rank_groups = [
        {
            "title": "前頭1",
            "east": [rikishi(1001), rikishi(1003), rikishi(1005)],
            "west": [rikishi(1002), rikishi(1004), rikishi(1006)],
        }
    ]
    result_days = [
        {
            "day": 1,
            "status": "published",
            "data": {
                "makuuchi": {
                    "matches": [
                        {
                            "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/1001/",
                            "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/1002/",
                            "winner": "east",
                        },
                        {
                            "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/1003/",
                            "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/1004/",
                            "winner": None,
                        },
                    ],
                    "absentees": [
                        {
                            "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/1005/",
                        }
                    ],
                },
                "juryo": {"matches": [], "absentees": []},
            },
        }
    ]

    apply_result_days_to_rank_groups(rank_groups, result_days)

    by_id = {
        rikishi["id"]: rikishi
        for side in ("east", "west")
        for rikishi in rank_groups[0][side]
    }
    assert by_id[1001]["results"] == ["win"]
    assert by_id[1002]["results"] == ["loss"]
    assert by_id[1003]["results"] == [None]
    assert by_id[1004]["results"] == [None]
    assert by_id[1005]["results"] == ["draw"]
    assert by_id[1006]["results"] == [None]
    assert (by_id[1003]["wins"], by_id[1003]["losses"], by_id[1003]["draws"]) == (0, 0, 0)
    assert (by_id[1006]["wins"], by_id[1006]["losses"], by_id[1006]["draws"]) == (0, 0, 0)
    assert (by_id[1005]["wins"], by_id[1005]["losses"], by_id[1005]["draws"]) == (0, 0, 1)


def main() -> None:
    test_pick_existing_division_day_respects_source_key()
    test_determine_archive_statuses_limits_publication_window()
    test_determine_archive_statuses_publishes_settled_results_beyond_today_day()
    test_determine_archive_statuses_publishes_partially_settled_results()
    test_derive_absentees_excludes_cross_division_special_bout_rikishi()
    test_derive_absentees_excludes_only_same_division_active_rikishi()
    test_parse_torikumi_match_accepts_plain_text_shikona()
    test_has_substantive_torikumi_diff_ignores_timestamp_only_change()
    test_preserve_torikumi_timestamps_if_unchanged_restores_existing_values()
    test_apply_result_days_to_rank_groups_keeps_unsettled_and_unknown_marks_null()
    print("ok: update_sumo_data torikumi logic tests passed")


if __name__ == "__main__":
    main()
