import argparse
import html as html_lib
import json
import re
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

# For HTML parsing of profile pages
try:
    from html.parser import HTMLParser
except ImportError:
    HTMLParser = None

BASE_URL = "https://www.sumo.or.jp"
SUMO_OUTPUT = Path("app/lib/sumo-data.ts")
TORIKUMI_OUTPUT = Path("app/lib/torikumi-data.ts")
API_DIR = Path("public/api/v1")
EXPECTED_RIKISHI_COUNT = {1: 42, 2: 28}
DIVISION_LABEL = {1: "幕内", 2: "十両"}
TORIKUMI_BOUT_LIMIT = {1: 20, 2: 14}
RESULT_DAYS = tuple(str(day) for day in range(1, 16))
DAY_LABEL = {
    1: "初日",
    2: "二日目",
    3: "三日目",
    4: "四日目",
    5: "五日目",
    6: "六日目",
    7: "七日目",
    8: "中日",
    9: "九日目",
    10: "十日目",
    11: "十一日目",
    12: "十二日目",
    13: "十三日目",
    14: "十四日目",
    15: "千秋楽",
}
WEEKDAY_JA = ("月", "火", "水", "木", "金", "土", "日")
JST = ZoneInfo("Asia/Tokyo")
TORIKUMI_SCOPES = ("all", "result", "schedule")


def post_json(path: str, payload: dict) -> dict:
    referer = f"{BASE_URL}/"
    torikumi_match = re.match(r"^/ResultData/torikumiAjax/(\d+)/(\d+)/$", path)
    if torikumi_match:
        kakuzuke_id, day = torikumi_match.groups()
        referer = f"{BASE_URL}/ResultData/torikumi/{kakuzuke_id}/{day}/"
    elif path.startswith("/ResultBanzuke/tableAjax/"):
        referer = f"{BASE_URL}/ResultBanzuke/"
    elif path.startswith("/ResultData/hoshitoriAjax/"):
        referer = f"{BASE_URL}/ResultData/hoshitori/"

    req = Request(
        f"{BASE_URL}{path}",
        data=urlencode(payload).encode("utf-8"),
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": BASE_URL,
            "Referer": referer,
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        },
        method="POST",
    )

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as exc:
            last_error = exc
            if attempt == 2:
                break
            time.sleep(1.5 * (attempt + 1))

    raise RuntimeError(f"API request failed after retries: path={path}, payload={payload}") from last_error


def extract_alt_text(html: str) -> str:
    if not html:
        return ""
    match = re.search(r'alt="([^"]+)"', html)
    if match:
        return match.group(1).strip()
    return ""


def extract_shikona_text(raw: str) -> str:
    if not raw:
        return ""
    alt = extract_alt_text(raw)
    if alt:
        return alt
    stripped = re.sub(r"<[^>]+>", "", raw)
    stripped = html_lib.unescape(stripped).replace("\u00a0", " ").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", stripped).strip()


def split_shikona(full_name: str) -> str:
    normalized = re.sub(r"\s+", " ", full_name.replace("\u3000", " ")).strip()
    if not normalized:
        return ""
    return normalized.split(" ")[0]


def normalize_day_head(raw: str) -> str:
    normalized = raw.replace("&nbsp;", " ").replace("\u00a0", " ")
    normalized = re.sub(r"\s+", " ", normalized).strip()
    match = re.match(r"^(.+?)\s+(.+)$", normalized)
    if not match:
        return normalized
    return f"{match.group(1)}： {match.group(2)}"


def extract_actual_date(day_head: str, fallback_year: int | None = None) -> date:
    match = re.search(r"(?:令和(\d+)年)?(\d+)月(\d+)日", day_head)
    if not match:
        raise ValueError(f"日付抽出失敗: {day_head}")
    gregorian_year = (int(match.group(1)) + 2018) if match.group(1) else fallback_year
    if gregorian_year is None:
        raise ValueError(f"年抽出失敗: {day_head}")
    month = int(match.group(2))
    day = int(match.group(3))
    return date(gregorian_year, month, day)


def extract_iso_date(day_head: str, gregorian_year: str) -> str:
    return extract_actual_date(day_head, int(gregorian_year)).isoformat()


def extract_iso_date_part(value: str) -> str:
    if not value:
        raise ValueError("missing updatedAt value; expected ISO date or datetime")
    return value[:10]


def current_timestamp_iso() -> str:
    return datetime.now(JST).replace(microsecond=0).isoformat()


def safe_int(raw: object, default: int) -> int:
    try:
        return int(str(raw))
    except (TypeError, ValueError):
        return default


def reiwa_year_text(gregorian_year: int) -> str:
    return f"令和{gregorian_year - 2018}年"


def build_day_head(day: int, actual_date: date) -> str:
    return (
        f"{DAY_LABEL.get(day, f'{day}日目')}： "
        f"{reiwa_year_text(actual_date.year)}{actual_date.month}月{actual_date.day}日"
        f"({WEEKDAY_JA[actual_date.weekday()]})"
    )


def load_banzuke_meta(kakuzuke_id: int = 1) -> dict:
    data = post_json(
        f"/ResultBanzuke/tableAjax/{kakuzuke_id}/1/",
        {"kakuzuke_id": str(kakuzuke_id), "b": "0", "page": "1"},
    )
    if data.get("Result") != "1":
        raise RuntimeError(f"tableAjax failed for kakuzuke_id={kakuzuke_id}")
    return data


def make_schedule_daily_data(day_data: dict) -> dict:
    def clear_division(division_data: dict) -> dict:
        return {
            **division_data,
            "matches": [
                {
                    **match,
                    "kimarite": "未定",
                    "winner": None,
                }
                for match in division_data["matches"]
            ],
        }

    return {
        "makuuchi": clear_division(day_data["makuuchi"]),
        "juryo": clear_division(day_data["juryo"]),
    }


