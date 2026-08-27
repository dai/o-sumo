"""Read-only preflight for switching the current basho data set.

The command intentionally does not call any generator or write any repository
file.  Official readiness is obtained from the annual schedule page and the
official banzuke API; local files are used only for consistency checks.
"""

from __future__ import annotations

import argparse
import html as html_lib
import json
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Callable, Iterable
from urllib.parse import urlencode
from urllib.request import Request, urlopen


OFFICIAL_BASE = "https://sumo.or.jp"
ANNUAL_SCHEDULE_URL = f"{OFFICIAL_BASE}/Admission/schedule/"
BANZUKE_PAGE_URL = f"{OFFICIAL_BASE}/ResultBanzuke/table/"
BANZUKE_AJAX_PATH = "/ResultBanzuke/tableAjax/{division}/1/"
EXPECTED_COUNTS = {"makuuchi": 42, "juryo": 28}
WORKFLOW_FILES = (
    ".github/workflows/daily-data-update.yml",
    ".github/workflows/realtime-torikumi-direct-update.yml",
)
SOURCE_FILES = (
    "app/lib/archives-data.ts",
    "app/lib/archive-basho-data.ts",
    "app/lib/torikumi-routes.ts",
    "public/_redirects",
    "app/lib/sitemap.ts",
    "vite.config.ts",
)
MONTH_NAMES = {
    1: "一月場所",
    3: "三月場所",
    5: "五月場所",
    7: "七月場所",
    9: "九月場所",
    11: "十一月場所",
}
JAPANESE_DIGITS = {"〇": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}


@dataclass(frozen=True)
class OfficialSchedule:
    month_key: str
    announcement_date: date
    banzuke_date: date
    start_date: date
    end_date: date
    days: tuple[date, ...]


@dataclass(frozen=True)
class OfficialBanzuke:
    month_key: str
    year: str
    makuuchi_count: int
    juryo_count: int


@dataclass(frozen=True)
class Gate:
    name: str
    expected: str
    actual: str
    source: str
    ok: bool

    def line(self) -> str:
        state = "OK" if self.ok else "FAIL"
        return f"[{state}] {self.name} expected={self.expected} actual={self.actual} source={self.source}"


@dataclass(frozen=True)
class PreflightResult:
    gates: tuple[Gate, ...]
    status: str

    @property
    def exit_code(self) -> int:
        return 0 if self.status == "READY" else 1


def _japanese_number(raw: str) -> int:
    if raw.isdigit():
        return int(raw)
    if raw == "十":
        return 10
    if "十" in raw:
        left, _, right = raw.partition("十")
        return (JAPANESE_DIGITS.get(left, 1) * 10) + JAPANESE_DIGITS.get(right, 0)
    value = 0
    for char in raw:
        if char not in JAPANESE_DIGITS or JAPANESE_DIGITS[char] == 10:
            raise ValueError(f"invalid Japanese number: {raw}")
        value = value * 10 + JAPANESE_DIGITS[char]
    return value


def _year_from_text(raw: str) -> int | None:
    match = re.search(r"令和\s*(元|[0-9〇一二三四五六七八九十]+)年", raw)
    if match:
        return 2018 + (1 if match.group(1) == "元" else _japanese_number(match.group(1)))
    match = re.search(r"(?:^|\D)(20\d{2})年", raw)
    return int(match.group(1)) if match else None


def _parse_date_text(raw: str, default_year: int | None = None) -> date | None:
    year = _year_from_text(raw) or default_year
    match = re.search(r"(?:令和\s*(?:元|[0-9〇一二三四五六七八九十]+)年\s*)?(\d{1,2})[月/]\s*(\d{1,2})日?", raw)
    if not match or year is None:
        match = re.search(r"(20\d{2})[/-](\d{1,2})[/-](\d{1,2})", raw)
        if not match:
            return None
        year, month, day = map(int, match.groups())
    else:
        month, day = int(match.group(1)), int(match.group(2))
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _strip_html(raw: str) -> str:
    return re.sub(r"\s+", " ", html_lib.unescape(re.sub(r"<[^>]*>", " ", raw))).strip()


