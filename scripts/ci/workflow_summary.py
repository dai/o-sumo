#!/usr/bin/env python3
"""Render generated torikumi facts for GitHub step summaries."""
import json
import pathlib
import sys


def _matches(day, division):
    return day.get("data", {}).get(division, {}).get("matches", [])


def render(scope, payload):
    if not isinstance(payload, dict):
        raise ValueError("torikumi payload must be an object")
    lines = [
        f"- updatedAt: `{payload.get('updatedAt', '')}`",
        f"- resultUpdatedAt: `{payload.get('resultUpdatedAt', '')}`",
        f"- scheduleUpdatedAt: `{payload.get('scheduleUpdatedAt', '')}`",
    ]
    key = "scheduleDays" if scope == "schedule" else "resultDays"
    for day in payload.get(key, []):
        if day.get("status") != "published":
            continue
        makuuchi = _matches(day, "makuuchi")
        juryo = _matches(day, "juryo")
        prefix = f"- day {day.get('day')} / {day.get('pathDate', '')}"
        if scope == "schedule":
            lines.append(f"{prefix} / makuuchi {len(makuuchi)} / juryo {len(juryo)}")
        else:
            settled_m = sum(bool(match.get("winner")) for match in makuuchi)
            settled_j = sum(bool(match.get("winner")) for match in juryo)
            lines.append(f"{prefix} / makuuchi settled {settled_m}/{len(makuuchi)} / juryo settled {settled_j}/{len(juryo)}")
    return "\n".join(lines)


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    try:
        scope, filename = argv
        if scope not in {"schedule", "result"}:
            raise ValueError("scope must be schedule or result")
        payload = json.loads(pathlib.Path(filename).read_text(encoding="utf-8"))
        print(render(scope, payload))
        return 0
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"summary unavailable: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
