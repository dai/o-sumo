#!/usr/bin/env python3
"""Check that every displayed character is covered by scripts/fonts/coverage.txt.

Mirrors the traversal and filtering rules of app/lib/webfont-charset.ts and
app/webfont.test.ts using only the Python standard library so it can run in
minimal CI data-update environments as well as locally.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
DISPLAYED_TEXT_ROOTS = ("app", "src", "public", "index.html")
SKIP_DIRECTORIES = {
    "node_modules",
    "dist",
    "dist-blog",
    ".git",
    "images",
    ".cache",
}
SKIP_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".zip",
    ".wasm",
    ".pdf",
    ".map",
}


def is_required_webfont_character(character: str) -> bool:
    code_point = ord(character)
    if code_point < 0x20 or code_point == 0x7F:
        return False
    if 0xFE00 <= code_point <= 0xFE0F:
        return False
    if code_point == 0x200D:
        return False
    if code_point >= 0x1F000:
        return False
    return True


def _walk(path: Path, characters: set[str]) -> None:
    if not path.exists():
        return
    if path.is_dir():
        for entry in sorted(path.iterdir(), key=lambda item: item.name):
            if entry.name in SKIP_DIRECTORIES:
                continue
            _walk(entry, characters)
        return

    if path.suffix.lower() in SKIP_EXTENSIONS:
        return

    raw = path.read_bytes()
    if b"\x00" in raw[:1024]:
        return

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return

    characters.update(text)


def collect_displayed_characters(repo_root: Path) -> str:
    characters: set[str] = set()
    for root_name in DISPLAYED_TEXT_ROOTS:
        _walk(repo_root / root_name, characters)
    return "".join(sorted(characters, key=ord))


def read_codepoints(path: Path) -> set[str]:
    return {
        line.strip().upper()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    }


def find_missing_codepoints(repo_root: Path) -> list[tuple[str, str]]:
    fonts_dir = repo_root / "scripts" / "fonts"
    coverage = read_codepoints(fonts_dir / "coverage.txt")
    unsupported = read_codepoints(fonts_dir / "unsupported.txt")

    missing: list[tuple[str, str]] = []
    for character in collect_displayed_characters(repo_root):
        if not is_required_webfont_character(character):
            continue
        code = f"{ord(character):04X}"
        if code not in coverage and code not in unsupported:
            missing.append((f"U+{code}", character))
    return missing


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check webfont subset coverage.")
    parser.add_argument("--root", type=Path, default=ROOT, help="Repository root path")
    args = parser.parse_args(argv)

    missing = find_missing_codepoints(args.root.resolve())
    if missing:
        sample = ", ".join(f"{code} ({ch})" for code, ch in missing[:20])
        suffix = f" ... and {len(missing) - 20} more" if len(missing) > 20 else ""
        print(
            f"ERROR: {len(missing)} character(s) missing from scripts/fonts/coverage.txt: "
            f"{sample}{suffix}. Regenerate with: npm run fonts:subset",
            file=sys.stderr,
        )
        return 1

    print("webfont coverage OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