def _schedule_dates_in_text(raw: str, default_year: int) -> list[date]:
    dates: list[date] = []
    for match in re.finditer(
        r"令和\s*(?:元|[0-9〇一二三四五六七八九十]+)年\s*\d{1,2}/\d{1,2}|20\d{2}[/-]\d{1,2}[/-]\d{1,2}|20\d{2}年\d{1,2}月\d{1,2}日|\d{1,2}月\d{1,2}日",
        raw,
    ):
        parsed = _parse_date_text(match.group(0), default_year)
        if parsed is not None:
            dates.append(parsed)
    return dates


def _schedule_date_fields(raw: str, default_year: int) -> list[date]:
    fields: list[date] = []
    cells = re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", raw, flags=re.I | re.S)
    for cell in cells:
        dates = _schedule_dates_in_text(_strip_html(cell), default_year)
        if dates:
            fields.append(dates[0])
    return fields


def parse_official_schedule(html: str, month_key: str) -> OfficialSchedule:
    """Parse one basho row from the official annual schedule HTML."""
    if not re.fullmatch(r"20\d{4}", month_key):
        raise ValueError(f"invalid month key: {month_key}")
    year, month = int(month_key[:4]), int(month_key[4:])
    name = MONTH_NAMES.get(month, f"{month}月場所")
    rows = re.findall(r"<tr\b[^>]*>(.*?)</tr>", html, flags=re.I | re.S)
    candidates = [row for row in rows if name in _strip_html(row)]
    if not candidates:
        plain = _strip_html(html)
        candidates = [plain[index : index + 500] for index in [m.start() for m in re.finditer(re.escape(name), plain)]]
    for candidate in candidates:
        dates = _schedule_date_fields(candidate, year)
        if len(dates) < 4:
            continue
        announcement_date, banzuke_date, start_date, end_date = dates[:4]
        if (
            start_date.year == year
            and start_date.month == month
            and end_date.year == year
            and end_date.month == month
            and announcement_date <= banzuke_date <= start_date
            and (end_date - start_date).days == 14
        ):
            days = tuple(start_date + timedelta(days=offset) for offset in range(15))
            return OfficialSchedule(month_key, announcement_date, banzuke_date, start_date, end_date, days)
    raise ValueError(f"official schedule row not found for {month_key} ({name})")


def _count_banzuke_rows(payload: dict[str, Any], division: str) -> int:
    explicit = payload.get(f"{division}_count")
    if isinstance(explicit, int) or (isinstance(explicit, str) and explicit.isdigit()):
        return int(explicit)
    rows = payload.get("BanzukeTable", payload.get("banzukeTable", []))
    if not isinstance(rows, list):
        return 0
    division_id = "1" if division == "makuuchi" else "2"
    count = 0
    for row in rows:
        if not isinstance(row, dict):
            continue
        row_division = str(row.get("kakuzuke_id", row.get("division_id", row.get("division", ""))))
        if row_division == division_id or (division == "makuuchi" and "幕内" in row_division) or (division == "juryo" and "十両" in row_division):
            if row.get("rikishi_id") not in (None, "", 0, "0"):
                count += 1
    return count


def _banzuke_identity(container: object, division: str) -> dict[str, Any]:
    if not isinstance(container, dict):
        raise ValueError(f"official banzuke missing {division} payload")
    if container.get("Result") != "1":
        raise ValueError(f"official banzuke {division} response is not published")
    info = container.get("BashoInfo")
    if not isinstance(info, dict):
        raise ValueError(f"official banzuke {division} response has no BashoInfo")
    required = ("basho_id", "basho_name", "year_jp", "start_date", "end_date")
    missing = [field for field in required if info.get(field) in (None, "")]
    if missing:
        raise ValueError(f"official banzuke {division} identity missing {','.join(missing)}")
    try:
        start = date.fromisoformat(str(info["start_date"])[:10])
        end = date.fromisoformat(str(info["end_date"])[:10])
    except (TypeError, ValueError) as exc:
        raise ValueError(f"official banzuke {division} identity has invalid dates") from exc
    return {
        "name": str(info["basho_name"]),
        "year": str(info["year_jp"]),
        "start": start,
        "end": end,
        "month_key": f"{start.year:04d}{start.month:02d}",
        "basho_id": str(info["basho_id"]),
    }