def build_archive_day(day_data: dict, gregorian_year: str, mode: str, status: str) -> dict:
    iso_date = extract_iso_date(day_data["makuuchi"]["dayHead"], gregorian_year)
    normalized = day_data if mode == "result" else make_schedule_daily_data(day_data)
    if status != "published":
        normalized = {
            "makuuchi": {
                **normalized["makuuchi"],
                "matches": [],
                "absentees": [],
            },
            "juryo": {
                **normalized["juryo"],
                "matches": [],
                "absentees": [],
            },
        }
    return {
        "day": int(day_data["makuuchi"]["day"]),
        "isoDate": iso_date,
        "pathDate": iso_date.replace("-", ""),
        "label": DAY_LABEL.get(int(day_data["makuuchi"]["day"]), f"{day_data['makuuchi']['day']}日目"),
        "dayHead": day_data["makuuchi"]["dayHead"],
        "status": status,
        "statusMessage": None if status == "published" else ("結果未更新" if mode == "result" else "取組予定未更新"),
        "data": normalized,
    }


def rank_title(rank: int, number: int) -> str:
    if rank == 100:
        return "横綱"
    if rank == 200:
        return "大関"
    if rank == 300:
        return "関脇"
    if rank == 400:
        return "小結"
    if rank == 500:
        return f"前頭{number}"
    if rank == 600:
        return f"十両{number}"
    return f"番付{rank}"


def make_result_marks(record: dict) -> list[str]:
    marks = []
    for day in RESULT_DAYS:
        day_data = record.get(day, {})
        alt = str(day_data.get("alt", ""))
        if "白" in alt or alt == "不戦勝":
            marks.append("win")
        elif "黒" in alt or alt == "不戦敗":
            marks.append("loss")
        elif alt == "やすみ":
            marks.append("draw")
    return marks


def load_hoshitori(kakuzuke_id: int) -> dict:
    data = post_json(
        f"/ResultData/hoshitoriAjax/{kakuzuke_id}/1/",
        {"kakuzuke_id": str(kakuzuke_id), "ew_flg": "1"},
    )
    if data.get("Result") != "1":
        raise RuntimeError(f"hoshitoriAjax failed for kakuzuke_id={kakuzuke_id}")
    return data


def build_rank_groups(kakuzuke_id: int) -> tuple[list[dict], dict]:
    banzuke = load_banzuke_meta(kakuzuke_id)

    table = sorted(banzuke.get("BanzukeTable", []), key=lambda item: int(item["banzuke_id"]) if item.get("rikishi_id") else 0)
    # Filter out empty/placeholder entries
    table = [item for item in table if item.get("rikishi_id")]
    expected = EXPECTED_RIKISHI_COUNT[kakuzuke_id]
    if len(table) != expected:
        raise ValueError(
            f"不完全データ: {DIVISION_LABEL[kakuzuke_id]} {len(table)}人/期待{expected}人"
        )

    hoshitori = load_hoshitori(kakuzuke_id)
    east_records = {int(item["rikishi_id"]): item for item in hoshitori["BanzukeTable"]["E"]}
    west_records = {int(item["rikishi_id"]): item for item in hoshitori["BanzukeTable"]["W"]}
    east_torikumi = hoshitori["TorikumiData"]["E"]
    west_torikumi = hoshitori["TorikumiData"]["W"]

    groups: dict[str, dict] = {}
    for entry in table:
        rikishi_id = int(entry["rikishi_id"])
        side = "east" if int(entry["ew"]) == 1 else "west"
        side_records = east_records if side == "east" else west_records
        side_torikumi = east_torikumi if side == "east" else west_torikumi
        h_record = side_records.get(rikishi_id)
        if not h_record:
            raise ValueError(f"星取表連携欠落: rikishi_id={rikishi_id}, side={side}")

        result_record = side_torikumi.get(str(rikishi_id), {})
        marks = make_result_marks(result_record)
        title = rank_title(int(entry["rank"]), int(entry["number"]))
        profile_url = f"{BASE_URL}/ResultRikishiData/profile/{rikishi_id}/"

        rikishi = {
            "id": rikishi_id,
            "name": split_shikona(entry.get("shikona", "")),
            "yomi": h_record.get("shikona_kana", ""),
            "rank": title,
            "side": side,
            "wins": int(result_record.get("won_number", 0)),
            "losses": int(result_record.get("lost_number", 0)),
            "draws": int(result_record.get("rest_number", 0)),
            "results": marks,
            "profileUrl": profile_url,
            "memo": "",
        }

        if not rikishi["name"] or not rikishi["yomi"]:
            raise ValueError(f"力士名または読みが欠落: rikishi_id={rikishi_id}")

        if title not in groups:
            groups[title] = {"title": title, "east": [], "west": []}
        groups[title][side].append(rikishi)

    ordered = sorted(
        groups.values(),
        key=lambda g: (
            1 if g["title"].startswith("横綱") else
            2 if g["title"].startswith("大関") else
            3 if g["title"].startswith("関脇") else
            4 if g["title"].startswith("小結") else
            5,
            int(re.sub(r"\D", "", g["title"]) or 0),
        ),
    )

    count = sum(len(g["east"]) + len(g["west"]) for g in ordered)
    if count != expected:
        raise ValueError(f"構築後人数不一致: {DIVISION_LABEL[kakuzuke_id]} {count}人/期待{expected}人")

    return ordered, banzuke


