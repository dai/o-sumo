import json
import re
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://www.sumo.or.jp"
SUMO_OUTPUT = Path("app/lib/sumo-data.ts")
TORIKUMI_OUTPUT = Path("app/lib/torikumi-data.ts")
API_DIR = Path("public/api/v1")
EXPECTED_RIKISHI_COUNT = {1: 42, 2: 28}
EXPECTED_MATCH_COUNT = {1: 21, 2: 14}
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
    with urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))


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


def extract_iso_date(day_head: str, gregorian_year: str) -> str:
    match = re.search(r"(\d+)月(\d+)日", day_head)
    if not match:
        raise ValueError(f"日付抽出失敗: {day_head}")
    month = int(match.group(1))
    day = int(match.group(2))
    return f"{int(gregorian_year):04d}-{month:02d}-{day:02d}"


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


def build_archive_day(day_data: dict, gregorian_year: str, mode: str) -> dict:
    iso_date = extract_iso_date(day_data["makuuchi"]["dayHead"], gregorian_year)
    normalized = day_data if mode == "result" else make_schedule_daily_data(day_data)
    return {
        "day": int(day_data["makuuchi"]["day"]),
        "isoDate": iso_date,
        "pathDate": iso_date.replace("-", ""),
        "label": DAY_LABEL.get(int(day_data["makuuchi"]["day"]), f"{day_data['makuuchi']['day']}日目"),
        "dayHead": day_data["makuuchi"]["dayHead"],
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
        if "白" in alt:
            marks.append("win")
        elif "黒" in alt:
            marks.append("loss")
        elif alt:
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
    banzuke = post_json(
        f"/ResultBanzuke/tableAjax/{kakuzuke_id}/1/",
        {"kakuzuke_id": str(kakuzuke_id), "b": "0", "page": "1"},
    )
    if banzuke.get("Result") != "1":
        raise RuntimeError(f"tableAjax failed for kakuzuke_id={kakuzuke_id}")

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
    expected = EXPECTED_MATCH_COUNT[kakuzuke_id]
    if len(all_matches) != expected:
        raise ValueError(
            f"取組数不一致: {DIVISION_LABEL[kakuzuke_id]} {len(all_matches)}番/期待{expected}番 (day={day})"
        )

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


def build_torikumi_dataset(basho_id: int, current_day: int, gregorian_year: str) -> dict:
    today_day = max(1, min(current_day, 15))
    tomorrow_day = min(today_day + 1, 15)

    result_days = []
    for day in range(1, today_day + 1):
        result_days.append({
            "makuuchi": load_torikumi_day(basho_id, day, 1),
            "juryo": load_torikumi_day(basho_id, day, 2),
        })

    tomorrow = {
        "makuuchi": load_torikumi_day(basho_id, tomorrow_day, 1),
        "juryo": load_torikumi_day(basho_id, tomorrow_day, 2),
    }

    schedule_days = [build_archive_day(day_data, gregorian_year, "schedule") for day_data in result_days]
    if tomorrow_day > today_day:
        schedule_days.append(build_archive_day(tomorrow, gregorian_year, "schedule"))

    return {
        "updatedAt": None,
        "today": result_days[-1],
        "tomorrow": tomorrow,
        "resultDays": [build_archive_day(day_data, gregorian_year, "result") for day_data in result_days],
        "scheduleDays": schedule_days,
    }


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
  winner?: 'east' | 'west';
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
  data: TorikumiDailyData;
}}

export interface TorikumiDataSet {{
  bashoName: string;
  year: string;
  updatedAt: string;
  today?: TorikumiDailyData;
  tomorrow?: TorikumiDailyData;
  resultDays?: TorikumiArchiveDay[];
  scheduleDays?: TorikumiArchiveDay[];
}}

export const torikumiData: TorikumiDataSet = {json.dumps({
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": dataset["updatedAt"],
        "today": dataset["today"],
        "tomorrow": dataset["tomorrow"],
        "resultDays": dataset["resultDays"],
        "scheduleDays": dataset["scheduleDays"],
    }, ensure_ascii=False, indent=2)};

const DAY_NAME_BY_NUMBER: Record<number, string> = {{
  1: '初日',
  2: '二日目',
  3: '三日目',
  4: '四日目',
  5: '五日目',
  6: '六日目',
  7: '七日目',
  8: '中日',
  9: '九日目',
  10: '十日目',
  11: '十一日目',
  12: '十二日目',
  13: '十三日目',
  14: '十四日目',
  15: '千秋楽',
}};

function toIsoDate(dayHead: string): string {{
  const match = dayHead.match(/令和\\d+年(\\d+)月(\\d+)日/);
  if (!match) {{
    return '';
  }}

  const month = match[1].padStart(2, '0');
  const day = match[2].padStart(2, '0');
  const year = torikumiData.updatedAt.slice(0, 4) || '2026';
  return `${{year}}-${{month}}-${{day}}`;
}}

