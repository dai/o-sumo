"""Validate the public torikumi JSON payload produced by `update_sumo_data.py`.

Mirrors the inline validation previously duplicated across multiple GitHub
Actions workflows. Returns exit code 0 on success, 1 on validation failure.

Usage:
    python scripts/ci/validate_torikumi.py [path/to/torikumi.json]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REQUIRED_KEYS = (
    "bashoId",
    "updatedAt",
    "resultUpdatedAt",
    "scheduleUpdatedAt",
    "resultDays",
    "scheduleDays",
)
EXPECTED_DAY_COUNT = 15
DEFAULT_PATH = "public/api/v1/torikumi.json"
PROFILE_ID_RE = re.compile(r"/profile/(\d+)/")


def profile_id(match: dict, side: str) -> int:
    value = match.get(f"{side}Id")
    if value is None:
        found = PROFILE_ID_RE.search(str(match.get(f"{side}ProfileUrl", "")))
        value = int(found.group(1)) if found else 0
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{side} participant id must be a positive integer")
    return value


def validate_published_schedules(data: dict) -> None:
    schedule_days = data["scheduleDays"]
    if not isinstance(schedule_days, list):
        raise ValueError("scheduleDays must be an array")
    for archive_day in schedule_days:
        if not isinstance(archive_day, dict):
            raise ValueError("schedule day must be an object")
        if archive_day.get("status") != "published":
            continue
        day = archive_day.get("day", "unknown")
        day_data = archive_day.get("data")
        if not isinstance(day_data, dict):
            raise ValueError(f"published schedule day={day} data must be an object")
        participants: set[int] = set()
        bouts: set[tuple[int, int]] = set()
        permitted_absentee_overlap: set[int] = set()
        absentee_ids: set[int] = set()
        for division in ("makuuchi", "juryo"):
            division_data = day_data.get(division)
            if not isinstance(division_data, dict):
                raise ValueError(f"day={day} division={division} must be an object")
            matches = division_data.get("matches")
            if not isinstance(matches, list) or not matches:
                raise ValueError(f"day={day} division={division} must have matches")
            absentees = division_data.get("absentees", [])
            if not isinstance(absentees, list):
                raise ValueError(f"day={day} division={division} absentees must be an array")
            for bout in matches:
                if not isinstance(bout, dict):
                    raise ValueError(f"day={day} division={division} match must be an object")
                east, west = profile_id(bout, "east"), profile_id(bout, "west")
                if east == west:
                    raise ValueError(f"day={day} bout has identical participants")
                pair = tuple(sorted((east, west)))
                if pair in bouts:
                    raise ValueError(f"day={day} duplicate bout {pair}")
                # FinalMuch playoff bouts are flattened into the day-15 match
                # list without retaining source metadata. Repeated wrestlers
                # are therefore legitimate on senshuraku, while a repeated
                # identical pairing remains invalid on every day.
                if day != 15 and (east in participants or west in participants):
                    raise ValueError(f"day={day} duplicate participant")
                bouts.add(pair)
                participants.update((east, west))
                if str(bout.get("kimarite", "")).strip() == "不戦":
                    if bout.get("winner") == "east":
                        permitted_absentee_overlap.add(west)
                    elif bout.get("winner") == "west":
                        permitted_absentee_overlap.add(east)
            for absentee in absentees:
                if not isinstance(absentee, dict):
                    raise ValueError(f"day={day} absentee must be an object")
                absentee_id = absentee.get("id")
                if isinstance(absentee_id, bool) or not isinstance(absentee_id, int) or absentee_id <= 0:
                    raise ValueError(f"day={day} absentee id must be a positive integer")
                if absentee_id in absentee_ids:
                    raise ValueError(f"day={day} duplicate absentee")
                absentee_ids.add(absentee_id)
        illegal_overlap = (participants & absentee_ids) - permitted_absentee_overlap
        if illegal_overlap:
            raise ValueError(f"day={day} participant/absentee overlap: {sorted(illegal_overlap)}")


def main(path: str = DEFAULT_PATH) -> int:
    payload_path = Path(path)
    if not payload_path.exists():
        print(f"torikumi.json not found at {payload_path}", file=sys.stderr)
        return 1

    try:
        data = json.loads(payload_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"torikumi.json is not valid JSON: {exc}", file=sys.stderr)
        return 1

    if not isinstance(data, dict):
        print("torikumi.json root must be an object", file=sys.stderr)
        return 1

    missing = [key for key in REQUIRED_KEYS if key not in data]
    if missing:
        print(f"missing keys in torikumi.json: {missing}", file=sys.stderr)
        return 1

    if not (data["updatedAt"] and data["resultUpdatedAt"] and data["scheduleUpdatedAt"]):
        print("torikumi timestamps must be non-empty", file=sys.stderr)
        return 1

    if not isinstance(data["bashoId"], int) or data["bashoId"] <= 0:
        print("torikumi bashoId must be a positive integer", file=sys.stderr)
        return 1

    if not isinstance(data["resultDays"], list) or not isinstance(data["scheduleDays"], list):
        print("torikumi day collections must be arrays", file=sys.stderr)
        return 1

    if len(data["resultDays"]) != EXPECTED_DAY_COUNT or len(data["scheduleDays"]) != EXPECTED_DAY_COUNT:
        print(
            f"torikumi archive day count must be {EXPECTED_DAY_COUNT} for "
            f"resultDays and scheduleDays",
            file=sys.stderr,
        )
        return 1

    try:
        validate_published_schedules(data)
    except (KeyError, TypeError, ValueError) as exc:
        print(f"invalid published schedule: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