def parse_torikumi_match(raw: dict, division: str, bout_no: int) -> dict:
    east = raw.get("east") or {}
    west = raw.get("west") or {}
    judge = safe_int(raw.get("judge", 9), 9)
    kimarite = str(raw.get("technic_name", "")).strip()
    if kimarite in {"", "&nbsp;"}:
        kimarite = "未定"

    east_name = extract_shikona_text(str(east.get("shikona", ""))) or str(east.get("shikona_kana", ""))
    west_name = extract_shikona_text(str(west.get("shikona", ""))) or str(west.get("shikona_kana", ""))
    if not east_name and not west_name:
        raise ValueError("取組の東西名が欠落")

    winner = "east" if judge == 1 else "west" if judge == 2 else None
    east_id = safe_int(east.get("rikishi_id", 0), 0)
    west_id = safe_int(west.get("rikishi_id", 0), 0)

    return {
        "division": division,
        "boutNo": bout_no,
        "eastName": east_name,
        "eastYomi": str(east.get("shikona_kana", "")),
        "eastEnglish": str(east.get("shikona_eng", "")),
        "eastRank": str(east.get("banzuke_name", "")),
        "eastProfileUrl": f"{BASE_URL}/ResultRikishiData/profile/{east_id}/" if east_id else "",
        "westName": west_name,
        "westYomi": str(west.get("shikona_kana", "")),
        "westEnglish": str(west.get("shikona_eng", "")),
        "westRank": str(west.get("banzuke_name", "")),
        "westProfileUrl": f"{BASE_URL}/ResultRikishiData/profile/{west_id}/" if west_id else "",
        "kimarite": kimarite,
        "winner": winner,
    }


def extract_bout_no(raw: dict, fallback: int) -> int:
    for key in ("bout_no", "torikumi_no", "sumo_no", "match_no", "number", "no"):
        value = safe_int(raw.get(key), 0)
        if value > 0:
            return value
    return fallback


def merge_torikumi_raw_matches(data: dict) -> list[tuple[int, dict]]:
    merged: dict[int, dict] = {}

    for idx, raw in enumerate(list(data.get("TorikumiData", [])), start=1):
        bout_no = extract_bout_no(raw, idx)
        merged[bout_no] = raw

    start_idx = max(merged.keys(), default=0) + 1
    for idx, raw in enumerate(list(data.get("FinalMuch", [])), start=start_idx):
        bout_no = extract_bout_no(raw, idx)
        merged[bout_no] = raw

    return sorted(merged.items(), key=lambda item: item[0])


def load_torikumi_day(basho_id: int, day: int, kakuzuke_id: int) -> dict:
    payload = {
        "basho_id": str(basho_id),
        "kakuzuke_id": str(kakuzuke_id),
        "day": str(day),
    }
    data = post_json(f"/ResultData/torikumiAjax/{kakuzuke_id}/{day}/", payload)
    if data.get("Result") != "1":
        raise RuntimeError(f"torikumiAjax failed: kakuzuke_id={kakuzuke_id}, day={day}")

    merged_matches = merge_torikumi_raw_matches(data)
    if not merged_matches:
        raise ValueError(f"取組データ未公開: {DIVISION_LABEL[kakuzuke_id]} day={day}")

    parsed = []
    for extracted_bout_no, match in merged_matches:
        try:
            parsed.append(parse_torikumi_match(match, DIVISION_LABEL[kakuzuke_id], extracted_bout_no))
        except Exception:
            continue

    bout_limit = TORIKUMI_BOUT_LIMIT[kakuzuke_id]
    parsed = sorted(parsed, key=lambda item: item["boutNo"])[:bout_limit]

    if not parsed:
        raise ValueError(f"取組データ解析失敗: {DIVISION_LABEL[kakuzuke_id]} day={day}")

    return {
        "day": day,
        "dayName": data.get("dayName", ""),
        "dayHead": normalize_day_head(str(data.get("dayHead", ""))),
        "division": DIVISION_LABEL[kakuzuke_id],
        "matches": parsed,
    }


def build_empty_division_day(day: int, actual_date: date, kakuzuke_id: int) -> dict:
    return {
        "day": day,
        "dayName": f"取組日 {DAY_LABEL.get(day, f'{day}日目')}",
        "dayHead": build_day_head(day, actual_date),
        "division": DIVISION_LABEL[kakuzuke_id],
        "matches": [],
    }


def build_placeholder_day(day: int, actual_date: date) -> dict:
    return {
        "makuuchi": build_empty_division_day(day, actual_date, 1),
        "juryo": build_empty_division_day(day, actual_date, 2),
    }


def try_load_torikumi_day(basho_id: int, day: int, kakuzuke_id: int) -> dict | None:
    try:
        return load_torikumi_day(basho_id, day, kakuzuke_id)
    except Exception as exc:
        print(
            f"[warn] torikumi fetch failed: basho_id={basho_id}, day={day}, "
            f"division={DIVISION_LABEL[kakuzuke_id]} ({exc})",
            file=sys.stderr,
        )
        return None


def resolve_basho_start_date(
    loaded_days: dict[int, dict[str, dict | None]],
    fallback_updated_at: str,
    fallback_day: int,
) -> date:
    fallback_year = None
    if fallback_updated_at:
        fallback_year = date.fromisoformat(extract_iso_date_part(fallback_updated_at)).year

    inferred_start_dates = set()
    for day, divisions in loaded_days.items():
        reference = divisions["makuuchi"] or divisions["juryo"]
        if reference is None:
            continue
        actual_date = extract_actual_date(reference["dayHead"], fallback_year)
        inferred_start_dates.add(actual_date - timedelta(days=day - 1))

    if len(inferred_start_dates) == 1:
        return inferred_start_dates.pop()
    if inferred_start_dates:
        raise ValueError(f"開催初日を一意に特定できません: {sorted(inferred_start_dates)}")
    if fallback_updated_at:
        safe_day = max(1, min(fallback_day, 15))
        return date.fromisoformat(extract_iso_date_part(fallback_updated_at)) - timedelta(days=safe_day - 1)
    return datetime.now(JST).date()


def has_any_matches(day_data: dict) -> bool:
    return bool(day_data["makuuchi"]["matches"] or day_data["juryo"]["matches"])


def has_settled_matches(day_data: dict) -> bool:
    return any(
        match.get("winner") is not None
        for division in (day_data["makuuchi"], day_data["juryo"])
        for match in division["matches"]
    )


