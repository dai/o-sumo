"""Generate photo-free official gyoji and yobidashi JSON from JSA HTML."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import tempfile
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable
from urllib.parse import urljoin
from urllib.request import Request, urlopen


BASE_URL = "https://www.sumo.or.jp"
KINDS = ("gyoji", "yobidashi")
RANK_CODES = {
    "gyoji": {
        "立行司": "tate-gyoji", "三役行司": "sanyaku-gyoji", "幕内行司": "makuuchi-gyoji",
        "十両行司": "juryo-gyoji", "幕下行司": "makushita-gyoji", "三段目行司": "sandanme-gyoji",
        "序二段行司": "jonidan-gyoji", "序ノ口行司": "jonokuchi-gyoji",
    },
    "yobidashi": {
        "立呼出": "tate-yobidashi", "副立呼出": "fuku-tate-yobidashi", "三役呼出": "sanyaku-yobidashi",
        "幕内呼出": "makuuchi-yobidashi", "十両呼出": "juryo-yobidashi", "幕下呼出": "makushita-yobidashi",
        "三段目呼出": "sandanme-yobidashi", "序二段呼出": "jonidan-yobidashi", "序ノ口呼出": "jonokuchi-yobidashi",
    },
}
ERA_BASE_YEAR = {"明治": 1867, "大正": 1911, "昭和": 1925, "平成": 1988, "令和": 2018}


def clean(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").replace("\u2003", " ").split())


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[dict[str, object]]]] = []
        self._table_depth = 0
        self._rows: list[list[dict[str, object]]] = []
        self._row: list[dict[str, object]] | None = None
        self._cell: dict[str, object] | None = None
        self._anchor: dict[str, str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "table":
            if self._table_depth == 0:
                self._rows = []
            self._table_depth += 1
            return
        if not self._table_depth:
            return
        if tag == "tr" and self._table_depth == 1:
            self._row = []
        elif tag in {"td", "th"} and self._row is not None:
            self._cell = {"tag": tag, "parts": [], "links": []}
        elif tag == "a" and self._cell is not None:
            self._anchor = {"href": dict(attrs).get("href") or "", "text": ""}

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell["parts"].append(data)  # type: ignore[index]
        if self._anchor is not None:
            self._anchor["text"] += data

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._anchor is not None and self._cell is not None:
            self._cell["links"].append(self._anchor)  # type: ignore[index]
            self._anchor = None
        elif tag in {"td", "th"} and self._cell is not None and self._row is not None:
            self._cell["text"] = clean("".join(self._cell.pop("parts")))  # type: ignore[index]
            self._row.append(self._cell)
            self._cell = None
        elif tag == "tr" and self._row is not None:
            self._rows.append(self._row)
            self._row = None
        elif tag == "table" and self._table_depth:
            self._table_depth -= 1
            if self._table_depth == 0:
                self.tables.append(self._rows)


def parse_tables(html: str) -> list[list[list[dict[str, object]]]]:
    parser = TableParser()
    parser.feed(html)
    return parser.tables


def cell_text(cell: dict[str, object]) -> str:
    return str(cell["text"])


def official_url(kind: str) -> str:
    return f"{BASE_URL}/IrohaKyokaiMember/{kind}/"


def parse_index(html: str, kind: str) -> list[dict[str, object]]:
    if kind not in KINDS:
        raise ValueError(f"unsupported kind: {kind}")
    rows = next(
        (table for table in parse_tables(html) if table and "格付" in [cell_text(cell) for cell in table[0]]),
        None,
    )
    if rows is None:
        raise ValueError(f"{kind} index table was not found")
    officials: list[dict[str, object]] = []
    for row in rows[1:]:
        if len(row) != 4:
            continue
        links = row[0]["links"]
        if not isinstance(links, list) or len(links) != 1:
            raise ValueError(f"{kind} index row has no unique profile link")
        link = links[0]
        if not isinstance(link, dict):
            raise ValueError(f"{kind} index profile link is invalid")
        href = str(link["href"])
        match = re.fullmatch(rf"/Profile/{kind}/([1-9]\d*)/", href)
        if not match:
            raise ValueError(f"{kind} index has unsupported profile URL: {href}")
        yomi_match = re.search(r"（([^）]+)）", cell_text(row[0]))
        if not yomi_match:
            raise ValueError(f"{kind} {match.group(1)} has no yomi")
        rank = cell_text(row[2])
        rank_code = RANK_CODES[kind].get(rank)
        if rank_code is None:
            raise ValueError(f"{kind} {match.group(1)} has unknown rank: {rank}")
        official = {
            "id": int(match.group(1)),
            "name": clean(str(link["text"])),
            "yomi": clean(yomi_match.group(1)),
            "realName": cell_text(row[1]),
            "rank": rank,
            "rankCode": rank_code,
            "affiliation": cell_text(row[3]),
            "sourceUrl": urljoin(BASE_URL, href),
        }
        if not all(official[key] for key in ("name", "yomi", "realName", "affiliation")):
            raise ValueError(f"{kind} {official['id']} has missing required list data")
        officials.append(official)
    identifiers = [int(official["id"]) for official in officials]
    if not officials or len(identifiers) != len(set(identifiers)):
        raise ValueError(f"{kind} index has no officials or duplicate IDs")
    return officials


def normalize_date(value: str) -> str:
    match = re.search(r"(明治|大正|昭和|平成|令和)(元|\d+)年(\d+)月(\d+)日", value)
    if match is None:
        raise ValueError(f"unsupported birth date: {value}")
    year = ERA_BASE_YEAR[match.group(1)] + (1 if match.group(2) == "元" else int(match.group(2)))
    return date(year, int(match.group(3)), int(match.group(4))).isoformat()


def normalize_year_month(value: str) -> str:
    match = re.search(r"(明治|大正|昭和|平成|令和)(元|\d+)年(\d+)月", value)
    if match is None:
        raise ValueError(f"unsupported adopted date: {value}")
    month = int(match.group(3))
    if not 1 <= month <= 12:
        raise ValueError(f"invalid adopted month: {value}")
    year = ERA_BASE_YEAR[match.group(1)] + (1 if match.group(2) == "元" else int(match.group(2)))
    return f"{year:04d}-{month:02d}"


def parse_profile(html: str, official: dict[str, object], kind: str, retrieved_at: str) -> dict[str, object]:
    table = next((table for table in parse_tables(html) if any(cell_text(cell) == "生年月日" for row in table for cell in row)), None)
    if table is None or not table[0]:
        raise ValueError(f"{kind} {official['id']} profile table was not found")
    heading = cell_text(table[0][0])
    name, yomi, rank = (str(official[key]) for key in ("name", "yomi", "rank"))
    if name not in heading:
        raise ValueError(f"name mismatch for {kind} {official['id']}")
    if f"({yomi})" not in heading:
        raise ValueError(f"yomi mismatch for {kind} {official['id']}")
    if rank not in heading:
        raise ValueError(f"rank mismatch for {kind} {official['id']}")
    fields = {cell_text(row[0]): cell_text(row[1]) for row in table[1:] if len(row) == 2 and str(row[0]["tag"]) == "th"}
    required = ("本名", "生年月日", "出身地", "所属部屋", "採用年月")
    missing = [label for label in required if not fields.get(label)]
    if missing:
        raise ValueError(f"{kind} {official['id']} has missing profile fields: {', '.join(missing)}")
    if fields["本名"] != official["realName"]:
        raise ValueError(f"real name mismatch for {kind} {official['id']}")
    if fields["所属部屋"] != official["affiliation"]:
        raise ValueError(f"affiliation mismatch for {kind} {official['id']}")
    profile = dict(official)
    profile.update({
        "kind": kind,
        "birthDate": normalize_date(fields["生年月日"]),
        "birthplace": fields["出身地"],
        "adoptedAt": normalize_year_month(fields["採用年月"]),
        "retrievedAt": retrieved_at,
    })
    if fields.get("行司名履歴"):
        profile["nameHistory"] = [clean(item) for item in fields["行司名履歴"].split("→") if clean(item)]
    return profile


def fetch_url(url: str) -> str:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=30) as response:
        return response.read().decode(response.headers.get_content_charset() or "utf-8")


def fixture_fetcher(fixtures_dir: Path) -> Callable[[str], str]:
    def fetch(url: str) -> str:
        index_match = re.fullmatch(rf"{re.escape(BASE_URL)}/IrohaKyokaiMember/(gyoji|yobidashi)/", url)
        profile_match = re.fullmatch(rf"{re.escape(BASE_URL)}/Profile/(gyoji|yobidashi)/(\d+)/", url)
        if index_match:
            fixture = fixtures_dir / f"{index_match.group(1)}-list.html"
        elif profile_match:
            fixture = fixtures_dir / f"{profile_match.group(1)}-{profile_match.group(2)}.html"
        else:
            raise ValueError(f"fixture URL is not supported: {url}")
        return fixture.read_text(encoding="utf-8")
    return fetch


def generate(fetch_text: Callable[[str], str], retrieved_at: str) -> dict[str, tuple[dict[str, object], list[dict[str, object]]]]:
    try:
        datetime.fromisoformat(retrieved_at.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError(f"retrievedAt is not ISO 8601: {retrieved_at}") from error
    generated = {}
    for kind in KINDS:
        officials = parse_index(fetch_text(official_url(kind)), kind)
        profiles = [parse_profile(fetch_text(str(official["sourceUrl"])), official, kind, retrieved_at) for official in officials]
        if len(profiles) != len(officials):
            raise ValueError(f"{kind} profile count does not match index")
        generated[kind] = ({"retrievedAt": retrieved_at, "source": official_url(kind), "officials": officials}, profiles)
    return generated


def write_json_outputs(output_root: Path, generated: dict[str, tuple[dict[str, object], list[dict[str, object]]]]) -> None:
    output_root.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix=".official-profiles-stage-", dir=output_root))
    backups: list[tuple[Path, Path]] = []
    targets = [Path(f"{kind}.json") for kind in KINDS] + [Path(kind) for kind in KINDS]
    try:
        for kind, (index, profiles) in generated.items():
            (stage / kind).mkdir()
            (stage / f"{kind}.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            for profile in profiles:
                (stage / kind / f"{profile['id']}.json").write_text(json.dumps(profile, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for target in targets:
            destination = output_root / target
            if destination.exists():
                backup = stage / f"backup-{target.name}"
                os.replace(destination, backup)
                backups.append((destination, backup))
        for target in targets:
            os.replace(stage / target, output_root / target)
    except Exception:
        for target in targets:
            destination = output_root / target
            if destination.exists() and not any(original == destination for original, _ in backups):
                if destination.is_dir():
                    shutil.rmtree(destination)
                else:
                    destination.unlink()
        for destination, backup in backups:
            if backup.exists() and not destination.exists():
                os.replace(backup, destination)
        raise
    finally:
        shutil.rmtree(stage, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, default=Path("public/api/v1"))
    parser.add_argument("--fixtures-dir", type=Path)
    parser.add_argument("--retrieved-at", default=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"))
    args = parser.parse_args()
    fetch_text = fixture_fetcher(args.fixtures_dir) if args.fixtures_dir else fetch_url
    try:
        generated = generate(fetch_text, args.retrieved_at)
        write_json_outputs(args.output_root, generated)
    except (OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1
    print(" ".join(f"{kind}={len(generated[kind][1])}" for kind in KINDS))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
