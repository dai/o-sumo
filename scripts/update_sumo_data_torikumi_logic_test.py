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

    assert result3 == "published"
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


def test_derive_absentees_excludes_cross_division_special_bout_rikishi() -> None:
    roster = {
        4116: {"id": 4116, "name": "大青山", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/"},
        9999: {"id": 9999, "name": "休場力士", "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/9999/"},
    }
    juryo_day = _division(0)
    day_active_ids = {4116}

    absentees = derive_absentees(juryo_day, roster, day_active_ids)

    assert [entry["id"] for entry in absentees] == [9999]


def main() -> None:
    test_pick_existing_division_day_respects_source_key()
    test_determine_archive_statuses_limits_publication_window()
    test_determine_archive_statuses_publishes_settled_results_beyond_today_day()
    test_derive_absentees_excludes_cross_division_special_bout_rikishi()
    print("ok: update_sumo_data torikumi logic tests passed")


if __name__ == "__main__":
    main()
