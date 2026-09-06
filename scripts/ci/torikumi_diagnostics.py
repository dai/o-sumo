"""Allowlisted diagnostic extraction from generator stderr.

The Daily / Realtime workflows surface failures through Job Summary and Discord.
Both must share one extractor that only forwards allowlisted fields (day,
division, error category, run URL) and never raw stderr, tracebacks, or secrets.
Bounded output keeps the Discord embed description under the 4096-char limit.
"""

from __future__ import annotations

import re
from typing import Final


_DAY_RE: Final = re.compile(r"\bday=(\d+)\b")
_DIVISION_RE: Final = re.compile(r"division=(幕内|十両|makuuchi|juryo)")
_DIVISION_LABELS: Final = {"幕内": "makuuchi", "十両": "juryo", "makuuchi": "makuuchi", "juryo": "juryo"}
_DIVISION_DISPLAY: Final = {"makuuchi": "幕内", "juryo": "十両"}

_CATEGORY_RULES: Final[tuple[tuple[re.Pattern[str], str], ...]] = (
    (re.compile(r"malformed official response", re.IGNORECASE), "validation"),
    (re.compile(r"strict torikumi fetch check failed", re.IGNORECASE), "validation"),
    (re.compile(r"incomplete official schedule fetch", re.IGNORECASE), "validation"),
    (re.compile(r"torikumi fetch failed", re.IGNORECASE), "network"),
    (re.compile(r"banzuke fetch failed", re.IGNORECASE), "network"),
    (re.compile(r"official basho schedule fetch failed", re.IGNORECASE), "network"),
    (re.compile(r"取組データ解析失敗", re.IGNORECASE), "parse"),
)

_DISCORD_DESCRIPTION_LIMIT: Final = 4096
_SAFE_DESCRIPTION_LEN: Final = 3800


def extract_diagnostics(stderr_text: str, run_url: str) -> dict:
    """Pull allowlisted fields out of generator stderr.

    Returns a mapping with sorted day/division/category lists, the run URL, and
    an ``unknown`` flag indicating whether anything specific could be parsed.
    The original stderr is never echoed back.
    """
    days: set[int] = set()
    divisions: set[str] = set()
    categories: set[str] = set()

    for line in (stderr_text or "").splitlines():
        for match in _DAY_RE.finditer(line):
            try:
                value = int(match.group(1))
            except ValueError:
                continue
            if 1 <= value <= 15:
                days.add(value)
        for match in _DIVISION_RE.finditer(line):
            canonical = _DIVISION_LABELS.get(match.group(1))
            if canonical:
                divisions.add(canonical)
        for pattern, category in _CATEGORY_RULES:
            if pattern.search(line):
                categories.add(category)

    return {
        "days": sorted(days),
        "divisions": sorted(divisions),
        "categories": sorted(categories),
        "run_url": run_url,
        "unknown": not (days or divisions or categories),
    }


def _label_for_division(division: str) -> str:
    return _DIVISION_DISPLAY.get(division, division)


def format_diagnostics_markdown(diagnostics: dict) -> str:
    """Render diagnostics as a Markdown block for the Job Summary."""
    lines = ["### Failure diagnostics"]
    if diagnostics.get("unknown"):
        lines.append("- category: unknown")
    else:
        days = diagnostics.get("days") or []
        divisions = diagnostics.get("divisions") or []
        categories = diagnostics.get("categories") or []
        if days:
            lines.append("- days: " + ", ".join(str(d) for d in days))
        if divisions:
            lines.append("- divisions: " + ", ".join(_label_for_division(d) for d in divisions))
        if categories:
            lines.append("- category: " + ", ".join(categories))
    run_url = diagnostics.get("run_url") or ""
    if run_url:
        lines.append(f"- run: {run_url}")
    return "\n".join(lines)


def format_diagnostics_discord(diagnostics: dict) -> str:
    """Render diagnostics as bounded plain text for a Discord embed description."""
    text = format_diagnostics_markdown(diagnostics)
    if len(text) > _SAFE_DESCRIPTION_LEN:
        text = text[: _SAFE_DESCRIPTION_LEN - 3] + "..."
    if len(text) > _DISCORD_DESCRIPTION_LIMIT:
        text = text[: _DISCORD_DESCRIPTION_LIMIT - 3] + "..."
    return text
