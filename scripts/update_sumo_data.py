import argparse
import json
import re
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

BASE_URL = "https://www.sumo.or.jp"
SUMO_OUTPUT = Path("app/lib/sumo-data.ts")
TORIKUMI_OUTPUT = Path("app/lib/torikumi-data.ts")
API_DIR = Path("public/api/v1")
EXPECTED_RIKISHI_COUNT = {1: 42, 2: 28}
DIVISION_LABEL = {1: "幕内", 2: "十両"}
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
    req = Request(
        f"{BASE_URL}{path}",
        data=urlencode(payload).encode("utf-8"),
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
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

    table = sorted(banzuke.get("BanzukeTable", []), key=lambda item: int(item["banzuke_id"]))
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
    east = raw["east"]
    west = raw["west"]
    judge = int(raw.get("judge", 9))
    kimarite = str(raw.get("technic_name", "")).strip()
    if kimarite in {"", "&nbsp;"}:
        kimarite = "未定"

    east_name = extract_alt_text(str(east.get("shikona", ""))) or str(east.get("shikona_kana", ""))
    west_name = extract_alt_text(str(west.get("shikona", ""))) or str(west.get("shikona_kana", ""))

    winner = "east" if judge == 1 else "west" if judge == 2 else None

    return {
        "division": division,
        "boutNo": bout_no,
        "eastName": east_name,
        "eastYomi": str(east.get("shikona_kana", "")),
        "eastEnglish": str(east.get("shikona_eng", "")),
        "eastRank": str(east.get("banzuke_name", "")),
        "eastProfileUrl": f"{BASE_URL}/ResultRikishiData/profile/{int(east['rikishi_id'])}/",
        "westName": west_name,
        "westYomi": str(west.get("shikona_kana", "")),
        "westEnglish": str(west.get("shikona_eng", "")),
        "westRank": str(west.get("banzuke_name", "")),
        "westProfileUrl": f"{BASE_URL}/ResultRikishiData/profile/{int(west['rikishi_id'])}/",
        "kimarite": kimarite,
        "winner": winner,
    }


def load_torikumi_day(basho_id: int, day: int, kakuzuke_id: int) -> dict:
    payload = {
        "basho_id": str(basho_id),
        "kakuzuke_id": str(kakuzuke_id),
        "day": str(day),
    }
    data = post_json(f"/ResultData/torikumiAjax/{kakuzuke_id}/{day}/", payload)
    if data.get("Result") != "1":
        raise RuntimeError(f"torikumiAjax failed: kakuzuke_id={kakuzuke_id}, day={day}")

    all_matches = list(data.get("TorikumiData", [])) + list(data.get("FinalMuch", []))
    if not all_matches:
        raise ValueError(f"取組データ未公開: {DIVISION_LABEL[kakuzuke_id]} day={day}")

    parsed = [
        parse_torikumi_match(match, DIVISION_LABEL[kakuzuke_id], idx + 1)
        for idx, match in enumerate(all_matches)
    ]

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
        fallback_year = date.fromisoformat(fallback_updated_at).year

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
        return date.fromisoformat(fallback_updated_at) - timedelta(days=safe_day - 1)
    return datetime.now(JST).date()


def has_any_matches(day_data: dict) -> bool:
    return bool(day_data["makuuchi"]["matches"] or day_data["juryo"]["matches"])


def has_settled_matches(day_data: dict) -> bool:
    return any(
        match.get("winner") is not None
        for division in (day_data["makuuchi"], day_data["juryo"])
        for match in division["matches"]
    )


def build_torikumi_dataset(basho_id: int, current_day: int, updated_at: str) -> dict:
    loaded_days = {}
    for day in range(1, 16):
        loaded_days[day] = {
            "makuuchi": try_load_torikumi_day(basho_id, day, 1),
            "juryo": try_load_torikumi_day(basho_id, day, 2),
        }

    start_date = resolve_basho_start_date(loaded_days, updated_at, current_day)
    current_date = datetime.now(JST).date()
    today_day = max(1, min((current_date - start_date).days + 1, 15))
    tomorrow_day = min(today_day + 1, 15)
    gregorian_year = str(start_date.year)

    result_days = []
    schedule_days = []
    today_data = None
    tomorrow_data = None

    for day in range(1, 16):
        actual_date = start_date + timedelta(days=day - 1)
        placeholder = build_placeholder_day(day, actual_date)
        makuuchi = loaded_days[day]["makuuchi"] or placeholder["makuuchi"]
        juryo = loaded_days[day]["juryo"] or placeholder["juryo"]
        day_data = {
            "makuuchi": makuuchi,
            "juryo": juryo,
        }

        schedule_status = "published" if has_any_matches(day_data) else "pending"
        result_status = "published" if (day <= today_day and has_any_matches(day_data)) or has_settled_matches(day_data) else "pending"

        result_days.append(build_archive_day(day_data, gregorian_year, "result", result_status))
        schedule_days.append(build_archive_day(day_data, gregorian_year, "schedule", schedule_status))

        if day == today_day:
            today_data = day_data
        if day == tomorrow_day:
            tomorrow_data = day_data

    return {
        "updatedAt": current_date.isoformat(),
        "resultUpdatedAt": current_date.isoformat(),
        "scheduleUpdatedAt": current_date.isoformat(),
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--torikumi-only", action="store_true", help="Only refresh torikumi outputs.")
    parser.add_argument(
        "--torikumi-scope",
        choices=TORIKUMI_SCOPES,
        default="all",
        help="Choose whether to refresh all torikumi data, result pages only, or schedule pages only.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.torikumi_only:
        makuuchi = None
        juryo = None
        makuuchi_meta = load_banzuke_meta(1)
    else:
        makuuchi, makuuchi_meta = build_rank_groups(1)
        juryo, _ = build_rank_groups(2)

    basho_info = makuuchi_meta["BashoInfo"]
    basho_id = int(makuuchi_meta["basho_id"])
    current_day = safe_int(basho_info.get("day", 1), 1)
    year_jp = str(makuuchi_meta.get("year_jp", ""))
    basho_name = str(makuuchi_meta.get("basho_name", ""))
    updated_at = str(basho_info.get("today", ""))

    torikumi_dataset = build_torikumi_dataset(basho_id, current_day, updated_at)
    torikumi_dataset = apply_torikumi_scope(
        torikumi_dataset,
        args.torikumi_scope,
        load_existing_torikumi_json(),
    )

    if makuuchi is not None and juryo is not None:
        write_sumo_data(makuuchi, juryo)
    write_torikumi_data(torikumi_dataset, year_jp, basho_name)
    write_api_json(torikumi_dataset, year_jp, basho_name, makuuchi, juryo)

    print(
        "updated: "
        f"mode={'torikumi-only' if args.torikumi_only else 'full'}, "
        f"scope={args.torikumi_scope}, "
        f"result_days={len(torikumi_dataset['resultDays'])}, "
        f"schedule_days={len(torikumi_dataset['scheduleDays'])}"
    )


if __name__ == "__main__":
    main()
