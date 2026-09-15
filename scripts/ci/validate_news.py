"""`public/api/v1/news.json` の構造検証."""
from __future__ import annotations

from datetime import datetime, timezone
import json
import os
import sys
from pathlib import Path

REQUIRED_KEYS = ("updatedAt", "sources", "items")
DEFAULT_MAX_AGE_HOURS = 24
DEFAULT_MAX_FAILURE_STREAK = 3


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw == "":
        return default
    try:
        return int(raw)
    except ValueError:
        print(
            f"::warning::{name}={raw!r} is not an integer; falling back to {default}",
            file=sys.stderr,
        )
        return default


def _parse_iso_timestamp(value):
    if not isinstance(value, str) or not value:
        return None
    candidate = value
    if candidate.endswith("Z"):
        candidate = candidate[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def main(path: str = "public/api/v1/news.json") -> int:
    payload_path = Path(path)
    if not payload_path.exists():
        print(f"news.json not found at {payload_path}", file=sys.stderr)
        return 1

    try:
        data = json.loads(payload_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"news.json is not valid JSON: {exc}", file=sys.stderr)
        return 1

    if not isinstance(data, dict):
        print("news.json root must be an object", file=sys.stderr)
        return 1

    missing = [key for key in REQUIRED_KEYS if key not in data]
    if missing:
        print(f"missing keys in news.json: {missing}", file=sys.stderr)
        return 1

    if not data["updatedAt"]:
        print("news timestamp updatedAt must be non-empty", file=sys.stderr)
        return 1

    sources = data.get("sources", [])
    if not sources:
        print("news sources must not be empty", file=sys.stderr)
        return 1

    if not any(source.get("ok", False) for source in sources):
        print("all news sources are marked as failed", file=sys.stderr)
        return 1

    parsed_updated_at = _parse_iso_timestamp(data["updatedAt"])
    if parsed_updated_at is None:
        print(
            f"news.updatedAt is not a valid ISO 8601 timestamp: {data['updatedAt']!r}",
            file=sys.stderr,
        )
        return 1

    max_age_hours = _env_int("NEWS_MAX_AGE_HOURS", DEFAULT_MAX_AGE_HOURS)
    age = datetime.now(timezone.utc) - parsed_updated_at
    if age.total_seconds() / 3600 >= max_age_hours:
        print(
            f"news.updatedAt is older than {max_age_hours} hours "
            f"({data['updatedAt']!r}); every source failed and stale data is being kept",
            file=sys.stderr,
        )
        return 1

    streak = data.get("lastFailureStreak", 0)
    if not isinstance(streak, int) or streak < 0:
        print(
            f"news.lastFailureStreak must be a non-negative integer when present: {streak!r}",
            file=sys.stderr,
        )
        return 1

    max_streak = _env_int("NEWS_MAX_FAILURE_STREAK", DEFAULT_MAX_FAILURE_STREAK)
    if streak >= max_streak:
        print(
            f"news.lastFailureStreak={streak} has reached threshold {max_streak}; "
            "the news feed has been kept-stale for too long",
            file=sys.stderr,
        )
        return 1

    if streak > 0:
        print(
            f"::warning::news.lastFailureStreak={streak} (threshold {max_streak}); "
            "feed is being kept stale because every upstream source is failing",
            file=sys.stderr,
        )

    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