function toPathDate(isoDate: string): string {{
  return isoDate.replaceAll('-', '');
}}

function toLabel(day: number): string {{
  return DAY_NAME_BY_NUMBER[day] ?? `${{day}}日目`;
}}

function toScheduleData(dayData: TorikumiDailyData): TorikumiDailyData {{
  const clearMatches = (division: TorikumiDivisionDay): TorikumiDivisionDay => ({{
    ...division,
    matches: division.matches.map((match) => ({{
      ...match,
      kimarite: '未定',
      winner: null,
    }})),
  }});

  return {{
    makuuchi: clearMatches(dayData.makuuchi),
    juryo: clearMatches(dayData.juryo),
  }};
}}

function buildArchiveDay(dayData: TorikumiDailyData, mode: 'result' | 'schedule'): TorikumiArchiveDay {{
  const isoDate = toIsoDate(dayData.makuuchi.dayHead);
  const normalizedData = mode === 'result' ? dayData : toScheduleData(dayData);
  return {{
    day: dayData.makuuchi.day,
    isoDate,
    pathDate: toPathDate(isoDate),
    label: toLabel(dayData.makuuchi.day),
    dayHead: dayData.makuuchi.dayHead,
    data: normalizedData,
  }};
}}

const fallbackResultDays = torikumiData.today ? [buildArchiveDay(torikumiData.today, 'result')] : [];
const fallbackScheduleDays = [
  torikumiData.today ? buildArchiveDay(torikumiData.today, 'schedule') : null,
  torikumiData.tomorrow ? buildArchiveDay(torikumiData.tomorrow, 'schedule') : null,
].filter((day): day is TorikumiArchiveDay => day !== null);

export const torikumiArchive = {{
  bashoName: torikumiData.bashoName,
  year: torikumiData.year,
  updatedAt: torikumiData.updatedAt,
  resultDays: torikumiData.resultDays ?? fallbackResultDays,
  scheduleDays: torikumiData.scheduleDays ?? fallbackScheduleDays,
}};

export const torikumiMonthKey = torikumiArchive.resultDays[0]?.pathDate.slice(0, 6)
  ?? torikumiArchive.scheduleDays[0]?.pathDate.slice(0, 6)
  ?? '202603';

export const banzukePath = `/${{torikumiMonthKey}}-banduke`;
"""
    TORIKUMI_OUTPUT.write_text(content, encoding="utf-8")


def write_api_json(makuuchi: list[dict], juryo: list[dict], torikumi_dataset: dict, year_jp: str, basho_name: str) -> None:
    API_DIR.mkdir(parents=True, exist_ok=True)
    banzuke_json = {
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": torikumi_dataset["updatedAt"],
        "makuuchi": makuuchi,
        "juryo": juryo,
    }
    torikumi_json = {
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": torikumi_dataset["updatedAt"],
        "today": torikumi_dataset["today"],
        "tomorrow": torikumi_dataset["tomorrow"],
        "resultDays": torikumi_dataset["resultDays"],
        "scheduleDays": torikumi_dataset["scheduleDays"],
    }
    (API_DIR / "banzuke.json").write_text(json.dumps(banzuke_json, ensure_ascii=False, indent=2), encoding="utf-8")
    (API_DIR / "torikumi.json").write_text(json.dumps(torikumi_json, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    makuuchi, makuuchi_meta = build_rank_groups(1)
    juryo, _ = build_rank_groups(2)

    basho_info = makuuchi_meta["BashoInfo"]
    basho_id = int(makuuchi_meta["basho_id"])
    current_day = int(basho_info.get("day", 1))
    year_jp = str(makuuchi_meta.get("year_jp", ""))
    basho_name = str(makuuchi_meta.get("basho_name", ""))
    gregorian_year = str(basho_info.get("today", "")).split("-")[0]

    torikumi_dataset = build_torikumi_dataset(basho_id, current_day, gregorian_year)
    torikumi_dataset["updatedAt"] = basho_info.get("today", "")

    write_sumo_data(makuuchi, juryo)
    write_torikumi_data(torikumi_dataset, year_jp, basho_name)
    write_api_json(makuuchi, juryo, torikumi_dataset, year_jp, basho_name)

    print(
        "updated: "
        f"makuuchi={EXPECTED_RIKISHI_COUNT[1]}, "
        f"juryo={EXPECTED_RIKISHI_COUNT[2]}, "
        f"result_days={len(torikumi_dataset['resultDays'])}, "
        f"schedule_days={len(torikumi_dataset['scheduleDays'])}"
    )


if __name__ == "__main__":
    main()
