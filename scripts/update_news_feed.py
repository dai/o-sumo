#!/usr/bin/env python3
"""
Fetch Japan Sumo Association announcements and write a static news feed.

The official site does not expose an RSS feed, so we scrape the public
"協会からのお知らせ" page (`/IrohaKyokaiInformation/wrap/`) and normalize the
top entries into `public/api/v1/news.json` for the home page.

The pipeline is intentionally:
- stdlib only (urllib + html + json + re + datetime + pathlib)
- tolerant: a transient failure leaves the existing JSON untouched
- extensible: a `SOURCE_DEFINITIONS` list lets future contributors add feeds
  (RSS or HTML scrapers) without touching the orchestration code.

Usage:
    python scripts/update_news_feed.py [--out PATH] [--limit N]
"""

from __future__ import annotations

import argparse
import html as html_lib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# Public URLs used by the Japan Sumo Association. The apex host is preferred for
# requests because the www host sometimes fails to resolve from CI runners.
REQUEST_BASE_URL = "https://sumo.or.jp"
SITE_BASE_URL = "https://www.sumo.or.jp"

DEFAULT_OUTPUT = Path("public/api/v1/news.json")
DEFAULT_LIMIT = 3
REQUEST_TIMEOUT = 30
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

# 令和X年Y月Z日 → ISO date. Reiwa 1 = 2019.
REIWA_DATE_RE = re.compile(r"令和\s*(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日")
KANJI_DIGIT = {"〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}


def kanji_to_int(value: str) -> int | None:
    """Convert small kanji numerals like '一' / '八' / '十' up to a few dozen.

    The association only writes days and months in single-digit kanji for
    this page, but we keep '十' / '百' for safety.
    """
    if not value:
        return None
    digits = "".join(str(KANJI_DIGIT[ch]) if ch in KANJI_DIGIT else ch for ch in value)
    if all(ch.isdigit() for ch in digits):
        return int(digits)
    total = 0
    current = 0
    for ch in digits:
        if ch == "十":
            total += (current or 1) * 10
            current = 0
        elif ch == "百":
            total += (current or 1) * 100
            current = 0
        elif ch.isdigit():
            current = current * 10 + int(ch)
    return total + current


def parse_reiwa_date(text: str) -> str | None:
    """Return an ISO date (YYYY-MM-DD) for a 令和 date string, or None."""
    if not text:
        return None
    match = REIWA_DATE_RE.search(text)
    if not match:
        return None
    reiwa_year = kanji_to_int(match.group(1))
    month = kanji_to_int(match.group(2))
    day = kanji_to_int(match.group(3))
    if reiwa_year is None or month is None or day is None:
        return None
    try:
        return datetime(2018 + reiwa_year, month, day).date().isoformat()
    except ValueError:
        return None


def fetch_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.8"})
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urlopen(req, timeout=REQUEST_TIMEOUT) as res:
                charset = res.headers.get_content_charset() or "utf-8"
                return res.read().decode(charset)
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            if attempt == 2:
                break
    assert last_error is not None
    raise last_error


NEWS_ITEM_RE = re.compile(
    r'<dt[^>]*>(?P<date>[^<]+)</dt>\s*'
    r'<a[^>]+href="/IrohaKyokaiInformation/detail\?id=(?P<id>\d+)"[^>]*>(?P<title>[^<]+)</a>',
    re.DOTALL,
)


def scrape_sumo_association(limit: int) -> list[dict]:
    """Return normalized news items from the 協会 announcements page."""
    url = f"{REQUEST_BASE_URL}/IrohaKyokaiInformation/wrap/"
    html = fetch_text(url)
    items: list[dict] = []
    for match in NEWS_ITEM_RE.finditer(html):
        raw_date = match.group("date").strip()
        published_at = parse_reiwa_date(raw_date)
        title = html_lib.unescape(match.group("title").strip())
        item_id = match.group("id").strip()
        if not title:
            continue
        items.append({
            "id": f"sumo-association-{item_id}",
            "title": title,
            "url": f"{SITE_BASE_URL}/IrohaKyokaiInformation/detail?id={item_id}",
            "publishedAt": published_at,
            "publishedAtRaw": raw_date,
            "sourceId": "sumo-association",
        })
        if len(items) >= limit:
            break
    return items


# Each entry describes a single source. Adding a new feed is a one-liner here.
SOURCE_DEFINITIONS = [
    {
        "id": "sumo-association",
        "label": "日本相撲協会",
        "limit": DEFAULT_LIMIT,
        "scraper": scrape_sumo_association,
    },
]


def build_payload(limit: int) -> dict:
    items: list[dict] = []
    sources: list[dict] = []
    for source in SOURCE_DEFINITIONS:
        try:
            scraped = source["scraper"](min(limit, source["limit"]))
        except Exception as exc:
            print(f"[warn] {source['id']} failed: {exc}", file=sys.stderr)
            sources.append({"id": source["id"], "label": source["label"], "ok": False})
            continue
        sources.append({"id": source["id"], "label": source["label"], "ok": True, "count": len(scraped)})
        for item in scraped:
            items.append({**item, "sourceLabel": source["label"]})
        # The home page only needs a small window; stop once we have enough.
        if len(items) >= limit:
            items = items[:limit]
            break
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "items": items,
    }


def write_payload(payload: dict, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Update the static news feed.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT, help="Output JSON path.")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="Maximum items to fetch.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    payload = build_payload(args.limit)
    write_payload(payload, args.out)
    print(f"[ok] wrote {len(payload['items'])} items to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())