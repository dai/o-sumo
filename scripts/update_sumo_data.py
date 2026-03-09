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
        "dayHead": data.get("dayHead", ""),
        "division": DIVISION_LABEL[kakuzuke_id],
        "matches": parsed,
    }


def build_torikumi_dataset(basho_id: int, current_day: int) -> dict:
    today_day = max(1, min(current_day, 15))
    tomorrow_day = min(today_day + 1, 15)

    today = {
        "makuuchi": load_torikumi_day(basho_id, today_day, 1),
        "juryo": load_torikumi_day(basho_id, today_day, 2),
    }
    tomorrow = {
        "makuuchi": load_torikumi_day(basho_id, tomorrow_day, 1),
        "juryo": load_torikumi_day(basho_id, tomorrow_day, 2),
    }

    return {
        "updatedAt": None,
        "today": today,
        "tomorrow": tomorrow,
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

export interface TorikumiDataSet {{
  bashoName: string;
  year: string;
  updatedAt: string;
  today: TorikumiDailyData;
  tomorrow: TorikumiDailyData;
}}

export const torikumiData: TorikumiDataSet = {json.dumps({
        "bashoName": basho_name,
        "year": year_jp,
        "updatedAt": dataset["updatedAt"],
        "today": dataset["today"],
        "tomorrow": dataset["tomorrow"],
    }, ensure_ascii=False, indent=2)};
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

    torikumi_dataset = build_torikumi_dataset(basho_id, current_day)
    torikumi_dataset["updatedAt"] = basho_info.get("today", "")

    write_sumo_data(makuuchi, juryo)
    write_torikumi_data(torikumi_dataset, year_jp, basho_name)
    write_api_json(makuuchi, juryo, torikumi_dataset, year_jp, basho_name)

    print(
        "updated: "
        f"makuuchi={EXPECTED_RIKISHI_COUNT[1]}, "
        f"juryo={EXPECTED_RIKISHI_COUNT[2]}, "
        f"today_matches=35, tomorrow_matches=35"
    )


if __name__ == "__main__":
    main()
