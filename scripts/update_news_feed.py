#!/usr/bin/env python3
"""
Fetch sumo news and write a static feed consumed by the home page.

The pipeline combines two sources:

1. The Japan Sumo Association's "協会からのお知らせ" page, scraped from
   ``/IrohaKyokaiInformation/wrap/``. The official site has no RSS feed,
   so we read the HTML directly.
2. dmenu スポーツ's 相撲ニュース一覧
   (``https://sumo.sports.smt.docomo.ne.jp/news/``). 50+ articles from
   multiple outlets (報知 / 日刊スポーツ / 中日スポーツ / デイリー /
   時事通信 / スポニチ / SANSPO / テレ朝 / 読売) are aggregated.

The pipeline is intentionally:

- stdlib only (urllib + html + json + re + datetime + pathlib)
- tolerant: a transient failure leaves the failing source as
  ``sources[*].ok = false`` and the surviving source still contributes
- extensible: a ``SOURCE_DEFINITIONS`` list lets future contributors add
  feeds (RSS or HTML scrapers) without touching the orchestration code.

Usage:
    python scripts/update_news_feed.py [--out PATH] [--limit N] [--force-write]
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
DOCOMO_NEWS_URL = "https://sumo.sports.smt.docomo.ne.jp/news/"

DEFAULT_OUTPUT = Path("public/api/v1/news.json")
DEFAULT_LIMIT = 8
REQUEST_TIMEOUT = 30
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

# 令和X年Y月Z日 → ISO date. Reiwa 1 = 2019.
REIWA_DATE_RE = re.compile(r"令和\s*(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日")
KANJI_DIGIT = {"〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}

# dmenu スポーツ: <li class="photo"><a href="..."><figure>...</figure>
# <p>title</p><p class="time">媒体名　M月D日 H時M分</p></a></li>
DOCOMO_NEWS_ITEM_RE = re.compile(
    r'<li class="photo"><a href="(?P<url>[^"]+)"[^>]*>\s*'
    r'(?:<figure[^>]*>.*?</figure>\s*)?'
    r'<p>(?P<title>[^<]+)</p>\s*'
    r'<p class="time">(?P<time>[^<]+)</p>',
    re.DOTALL,
)
DOCOMO_DATE_RE = re.compile(r"(\d+)\s*月\s*(\d+)\s*日\s*(\d+)\s*時\s*(\d+)\s*分")
DOCOMO_ARTICLE_ID_RE = re.compile(r"/article/[^/]+/sports/([^?&#/]+)")


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


def parse_docomo_date(text: str, *, now: datetime | None = None) -> str | None:
    """Return an ISO date (YYYY-MM-DD) for a docomo M月D日 H時M分 string.

    The page omits the year. We assume the current year, and roll back one
    year when the parsed timestamp is in the future (e.g. cross-year posts
    observed shortly after midnight on January 1).
    """
    if not text:
        return None
    match = DOCOMO_DATE_RE.search(text)
    if not match:
        return None
    month = int(match.group(1))
    day = int(match.group(2))
    hour = int(match.group(3))
    minute = int(match.group(4))
    reference = now or datetime.now()
    try:
        candidate = datetime(reference.year, month, day, hour, minute)
    except ValueError:
        return None
    if candidate.date() > reference.date():
        try:
            candidate = datetime(reference.year - 1, month, day, hour, minute)
        except ValueError:
            return None
    return candidate.date().isoformat()


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


def scrape_docomo_news(limit: int) -> list[dict]:
    """Return normalized news items from the dmenu スポーツ 相撲ニュース page."""
    html = fetch_text(DOCOMO_NEWS_URL)
    items: list[dict] = []
    seen_ids: set[str] = set()
    for match in DOCOMO_NEWS_ITEM_RE.finditer(html):
        raw_url = html_lib.unescape(match.group("url").strip())
        title = html_lib.unescape(match.group("title").strip())
        raw_time = html_lib.unescape(match.group("time").strip())
        if not title or not raw_url:
            continue
        id_match = DOCOMO_ARTICLE_ID_RE.search(raw_url)
        if not id_match:
            continue
        article_id = id_match.group(1)
        if article_id in seen_ids:
            continue
        seen_ids.add(article_id)
        clean_url = raw_url.split("?", 1)[0]
        published_at = parse_docomo_date(raw_time)
        items.append({
            "id": f"dmenu-docomo-{article_id}",
            "title": title,
            "url": clean_url,
            "publishedAt": published_at,
            "publishedAtRaw": raw_time,
            "sourceId": "dmenu-docomo",
        })
        if len(items) >= limit:
            break
    return items


# Each entry describes a single source. Adding a new feed is a one-liner here.
SOURCE_DEFINITIONS = [
    {
        "id": "sumo-association",
        "label": "日本相撲協会",
        "limit": 3,
        "scraper": scrape_sumo_association,
    },
    {
        "id": "dmenu-docomo",
        "label": "dmenuスポーツ",
        "limit": 5,
        "scraper": scrape_docomo_news,
    },
]


def build_payload(limit: int) -> dict:
    """Collect items from every source, merge, sort by date, and trim.

    Each source contributes up to ``min(limit, source["limit"])`` items.
    After all sources are processed we sort the union by ``publishedAt``
    (descending, with ``None`` treated as oldest), dedupe by ``id``, and
    slice to the requested total ``limit``.
    """
    items: list[dict] = []
    sources: list[dict] = []
    for source in SOURCE_DEFINITIONS:
        per_source = min(limit, source["limit"])
        try:
            scraped = source["scraper"](per_source)
        except Exception as exc:
            print(f"[warn] {source['id']} failed: {exc}", file=sys.stderr)
            sources.append({"id": source["id"], "label": source["label"], "ok": False})
            continue
        sources.append({"id": source["id"], "label": source["label"], "ok": True, "count": len(scraped)})
        for item in scraped:
            items.append({**item, "sourceLabel": source["label"]})

    items.sort(key=lambda item: item.get("publishedAt") or "", reverse=True)

    deduped: list[dict] = []
    seen: set[str] = set()
    for item in items:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        deduped.append(item)
    items = deduped[:limit]

    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "items": items,
    }


def all_news_sources_failed(payload: dict) -> bool:
    sources = payload.get("sources", [])
    return bool(sources) and all(not source.get("ok", False) for source in sources)


def has_news_content_changed(payload: dict, existing: dict) -> bool:
    return {
        "sources": payload.get("sources", []),
        "items": payload.get("items", []),
    } != {
        "sources": existing.get("sources", []),
        "items": existing.get("items", []),
    }


def write_payload(payload: dict, output: Path, *, force_write: bool = False) -> bool:
    if output.exists() and not force_write:
        try:
            existing = json.loads(output.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = None
        if isinstance(existing, dict) and not has_news_content_changed(payload, existing):
            return False

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Update the static news feed.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT, help="Output JSON path.")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="Maximum items to fetch.")
    parser.add_argument(
        "--force-write",
        action="store_true",
        help="Rewrite output even when only updatedAt changed.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    payload = build_payload(args.limit)
    if all_news_sources_failed(payload):
        print("[error] all news sources failed; aborting update", file=sys.stderr)
        for source in payload.get("sources", []):
            print(f"  - {source.get('id')}: ok={source.get('ok', False)}", file=sys.stderr)
        return 1
    changed = write_payload(payload, args.out, force_write=args.force_write)
    if changed:
        print(f"[ok] wrote {len(payload['items'])} items to {args.out}")
    else:
        print(f"[ok] no news changes; kept {args.out}")
    for source in payload["sources"]:
        print(f"  - {source['id']}: ok={source['ok']} count={source.get('count', 0)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