def _banzuke_identities(payload: dict[str, Any]) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        raise ValueError("official banzuke response is not an object")
    return [_banzuke_identity(payload.get(division), division) for division in ("makuuchi", "juryo")]


def parse_official_banzuke(
    payload: dict[str, Any],
    month_key: str,
    *,
    schedule: OfficialSchedule | None = None,
) -> OfficialBanzuke:
    if not isinstance(payload, dict):
        raise ValueError("official banzuke response is not published")
    payload_month = str(payload.get("month_key", ""))
    if payload_month and payload_month != month_key:
        raise ValueError(f"official banzuke month mismatch: {payload_month}")
    expected_name = MONTH_NAMES.get(int(month_key[4:]), f"{int(month_key[4:])}月場所")
    identities = _banzuke_identities(payload)
    for identity in identities:
        if identity["name"] != expected_name:
            raise ValueError(f"official banzuke basho mismatch: {identity['name']}")
        if identity["month_key"] != month_key:
            raise ValueError(f"official banzuke date mismatch: {identity['month_key']}")
        if schedule is not None and (identity["start"] != schedule.start_date or identity["end"] != schedule.end_date):
            raise ValueError("official banzuke identity does not match annual schedule")
        if schedule is not None and _year_from_text(identity["year"]) != schedule.start_date.year:
            raise ValueError("official banzuke year does not match annual schedule")
    if len(identities) != 2 or len({(item["name"], item["year"], item["start"], item["end"], item["basho_id"]) for item in identities}) != 1:
        raise ValueError("official banzuke divisions disagree on BashoInfo identity")
    makuuchi_count = _count_banzuke_rows(payload.get("makuuchi", payload), "makuuchi")
    juryo_count = _count_banzuke_rows(payload.get("juryo", payload), "juryo")
    if makuuchi_count == 0 or juryo_count == 0:
        raise ValueError("official banzuke response has no division rows")
    return OfficialBanzuke(month_key, identities[0]["year"], makuuchi_count, juryo_count)


def _gate(name: str, expected: object, actual: object, source: str, ok: bool | None = None) -> Gate:
    expected_text, actual_text = str(expected), str(actual)
    return Gate(name, expected_text, actual_text, source, expected_text == actual_text if ok is None else ok)


def evaluate_official_readiness(schedule: OfficialSchedule, banzuke: OfficialBanzuke, target_month: str) -> list[Gate]:
    return [
        _gate("official target month", target_month, schedule.month_key, ANNUAL_SCHEDULE_URL),
        _gate("official schedule days", "15 consecutive days", f"{len(schedule.days)} days {schedule.start_date}..{schedule.end_date}", ANNUAL_SCHEDULE_URL, len(schedule.days) == 15 and all(schedule.days[i] + timedelta(days=1) == schedule.days[i + 1] for i in range(len(schedule.days) - 1))),
        _gate("official banzuke month", target_month, banzuke.month_key, BANZUKE_PAGE_URL),
        _gate("official banzuke makuuchi count", "42", banzuke.makuuchi_count, BANZUKE_PAGE_URL),
        _gate("official banzuke juryo count", "28", banzuke.juryo_count, BANZUKE_PAGE_URL),
    ]


def _date_from_entry(entry: dict[str, Any]) -> date | None:
    path_date = str(entry.get("pathDate", ""))
    try:
        return datetime.strptime(path_date, "%Y%m%d").date()
    except ValueError:
        return None


