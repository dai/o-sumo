#!/usr/bin/env python3
"""Render generated torikumi facts for GitHub step summaries."""
import importlib.util
import json
import pathlib
import sys


_DIAGNOSTICS_SPEC = importlib.util.spec_from_file_location(
    "torikumi_diagnostics",
    pathlib.Path(__file__).with_name("torikumi_diagnostics.py"),
)
DIAGNOSTICS = importlib.util.module_from_spec(_DIAGNOSTICS_SPEC)
_DIAGNOSTICS_SPEC.loader.exec_module(DIAGNOSTICS)


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


def render_diagnostics(stderr_text, run_url):
    """Render allowlisted diagnostics from generator stderr."""
    extracted = DIAGNOSTICS.extract_diagnostics(stderr_text, run_url)
    return DIAGNOSTICS.format_diagnostics_markdown(extracted)


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    try:
        if len(argv) >= 3 and argv[0] == "diagnostics":
            _, _stderr_path, run_url = argv[:3]
            stderr_text = pathlib.Path(_stderr_path).read_text(encoding="utf-8", errors="replace")
            print(render_diagnostics(stderr_text, run_url))
            return 0
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
