"""`public/api/v1/news.json` の構造検証."""
import json
import sys
from pathlib import Path

REQUIRED_KEYS = ("updatedAt", "sources", "items")


def main(path: str = "public/api/v1/news.json") -> int:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
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

    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
