"""Validate the public torikumi JSON payload produced by `update_sumo_data.py`.

Mirrors the inline validation previously duplicated across multiple GitHub
Actions workflows. Returns exit code 0 on success, 1 on validation failure.

Usage:
    python scripts/ci/validate_torikumi.py [path/to/torikumi.json]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REQUIRED_KEYS = (
    "updatedAt",
    "resultUpdatedAt",
    "scheduleUpdatedAt",
    "resultDays",
    "scheduleDays",
)
EXPECTED_DAY_COUNT = 15
DEFAULT_PATH = "public/api/v1/torikumi.json"


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

    missing = [key for key in REQUIRED_KEYS if key not in data]
    if missing:
        print(f"missing keys in torikumi.json: {missing}", file=sys.stderr)
        return 1

    if not (data["updatedAt"] and data["resultUpdatedAt"] and data["scheduleUpdatedAt"]):
        print("torikumi timestamps must be non-empty", file=sys.stderr)
        return 1

    if len(data["resultDays"]) != EXPECTED_DAY_COUNT or len(data["scheduleDays"]) != EXPECTED_DAY_COUNT:
        print(
            f"torikumi archive day count must be {EXPECTED_DAY_COUNT} for "
            f"resultDays and scheduleDays",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