def load_division_rikishi(kakuzuke_id: int) -> dict[int, dict]:
    try:
        banzuke = load_banzuke_meta(kakuzuke_id)
    except Exception as exc:
        print(
            f"[warn] banzuke fetch failed for absentees: division={DIVISION_LABEL[kakuzuke_id]} ({exc})",
            file=sys.stderr,
        )
        return {}
    rikishi_map: dict[int, dict] = {}
    for item in banzuke.get("BanzukeTable", []):
        rikishi_id = safe_int(item.get("rikishi_id"), 0)
        if rikishi_id <= 0:
            continue
        rikishi_map[rikishi_id] = {
            "id": rikishi_id,
            "name": split_shikona(str(item.get("shikona", ""))),
            "profileUrl": f"{BASE_URL}/ResultRikishiData/profile/{rikishi_id}/",
        }
    return rikishi_map


def extract_rikishi_id_from_url(url: str) -> int:
    match = re.search(r"/profile/(\d+)/", url or "")
    if not match:
        return 0
    return safe_int(match.group(1), 0)


def collect_active_ids_from_division_day(division_day: dict) -> set[int]:
    active_ids = set()
    for match in division_day.get("matches", []):
        east_id = extract_rikishi_id_from_url(str(match.get("eastProfileUrl", "")))
        west_id = extract_rikishi_id_from_url(str(match.get("westProfileUrl", "")))
        if east_id:
            active_ids.add(east_id)
        if west_id:
            active_ids.add(west_id)
    return active_ids


def collect_active_ids_from_day(day_data: dict) -> set[int]:
    active_ids = set()
    for division_key in ("makuuchi", "juryo"):
        division_day = day_data.get(division_key)
        if isinstance(division_day, dict):
            active_ids |= collect_active_ids_from_division_day(division_day)
    return active_ids


def derive_absentees(
    division_day: dict,
    roster: dict[int, dict],
    day_active_ids: set[int] | None = None,
) -> list[dict]:
    if not roster:
        return []
    if not list(division_day.get("matches", [])):
        return []
    if day_active_ids is not None and len(day_active_ids) == 0:
        return []
    active_ids = collect_active_ids_from_division_day(division_day)
    if day_active_ids:
        active_ids |= day_active_ids
    if not active_ids:
        return []

    absent_ids = sorted(set(roster.keys()) - active_ids)
    return [roster[rikishi_id] for rikishi_id in absent_ids]


def sanitize_division_day(division_day: dict, kakuzuke_id: int) -> dict:
    matches = sorted(
        list(division_day.get("matches", [])),
        key=lambda item: safe_int(item.get("boutNo"), 0),
    )
    bout_limit = TORIKUMI_BOUT_LIMIT[kakuzuke_id]
    normalized_matches = []
    for idx, match in enumerate(matches[:bout_limit], start=1):
        normalized_matches.append({**match, "boutNo": idx})
    return {
        **division_day,
        "matches": normalized_matches,
    }


def pick_existing_division_day(existing: dict | None, day: int, division: str, source_key: str) -> dict | None:
    if not existing:
        return None

    candidates = []
    for archive_day in existing.get(source_key, []):
        if int(archive_day.get("day", 0)) != day:
            continue
        day_data = archive_day.get("data", {})
        division_day = day_data.get(division)
        if isinstance(division_day, dict):
            candidates.append(division_day)

    if not candidates:
        return None

    return max(candidates, key=lambda item: len(item.get("matches", [])))


def determine_archive_statuses(
    day: int,
    today_day: int,
    result_day_data: dict,
    schedule_day_data: dict,
) -> tuple[str, str]:
    schedule_publish_limit = min(today_day + 1, 15)
    result_status = "published" if has_settled_matches(result_day_data) else "pending"
    schedule_status = "published" if (day <= schedule_publish_limit and has_any_matches(schedule_day_data)) else "pending"
    return result_status, schedule_status