def _days_contract(entries: object, current_month: str) -> tuple[bool, str]:
    if not isinstance(entries, list):
        return False, "missing day array"
    day_numbers = [entry.get("day") for entry in entries if isinstance(entry, dict)]
    if len(entries) != 15 or sorted(day_numbers) != list(range(1, 16)):
        return False, f"count={len(entries)} days={day_numbers}"
    parsed_dates: list[date] = []
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or not str(entry.get("pathDate", "")).startswith(current_month):
            return False, f"invalid pathDate={entry.get('pathDate') if isinstance(entry, dict) else entry}"
        parsed = _date_from_entry(entry)
        if parsed is None or entry.get("isoDate") != parsed.isoformat() or parsed.month != int(current_month[4:]):
            return False, f"date mismatch={entry.get('pathDate')} / {entry.get('isoDate')}"
        if entry.get("day") != index + 1:
            return False, f"day order mismatch={entry.get('day')} at index={index}"
        parsed_dates.append(parsed)
    if len(set(parsed_dates)) != 15:
        return False, f"duplicate pathDate values={len(set(parsed_dates))}/15"
    if any(parsed_dates[index] + timedelta(days=1) != parsed_dates[index + 1] for index in range(14)):
        return False, f"pathDate sequence={','.join(item.isoformat() for item in parsed_dates)}"
    return True, "15 unique consecutive days with matching ISO dates"


def evaluate_local_contracts(banzuke: dict[str, Any], torikumi: dict[str, Any], current_month: str) -> list[Gate]:
    expected_name = MONTH_NAMES.get(int(current_month[4:]), f"{int(current_month[4:])}月場所")
    makuuchi_count = sum(len(group.get(side, [])) for group in banzuke.get("makuuchi", []) if isinstance(group, dict) for side in ("east", "west"))
    juryo_count = sum(len(group.get(side, [])) for group in banzuke.get("juryo", []) if isinstance(group, dict) for side in ("east", "west"))
    result_ok, result_actual = _days_contract(torikumi.get("resultDays"), current_month)
    schedule_ok, schedule_actual = _days_contract(torikumi.get("scheduleDays"), current_month)
    return [
        _gate("local banzuke month", expected_name, banzuke.get("bashoName", ""), "public/api/v1/banzuke.json"),
        _gate("local banzuke counts", "makuuchi=42 juryo=28", f"makuuchi={makuuchi_count} juryo={juryo_count}", "public/api/v1/banzuke.json", makuuchi_count == 42 and juryo_count == 28),
        _gate("local torikumi month", expected_name, torikumi.get("bashoName", ""), "public/api/v1/torikumi.json"),
        _gate("local banzuke/torikumi identity", "same basho and year", f"banzuke={banzuke.get('bashoName', '')}/{banzuke.get('year', '')} torikumi={torikumi.get('bashoName', '')}/{torikumi.get('year', '')}", "public/api/v1", banzuke.get("bashoName") == torikumi.get("bashoName") and banzuke.get("year") == torikumi.get("year")),
        _gate("local result day contract", "15 days, 1..15, matching ISO dates", result_actual, "public/api/v1/torikumi.json", result_ok),
        _gate("local schedule day contract", "15 days, 1..15, matching ISO dates", schedule_actual, "public/api/v1/torikumi.json", schedule_ok),
    ]


def _target_paths(schedule: OfficialSchedule) -> list[str]:
    target_month = schedule.month_key
    dates = [day.strftime("%Y%m%d") for day in schedule.days]
    return [
        f"/{target_month}-banzuke/",
        f"/{target_month}-torikumi/",
        f"/{target_month}-yotei/",
        *[f"/{day}-{mode}/" for day in dates for mode in ("torikumi", "yotei")],
    ]