def build_torikumi_dataset(basho_id: int, current_day: int, updated_at: str, existing: dict | None = None) -> dict:
    rosters = {
        "makuuchi": load_division_rikishi(1),
        "juryo": load_division_rikishi(2),
    }
    loaded_days = {}
    for day in range(1, 16):
        loaded_days[day] = {
            "makuuchi": try_load_torikumi_day(basho_id, day, 1),
            "juryo": try_load_torikumi_day(basho_id, day, 2),
        }

    start_date = resolve_basho_start_date(loaded_days, updated_at, current_day)
    current_timestamp = current_timestamp_iso()
    today_day = max(1, min(current_day, 15))
    observed_settled_day = 0
    observed_any_match_day = 0
    for day in range(1, 16):
        loaded_makuuchi = loaded_days[day]["makuuchi"] or {"matches": []}
        loaded_juryo = loaded_days[day]["juryo"] or {"matches": []}
        loaded_day_data = {"makuuchi": loaded_makuuchi, "juryo": loaded_juryo}
        if has_settled_matches(loaded_day_data):
            observed_settled_day = day
        if has_any_matches(loaded_day_data):
            observed_any_match_day = day
    effective_today_day = max(today_day, observed_settled_day, observed_any_match_day)
    tomorrow_day = min(effective_today_day + 1, 15)
    gregorian_year = str(start_date.year)

    result_days = []
    schedule_days = []
    today_data = None
    tomorrow_data = None

    for day in range(1, 16):
        actual_date = start_date + timedelta(days=day - 1)
        placeholder = build_placeholder_day(day, actual_date)
        schedule_publish_limit = min(effective_today_day + 1, 15)
        allow_result_existing = day <= effective_today_day
        allow_schedule_existing = day <= schedule_publish_limit

        existing_result_makuuchi = pick_existing_division_day(existing, day, "makuuchi", "resultDays") if allow_result_existing else None
        existing_result_juryo = pick_existing_division_day(existing, day, "juryo", "resultDays") if allow_result_existing else None
        existing_schedule_makuuchi = pick_existing_division_day(existing, day, "makuuchi", "scheduleDays") if allow_schedule_existing else None
        existing_schedule_juryo = pick_existing_division_day(existing, day, "juryo", "scheduleDays") if allow_schedule_existing else None

        # Keep result/schedule fallbacks separated so scope updates cannot cross-contaminate day states.
        result_makuuchi = loaded_days[day]["makuuchi"] or existing_result_makuuchi or placeholder["makuuchi"]
        result_juryo = loaded_days[day]["juryo"] or existing_result_juryo or placeholder["juryo"]
        schedule_makuuchi = loaded_days[day]["makuuchi"] or existing_schedule_makuuchi or placeholder["makuuchi"]
        schedule_juryo = loaded_days[day]["juryo"] or existing_schedule_juryo or placeholder["juryo"]

        result_makuuchi = sanitize_division_day(result_makuuchi, 1)
        result_juryo = sanitize_division_day(result_juryo, 2)
        schedule_makuuchi = sanitize_division_day(schedule_makuuchi, 1)
        schedule_juryo = sanitize_division_day(schedule_juryo, 2)

        result_day_data = {
            "makuuchi": result_makuuchi,
            "juryo": result_juryo,
        }
        schedule_day_data = {
            "makuuchi": schedule_makuuchi,
            "juryo": schedule_juryo,
        }
        result_day_active_ids = collect_active_ids_from_day(result_day_data)
        schedule_day_active_ids = collect_active_ids_from_day(schedule_day_data)

        # Synchronize dayHead across both divisions using the calculated actual_date.
        canonical_day_head = build_day_head(day, actual_date)
        result_makuuchi = {
            **result_makuuchi,
            "dayHead": canonical_day_head,
            "absentees": derive_absentees(result_makuuchi, rosters["makuuchi"], result_day_active_ids),
        }
        result_juryo = {
            **result_juryo,
            "dayHead": canonical_day_head,
            "absentees": derive_absentees(result_juryo, rosters["juryo"], result_day_active_ids),
        }
        schedule_makuuchi = {
            **schedule_makuuchi,
            "dayHead": canonical_day_head,
            "absentees": derive_absentees(schedule_makuuchi, rosters["makuuchi"], schedule_day_active_ids),
        }
        schedule_juryo = {
            **schedule_juryo,
            "dayHead": canonical_day_head,
            "absentees": derive_absentees(schedule_juryo, rosters["juryo"], schedule_day_active_ids),
        }

        result_day_data = {
            "makuuchi": result_makuuchi,
            "juryo": result_juryo,
        }
        schedule_day_data = {
            "makuuchi": schedule_makuuchi,
            "juryo": schedule_juryo,
        }
        result_status, schedule_status = determine_archive_statuses(day, effective_today_day, result_day_data, schedule_day_data)

        result_days.append(build_archive_day(result_day_data, gregorian_year, "result", result_status))
        schedule_days.append(build_archive_day(schedule_day_data, gregorian_year, "schedule", schedule_status))

        if day == effective_today_day:
            today_data = result_day_data
        if day == tomorrow_day:
            tomorrow_data = schedule_day_data

    return {
        "updatedAt": current_timestamp,
        "resultUpdatedAt": current_timestamp,
        "scheduleUpdatedAt": current_timestamp,
        "today": today_data,
        "tomorrow": tomorrow_data,
        "resultDays": result_days,
        "scheduleDays": schedule_days,
    }


def load_existing_torikumi_json() -> dict | None:
    path = API_DIR / "torikumi.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def build_torikumi_meta_fallback(existing: dict) -> dict:
    result_days = list(existing.get("resultDays", []) or [])
    schedule_days = list(existing.get("scheduleDays", []) or [])

    month_key = ""
    if result_days:
        month_key = str(result_days[0].get("pathDate", ""))[:6]
    elif schedule_days:
        month_key = str(schedule_days[0].get("pathDate", ""))[:6]
    basho_id = safe_int(month_key, 0)

    published_result_days = [
        safe_int(day.get("day", 0), 0)
        for day in result_days
        if str(day.get("status", "")) == "published"
    ]
    current_day = max(published_result_days) if published_result_days else 1
    current_day = max(1, min(current_day, 15))

    updated_at = str(existing.get("updatedAt", "")) or current_timestamp_iso()
    return {
        "basho_name": str(existing.get("bashoName", "")),
        "year_jp": str(existing.get("year", "")),
        "BashoInfo": {
            "basho_id": basho_id,
            "day": current_day,
            "today": updated_at,
        },
    }


def apply_torikumi_scope(dataset: dict, scope: str, existing: dict | None = None) -> dict:
    if scope == "all":
        return dataset

    existing = existing or {}
    merged = dict(dataset)
    result_updated_at = dataset["resultUpdatedAt"]
    schedule_updated_at = dataset["scheduleUpdatedAt"]

    if scope == "result":
        merged["scheduleDays"] = existing.get("scheduleDays", dataset["scheduleDays"])
        schedule_updated_at = existing.get("scheduleUpdatedAt") or existing.get("updatedAt") or schedule_updated_at
    elif scope == "schedule":
        merged["resultDays"] = existing.get("resultDays", dataset["resultDays"])
        result_updated_at = existing.get("resultUpdatedAt") or existing.get("updatedAt") or result_updated_at
    else:
        raise ValueError(f"unsupported torikumi scope: {scope}")

    merged["resultUpdatedAt"] = result_updated_at
    merged["scheduleUpdatedAt"] = schedule_updated_at
    merged["updatedAt"] = max(result_updated_at, schedule_updated_at)
    return merged


TORIKUMI_TIMESTAMP_KEYS = {"updatedAt", "resultUpdatedAt", "scheduleUpdatedAt"}


def strip_torikumi_timestamps(value: object) -> object:
    if isinstance(value, dict):
        return {
            key: strip_torikumi_timestamps(inner)
            for key, inner in value.items()
            if key not in TORIKUMI_TIMESTAMP_KEYS
        }
    if isinstance(value, list):
        return [strip_torikumi_timestamps(item) for item in value]
    return value


def has_substantive_torikumi_diff(candidate: dict, existing: dict | None) -> bool:
    if existing is None:
        return True
    return strip_torikumi_timestamps(candidate) != strip_torikumi_timestamps(existing)


def preserve_torikumi_timestamps_if_unchanged(candidate: dict, existing: dict | None) -> tuple[dict, bool]:
    if has_substantive_torikumi_diff(candidate, existing):
        return candidate, True

    assert existing is not None
    merged = dict(candidate)
    result_updated_at = str(existing.get("resultUpdatedAt") or existing.get("updatedAt") or merged.get("resultUpdatedAt") or "")
    schedule_updated_at = str(existing.get("scheduleUpdatedAt") or existing.get("updatedAt") or merged.get("scheduleUpdatedAt") or "")
    updated_at = str(existing.get("updatedAt") or max(result_updated_at, schedule_updated_at))
    merged["resultUpdatedAt"] = result_updated_at
    merged["scheduleUpdatedAt"] = schedule_updated_at
    merged["updatedAt"] = updated_at
    return merged, False


def write_sumo_data(makuuchi: list[dict], juryo: list[dict]) -> None:
    content = f"""export interface Rikishi {{
  id: number;
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw')[];
  profileUrl: string;
  memo?: string;
}}

export interface RankGroup {{
  title: string;
  east: Rikishi[];
  west: Rikishi[];
}}

export const makuuchiData: RankGroup[] = {json.dumps(makuuchi, ensure_ascii=False, indent=2)};

export const juryo: RankGroup[] = {json.dumps(juryo, ensure_ascii=False, indent=2)};
"""
    SUMO_OUTPUT.write_text(content, encoding="utf-8")


def write_torikumi_data(dataset: dict, year_jp: str, basho_name: str) -> None:
    content = f"""export interface TorikumiMatch {{
  division: '幕内' | '十両';
  boutNo: number;
  eastName: string;
  eastYomi: string;
  eastEnglish: string;
  eastRank: string;
  eastProfileUrl: string;
  westName: string;
  westYomi: string;
  westEnglish: string;
  westRank: string;
  westProfileUrl: string;
  kimarite: string;
  winner?: 'east' | 'west' | null;
}}

export interface TorikumiDivisionDay {{
  day: number;
  dayName: string;
  dayHead: string;
  division: '幕内' | '十両';
  absentees?: Array<{{
    id: number;
    name: string;
    profileUrl: string;
  }}>;
  matches: TorikumiMatch[];
}}

export interface TorikumiDailyData {{
  makuuchi: TorikumiDivisionDay;
  juryo: TorikumiDivisionDay;
}}

export interface TorikumiArchiveDay {{
  day: number;
  isoDate: string;
  pathDate: string;
  label: string;
  dayHead: string;
  status: 'published' | 'pending';
  statusMessage?: string | null;
  data: TorikumiDailyData;
}}

export interface TorikumiDataSet {{
  bashoName: string;
  year: string;
  updatedAt: string;
  resultUpdatedAt: string;
  scheduleUpdatedAt: string;
  today?: TorikumiDailyData;
  tomorrow?: TorikumiDailyData;
  resultDays?: TorikumiArchiveDay[];
  scheduleDays?: TorikumiArchiveDay[];
}}

export const torikumiData: TorikumiDataSet = {json.dumps({
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": dataset["updatedAt"],
        "resultUpdatedAt": dataset["resultUpdatedAt"],
        "scheduleUpdatedAt": dataset["scheduleUpdatedAt"],
        "today": dataset["today"],
        "tomorrow": dataset["tomorrow"],
        "resultDays": dataset["resultDays"],
        "scheduleDays": dataset["scheduleDays"],
    }, ensure_ascii=False, indent=2)};

export const torikumiArchive = {{
  bashoName: torikumiData.bashoName,
  year: torikumiData.year,
  updatedAt: torikumiData.updatedAt,
  resultUpdatedAt: torikumiData.resultUpdatedAt,
  scheduleUpdatedAt: torikumiData.scheduleUpdatedAt,
  resultDays: torikumiData.resultDays ?? [],
  scheduleDays: torikumiData.scheduleDays ?? [],
}};

export const torikumiMonthKey = torikumiArchive.resultDays[0]?.pathDate.slice(0, 6)
  ?? torikumiArchive.scheduleDays[0]?.pathDate.slice(0, 6)
  ?? '202603';

export const banzukePath = `/${{torikumiMonthKey}}-banduke`;
"""
    TORIKUMI_OUTPUT.write_text(content, encoding="utf-8")


def write_api_json(
    torikumi_dataset: dict,
    year_jp: str,
    basho_name: str,
    makuuchi: list[dict] | None = None,
    juryo: list[dict] | None = None,
) -> None:
    API_DIR.mkdir(parents=True, exist_ok=True)
    if makuuchi is not None and juryo is not None:
        banzuke_json = {
            "bashoName": basho_name,
            "year": year_jp,
            "updatedAt": torikumi_dataset["updatedAt"],
            "makuuchi": makuuchi,
            "juryo": juryo,
        }
        (API_DIR / "banzuke.json").write_text(json.dumps(banzuke_json, ensure_ascii=False, indent=2), encoding="utf-8")

    torikumi_json = {
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": torikumi_dataset["updatedAt"],
        "resultUpdatedAt": torikumi_dataset["resultUpdatedAt"],
        "scheduleUpdatedAt": torikumi_dataset["scheduleUpdatedAt"],
        "today": torikumi_dataset["today"],
        "tomorrow": torikumi_dataset["tomorrow"],
        "resultDays": torikumi_dataset["resultDays"],
        "scheduleDays": torikumi_dataset["scheduleDays"],
    }
    (API_DIR / "torikumi.json").write_text(json.dumps(torikumi_json, ensure_ascii=False, indent=2), encoding="utf-8")