def _read_text(root: Path, relative: str) -> str:
    path = root / relative
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def _discover_route_paths(root: Path, *, include_redirects: bool = True) -> list[str]:
    paths: list[str] = []
    relatives = ("app/lib/archives-data.ts", "app/lib/archive-basho-data.ts", "app/lib/torikumi-routes.ts")
    if include_redirects:
        relatives += ("public/_redirects",)
    for relative in relatives:
        text = _read_text(root, relative)
        for value in re.findall(r"['\"](/?20\d{4}(?:\d{2})?-(?:banzuke|torikumi|yotei)/?)['\"]", text):
            paths.append(value.rstrip("/") or "/")
        for value in re.findall(r"^\s*(/20\d{4}(?:\d{2})?-(?:banzuke|torikumi|yotei)/?)\s+", text, flags=re.M):
            paths.append(value.rstrip("/") or "/")
    return paths


def _discover_authoritative_sitemap_paths(root: Path) -> list[str]:
    sitemap_source = _read_text(root, "app/lib/sitemap.ts")
    archive_source = _read_text(root, "app/lib/archives-data.ts")
    route_source = _read_text(root, "app/lib/torikumi-routes.ts")
    if not sitemap_source or "getSitemapEntries" not in sitemap_source or "status === 'published'" not in sitemap_source:
        raise ValueError("tracked sitemap model is missing or unparseable")
    if not archive_source or not route_source:
        raise ValueError("tracked archive route model is missing or unparseable")
    paths: list[str] = []
    paths.extend(_discover_route_paths(root, include_redirects=False))
    imported_files = re.findall(r"from\s+['\"](\./[^'\"]+)['\"]", archive_source)
    for imported in imported_files:
        imported_path = root / "app/lib" / (imported[2:] if imported.startswith("./") else imported)
        if imported_path.suffix == "":
            imported_path = imported_path.with_suffix(".ts")
        source = imported_path.read_text(encoding="utf-8") if imported_path.is_file() else ""
        if not source:
            raise ValueError(f"tracked archive data source is missing: {imported_path.name}")
        for match in re.finditer(r"[\"']?pathDate[\"']?\s*:\s*[\"'](20\d{6})[\"']", source):
            nearby = source[max(0, match.start() - 240):match.end() + 240]
            if re.search(r"[\"']?status[\"']?\s*:\s*[\"']published[\"']", nearby):
                paths.extend(f"/{match.group(1)}-{mode}/" for mode in ("torikumi", "yotei"))
    if not paths:
        raise ValueError("tracked sitemap model has no paths")
    return list(dict.fromkeys(path.rstrip("/") or "/" for path in paths))