# Profile page parser for extracting rikishi details from HTML
class ProfileParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.photo_url = ""
        self.birth_date = ""
        self.height = 0
        self.weight = 0
        self.shusshin = ""
        self.debut = ""
        self.career_wins = 0
        self.career_losses = 0
        self.career_draws = 0
        self.in_photo_img = False
        self.current_alt = ""
        self.current_data_label = ""
        self.capture_photo = False
        self.og_image = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "meta":
            prop = attrs_dict.get("property", "")
            if prop == "og:image":
                self.og_image = attrs_dict.get("content", "")
        elif tag == "img":
            # Look for profile photo
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            if "profile" in src.lower() or "rikishi" in src.lower():
                self.photo_url = src
            if alt:
                self.current_alt = alt

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return
        # Parse table data labels
        if data in {"生年月日", "誕生日"}:
            self.current_data_label = "birth"
        elif data == "身長":
            self.current_data_label = "height"
        elif data == "体重":
            self.current_data_label = "weight"
        elif data in {"出身地", "出身"}:
            self.current_data_label = "shusshin"
        elif data == "初土俵":
            self.current_data_label = "debut"
        elif data == "通算成績":
            self.current_data_label = "career"
        elif self.current_data_label:
            if self.current_data_label == "birth":
                self.birth_date = data
                self.current_data_label = ""
            elif self.current_data_label == "height":
                match = re.search(r"\d+", data)
                if match:
                    self.height = int(match.group())
                self.current_data_label = ""
            elif self.current_data_label == "weight":
                match = re.search(r"\d+", data)
                if match:
                    self.weight = int(match.group())
                self.current_data_label = ""
            elif self.current_data_label == "shusshin":
                self.shusshin = data
                self.current_data_label = ""
            elif self.current_data_label == "debut":
                self.debut = data
                self.current_data_label = ""
            elif self.current_data_label == "career":
                # Parse win/loss/draw from "XXX勝XXX敗XX休" format
                wins_match = re.search(r"(\d+)勝", data)
                losses_match = re.search(r"(\d+)敗", data)
                draws_match = re.search(r"(\d+)休", data)
                if wins_match:
                    self.career_wins = int(wins_match.group(1))
                if losses_match:
                    self.career_losses = int(losses_match.group(1))
                if draws_match:
                    self.career_draws = int(draws_match.group(1))
                self.current_data_label = ""