def _archive_records(archive_text: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for match in re.finditer(r"\{[^{}]*\bid\s*:\s*['\"](\d{6})['\"][^{}]*\}", archive_text, flags=re.S):
        record = match.group(0)
        paths = re.findall(r"(?:resultPath|schedulePath|banzukePath):\s*['\"]([^'\"]+)", record)
        records.append({"id": match.group(1), "paths": paths})
    return records


def evaluate_source_contracts(root: Path, current_month: str, target_month: str, schedule: OfficialSchedule) -> list[Gate]:
    archive_text = _read_text(root, "app/lib/archives-data.ts")
    archive_records = _archive_records(archive_text)
    archive_ids = [record["id"] for record in archive_records]
    archive_paths = [path for record in archive_records for path in record["paths"]]
    expected_archive_paths = {
        f"/{current_month}-torikumi",
        f"/{current_month}-yotei",
        f"/{current_month}-banzuke",
    }
    archive_ok = (
        bool(archive_ids)
        and archive_ids.count(current_month) == 1
        and len(archive_ids) == len(set(archive_ids))
        and len(archive_paths) == len(set(archive_paths))
        and len((current_records := [record for record in archive_records if record["id"] == current_month])) == 1
        and set(current_records[0]["paths"]) == expected_archive_paths
        and len(current_records[0]["paths"]) == len(expected_archive_paths)
    )
    source = "app/lib/archives-data.ts"
    gates = [_gate("outgoing archive uniqueness", "unique archive ids and paths", f"ids={len(archive_ids)} paths={len(archive_paths)}", source, archive_ok)]
    target_paths = _target_paths(schedule)
    target_normalized = {path.rstrip("/") or "/" for path in target_paths}
    route_paths = _discover_route_paths(root)
    try:
        sitemap_paths = _discover_authoritative_sitemap_paths(root)
        sitemap_source_ok = True
    except (OSError, ValueError) as exc:
        sitemap_paths = []
        sitemap_source_ok = False
        sitemap_source_error = repr(exc)
    route_collisions = sorted(target_normalized & set(route_paths))
    sitemap_collisions = sorted(target_normalized & set(sitemap_paths))
    sitemap_duplicates = sorted({path for path in sitemap_paths if sitemap_paths.count(path) > 1})
    route_actual = f"collision={','.join(route_collisions) or 'none'}"
    sitemap_actual = (
        f"collision={','.join(sitemap_collisions) or 'none'} duplicate={','.join(sitemap_duplicates) or 'none'}"
        if sitemap_source_ok else f"source unavailable={sitemap_source_error}"
    )
    gates.append(_gate("simulated target route uniqueness", "no collision with current route config", route_actual, "route model + virtual target", not route_collisions))
    gates.append(_gate("simulated target sitemap uniqueness", "no collision or duplicate in current sitemap", sitemap_actual, "tracked sitemap model + virtual target", sitemap_source_ok and not sitemap_collisions and not sitemap_duplicates))
    target_token = re.compile(rf"(?:{re.escape(target_month)}(?:\d{{2}})?|/{re.escape(target_month)}-)")
    references: list[str] = []
    for relative in SOURCE_FILES:
        text = _read_text(root, relative)
        if target_token.search(text):
            references.append(relative)
    gates.append(_gate("target absent from current route/sitemap/redirect sources", "no target references", ",".join(references) or "none", "route/sitemap/redirect source scan", not references))
    workflow_ok = True
    workflow_actual: list[str] = []
    for relative in WORKFLOW_FILES:
        text = _read_text(root, relative)
        has_dispatch = bool(re.search(r"^\s*workflow_dispatch\s*:", text, flags=re.M))
        has_schedule = bool(re.search(r"^\s*schedule\s*:", text, flags=re.M)) or bool(re.search(r"\bcron\s*:", text))
        if not has_dispatch or has_schedule:
            workflow_ok = False
            workflow_actual.append(f"{relative}:dispatch={has_dispatch},schedule={has_schedule}")
    gates.append(_gate("data workflows manual-only", "workflow_dispatch and no schedule", ",".join(workflow_actual) or "both workflows manual-only", ".github/workflows", workflow_ok))
    return gates


def evaluate_preflight_files(root: Path, current_month: str, target_month: str, schedule: OfficialSchedule | None) -> list[Gate]:
    gates: list[Gate] = []
    try:
        banzuke = json.loads((root / "public/api/v1/banzuke.json").read_text(encoding="utf-8"))
        torikumi = json.loads((root / "public/api/v1/torikumi.json").read_text(encoding="utf-8"))
        gates.extend(evaluate_local_contracts(banzuke, torikumi, current_month))
    except Exception as exc:
        gates.append(_gate("local data readable", "banzuke.json and torikumi.json", repr(exc), "public/api/v1", False))
    if schedule is None:
        gates.append(_gate("source contract model", "official schedule required", "official schedule unavailable", "official sources", False))
    else:
        gates.extend(evaluate_source_contracts(root, current_month, target_month, schedule))
    return gates


def _fetch_text(url: str, *, timeout: int = 30) -> str:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ja,en-US;q=0.9"})
    with urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8")


def fetch_official_banzuke(
    target_month: str,
    *,
    schedule: OfficialSchedule | None = None,
    fetch_text: Callable[[str], str] = _fetch_text,
) -> dict[str, Any]:
    page = fetch_text(BANZUKE_PAGE_URL)
    basho_id_match = re.search(r'id=["\']bashoId["\']\s+value=["\'](\d+)', page) or re.search(r'value=["\'](\d+)["\']\s+id=["\']bashoId', page)
    if not basho_id_match:
        raise ValueError("official banzuke page has no bashoId")
    if schedule is None:
        schedule = parse_official_schedule(fetch_text(ANNUAL_SCHEDULE_URL), target_month)
    result: dict[str, Any] = {"month_key": target_month, "makuuchi": {}, "juryo": {}}
    for division, key in ((1, "makuuchi"), (2, "juryo")):
        payload = urlencode({"kakuzuke_id": str(division), "basho_id": basho_id_match.group(1), "page": "1"}).encode("utf-8")
        request = Request(
            f"{OFFICIAL_BASE}{BANZUKE_AJAX_PATH.format(division=division)}",
            data=payload,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Origin": OFFICIAL_BASE,
                "Referer": BANZUKE_PAGE_URL,
                "Cookie": "and=mouse",
                "X-Requested-With": "XMLHttpRequest",
            },
            method="POST",
        )
        with urlopen(request, timeout=30) as response:
            result[key] = json.loads(response.read().decode("utf-8"))
    parse_official_banzuke(result, target_month, schedule=schedule)
    return result


def run_preflight(
    *,
    root: Path = Path("."),
    current_month: str = "202607",
    target_month: str = "202609",
    schedule_html: str | None = None,
    banzuke_payload: dict[str, Any] | None = None,
    fetch_text: Callable[[str], str] = _fetch_text,
) -> PreflightResult:
    gates: list[Gate] = []
    try:
        schedule_html = schedule_html if schedule_html is not None else fetch_text(ANNUAL_SCHEDULE_URL)
        schedule = parse_official_schedule(schedule_html, target_month)
        gates.append(_gate("official schedule fetched and parsed", "published target row", f"{schedule.start_date}..{schedule.end_date}", ANNUAL_SCHEDULE_URL, True))
    except Exception as exc:
        schedule = None
        gates.append(_gate("official schedule fetched and parsed", "published target row", repr(exc), ANNUAL_SCHEDULE_URL, False))
    try:
        banzuke_payload = banzuke_payload if banzuke_payload is not None else fetch_official_banzuke(target_month, schedule=schedule)
        banzuke = parse_official_banzuke(banzuke_payload, target_month, schedule=schedule)
        gates.append(_gate("official banzuke fetched and parsed", "published target divisions", f"makuuchi={banzuke.makuuchi_count} juryo={banzuke.juryo_count}", BANZUKE_PAGE_URL, True))
    except Exception as exc:
        banzuke = None
        gates.append(_gate("official banzuke fetched and parsed", "published target divisions", repr(exc), BANZUKE_PAGE_URL, False))
    if schedule is not None and banzuke is not None:
        gates.extend(evaluate_official_readiness(schedule, banzuke, target_month))
    else:
        gates.append(_gate("official readiness", "schedule and banzuke both published", "official source unavailable", "official sources", False))
    gates.extend(evaluate_preflight_files(root, current_month, target_month, schedule))
    return PreflightResult(tuple(gates), "READY" if all(gate.ok for gate in gates) else "BLOCKED")


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check whether the current basho can be switched safely (read-only).")
    parser.add_argument("--current-month", default="202607", help="Current local basho month (YYYYMM).")
    parser.add_argument("--target-month", default="202609", help="Official target basho month (YYYYMM).")
    parser.add_argument("--repo-root", type=Path, default=Path("."), help="Repository root to inspect.")
    args = parser.parse_args(list(argv) if argv is not None else None)
    try:
        result = run_preflight(root=args.repo_root, current_month=args.current_month, target_month=args.target_month)
    except Exception as exc:
        result = PreflightResult((_gate("preflight execution", "no unhandled error", repr(exc), "preflight", False),), "BLOCKED")
    for gate in result.gates:
        print(gate.line())
    print(result.status)
    return result.exit_code


if __name__ == "__main__":
    sys.exit(main())