def fetch_profile_html(rikishi_id: int) -> str | None:
    """Fetch profile page HTML from sumo.or.jp"""
    url = f"{BASE_URL}/ResultRikishiData/profile/{rikishi_id}/"
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,*/*",
        },
    )
    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as res:
                return res.read().decode("utf-8")
        except Exception as exc:
            if attempt == 2:
                print(f"[warn] Failed to fetch profile {rikishi_id}: {exc}", file=sys.stderr)
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


def parse_profile_html(html: str) -> dict | None:
    """Parse profile HTML and extract rikishi details"""
    if not HTMLParser:
        return None
    parser = ProfileParser()
    try:
        parser.feed(html)
    except Exception as exc:
        print(f"[warn] Failed to parse profile HTML: {exc}", file=sys.stderr)
        return None

    # Prefer og:image, fallback to img tag found
    photo_url = parser.og_image or parser.photo_url

    result = {
        "birthDate": parser.birth_date,
        "height": parser.height,
        "weight": parser.weight,
        "shusshin": parser.shusshin,
        "debut": parser.debut,
        "careerStats": {
            "wins": parser.career_wins,
            "losses": parser.career_losses,
            "draws": parser.career_draws,
        },
        "photoUrl": photo_url,
    }

    # Only return if we got some meaningful data
    if any([parser.birth_date, parser.height, parser.weight, parser.shusshin, parser.debut, photo_url]):
        return result
    return None


def load_rikishi_profile(rikishi_id: int) -> dict | None:
    """Load complete profile for a single rikishi"""
    html = fetch_profile_html(rikishi_id)
    if not html:
        return None
    return parse_profile_html(html)


def build_rikishi_list(makuuchi: list[dict], juryo: list[dict]) -> list[dict]:
    """Build a flat list of all rikishi from rank groups"""
    rikishi_list = []
    for group in makuuchi + juryo:
        for side in ("east", "west"):
            for rikishi in group.get(side, []):
                rikishi_list.append({
                    "id": rikishi["id"],
                    "name": rikishi["name"],
                    "yomi": rikishi["yomi"],
                    "currentRank": rikishi["rank"],
                    "profileUrl": rikishi["profileUrl"],
                })
    return rikishi_list


def get_local_image_url(rikishi_id: int) -> str:
    """Check for local image and return the appropriate URL"""
    local_images_dir = Path("public/images/rikishi")

    # Check for different image formats in order of preference
    for ext in [".jpg", ".png", ".svg"]:
        image_path = local_images_dir / f"{rikishi_id}{ext}"
        if image_path.exists():
            return f"/images/rikishi/{rikishi_id}{ext}"

    return ""


def write_rikishi_json(rikishi_list: list[dict], profiles: dict[int, dict]) -> None:
    """Write rikishi.json with basic list and detailed profiles"""
    API_DIR.mkdir(parents=True, exist_ok=True)
    updated_at = current_timestamp_iso()

    # Write main rikishi.json with basic info
    rikishi_json = {
        "updatedAt": updated_at,
        "rikishi": rikishi_list,
    }
    (API_DIR / "rikishi.json").write_text(
        json.dumps(rikishi_json, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    # Write individual profile JSONs
    profile_dir = API_DIR / "rikishi"
    profile_dir.mkdir(exist_ok=True)
    local_image_count = 0
    for rikishi in rikishi_list:
        rikishi_id = rikishi["id"]
        profile_data = profiles.get(rikishi_id, {})

        # Check for local image first, fall back to scraped photoUrl
        local_image_url = get_local_image_url(rikishi_id)
        photo_url = local_image_url if local_image_url else profile_data.get("photoUrl", "")
        if local_image_url:
            local_image_count += 1

        profile_json = {
            "id": rikishi_id,
            "name": rikishi["name"],
            "yomi": rikishi["yomi"],
            "currentRank": rikishi["currentRank"],
            "birthDate": profile_data.get("birthDate", ""),
            "height": profile_data.get("height", 0),
            "weight": profile_data.get("weight", 0),
            "shusshin": profile_data.get("shusshin", ""),
            "debut": profile_data.get("debut", ""),
            "careerStats": profile_data.get("careerStats", {"wins": 0, "losses": 0, "draws": 0}),
            "photoUrl": photo_url,
            "sourceUrl": rikishi["profileUrl"],
            "updatedAt": updated_at,
        }
        (profile_dir / f"{rikishi_id}.json").write_text(
            json.dumps(profile_json, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    print(f"[info] Wrote {len(rikishi_list)} rikishi to rikishi.json and {len(profiles)} profiles")
    print(f"[info] Using {local_image_count} local images from public/images/rikishi/")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--torikumi-only", action="store_true", help="Only refresh torikumi outputs.")
    parser.add_argument("--rikishi-only", action="store_true", help="Only refresh rikishi profile data.")
    parser.add_argument(
        "--skip-rikishi-fetch",
        action="store_true",
        help="Skip fetching/writing rikishi profile JSON even when refreshing banzuke and torikumi.",
    )
    parser.add_argument(
        "--torikumi-scope",
        choices=TORIKUMI_SCOPES,
        default="all",
        help="Choose whether to refresh all torikumi data, result pages only, or schedule pages only.",
    )
    parser.add_argument(
        "--profile-limit",
        type=int,
        default=0,
        help="Limit number of rikishi profiles to fetch (0 = no limit).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.rikishi_only:
        # Only fetch rikishi profiles without refreshing banzuke/torikumi
        makuuchi = None
        juryo = None
        makuuchi_meta = load_banzuke_meta(1)
        basho_name = str(makuuchi_meta.get("basho_name", ""))
        year_jp = str(makuuchi_meta.get("year_jp", ""))

        existing_banzuke_path = API_DIR / "banzuke.json"
        if existing_banzuke_path.exists():
            existing = json.loads(existing_banzuke_path.read_text(encoding="utf-8"))
            makuuchi = existing.get("makuuchi", [])
            juryo = existing.get("juryo", [])
        else:
            # Fall back to building rank groups
            makuuchi, _ = build_rank_groups(1)
            juryo, _ = build_rank_groups(2)
    elif args.torikumi_only:
        makuuchi = None
        juryo = None
        try:
            makuuchi_meta = load_banzuke_meta(1)
        except Exception as exc:
            existing_torikumi = load_existing_torikumi_json()
            if not existing_torikumi:
                raise
            print(
                f"[warn] banzuke metadata fetch failed in torikumi-only mode, using local fallback ({exc})",
                file=sys.stderr,
            )
            makuuchi_meta = build_torikumi_meta_fallback(existing_torikumi)
        basho_name = str(makuuchi_meta.get("basho_name", ""))
        year_jp = str(makuuchi_meta.get("year_jp", ""))
    else:
        makuuchi, makuuchi_meta = build_rank_groups(1)
        juryo, _ = build_rank_groups(2)
        basho_name = str(makuuchi_meta.get("basho_name", ""))
        year_jp = str(makuuchi_meta.get("year_jp", ""))

    # Handle rikishi profile fetching
    profiles: dict[int, dict] = {}
    if makuuchi is not None and juryo is not None and not args.skip_rikishi_fetch:
        rikishi_list = build_rikishi_list(makuuchi, juryo)

        limit = args.profile_limit
        if limit > 0:
            rikishi_list = rikishi_list[:limit]

        print(f"[info] Fetching profiles for {len(rikishi_list)} rikishi...")
        for i, rikishi in enumerate(rikishi_list):
            if (i + 1) % 10 == 0:
                print(f"[info] Progress: {i + 1}/{len(rikishi_list)}")
            profile = load_rikishi_profile(rikishi["id"])
            if profile:
                profiles[rikishi["id"]] = profile
            time.sleep(0.3)  # Be polite to the server

        write_rikishi_json(rikishi_list, profiles)
    elif makuuchi is not None and juryo is not None and args.skip_rikishi_fetch:
        print("[info] Skipping rikishi profile refresh (--skip-rikishi-fetch)")

    # Handle torikumi/banzuke if needed
    if not args.rikishi_only:
        basho_info = makuuchi_meta["BashoInfo"]
        basho_id = int(basho_info.get("basho_id", 1))
        current_day = safe_int(basho_info.get("day", 1), 1)
        updated_at = str(basho_info.get("today", ""))

        existing_torikumi = load_existing_torikumi_json()
        torikumi_dataset = build_torikumi_dataset(basho_id, current_day, updated_at, existing_torikumi)
        torikumi_dataset = apply_torikumi_scope(
            torikumi_dataset,
            args.torikumi_scope,
            existing_torikumi,
        )
        torikumi_dataset, torikumi_changed = preserve_torikumi_timestamps_if_unchanged(
            torikumi_dataset,
            existing_torikumi,
        )
        if not torikumi_changed:
            print("[info] Torikumi payload unchanged; preserving existing timestamps")

        if makuuchi is not None and juryo is not None:
            write_sumo_data(makuuchi, juryo)
        write_torikumi_data(torikumi_dataset, year_jp, basho_name)
        write_api_json(torikumi_dataset, year_jp, basho_name, makuuchi, juryo)

        print(
            "updated: "
            f"mode={'rikishi-only' if args.rikishi_only else 'torikumi-only' if args.torikumi_only else 'full'}, "
            f"scope={args.torikumi_scope}, "
            f"result_days={len(torikumi_dataset['resultDays'])}, "
            f"schedule_days={len(torikumi_dataset['scheduleDays'])}"
        )
    else:
        print(
            f"updated: rikishi_only, "
            f"profiles_collected={len(profiles)}"
        )


if __name__ == "__main__":
    main()
