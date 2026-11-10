#!/usr/bin/env python3
"""Subset Shippori Mincho and Source Serif 4 for self-hosting.

The site paints Japanese with Shippori Mincho and Latin with Source Serif 4.
Google's stylesheet for those families is a render-blocking ~570KB @import.
This script keeps only the weights the UI uses (400, 500, 600, 700, 800) and
only the glyphs that appear in displayed text, then writes woff2 files to
public/fonts/.

Upstream families are the OFL releases from github.com/google/fonts. They are
cached under scripts/fonts/.cache/ and are not committed.

Requires fontTools with Brotli support and the repo's tsx binary:

    pip install 'fonttools[woff]' brotli
    python3 scripts/fonts/build_webfonts.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(__file__).resolve().parent / '.cache'
PUBLIC_FONTS = ROOT / 'public' / 'fonts'
TSX = ROOT / 'node_modules' / '.bin' / 'tsx'
PRINT_CHARSET = Path(__file__).resolve().parent / 'print-charset.ts'

SHIPPORI_WEIGHTS = {
    400: 'ShipporiMincho-Regular.ttf',
    500: 'ShipporiMincho-Medium.ttf',
    600: 'ShipporiMincho-SemiBold.ttf',
    700: 'ShipporiMincho-Bold.ttf',
    800: 'ShipporiMincho-ExtraBold.ttf',
}

SOURCE_SERIF_FILE = 'SourceSerif4[opsz,wght].ttf'

RAW_BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl'

# Kana and Japanese punctuation are cheap insurance for copy added later.
ALWAYS_RANGES = (
    range(0x20, 0x7F),
    range(0x3000, 0x3040),
    range(0x3040, 0x30A0),
    range(0x30A0, 0x3100),
    range(0xFF01, 0xFF61),
)


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and destination.stat().st_size > 0:
        return
    print(f'download {url}')
    urllib.request.urlretrieve(url, destination)


def cmap_of(path: Path) -> set[int]:
    font = TTFont(path)
    cmap = font.getBestCmap() or {}
    return set(cmap)


def write_text(path: Path, characters: set[int]) -> None:
    path.write_text(''.join(chr(code) for code in sorted(characters)), encoding='utf-8')


def pyftsubset_bin() -> str:
    found = shutil.which('pyftsubset')
    if found:
        return found
    local = Path.home() / '.local' / 'bin' / 'pyftsubset'
    if local.exists():
        return str(local)
    raise SystemExit('pyftsubset is not installed (pip install "fonttools[woff]" brotli)')


def subset(source: Path, destination: Path, characters: set[int], layout_features: str) -> None:
    text_file = destination.with_suffix('.txt')
    write_text(text_file, characters)
    destination.parent.mkdir(parents=True, exist_ok=True)
    command = [
        pyftsubset_bin(),
        str(source),
        f'--text-file={text_file}',
        f'--output-file={destination}',
        '--flavor=woff2',
        f'--layout-features={layout_features}',
        '--glyph-names',
        '--symbol-cmap',
        '--legacy-cmap',
        '--notdef-glyph',
        '--notdef-outline',
        '--recommended-glyphs',
        '--name-IDs=*',
        '--drop-tables+=DSIG',
    ]
    print(f'subset {source.name} -> {destination.name} ({len(characters)} chars)')
    subprocess.run(command, check=True)
    text_file.unlink(missing_ok=True)


def collect_displayed_codes() -> set[int]:
    if not TSX.exists():
        raise SystemExit(f'missing {TSX}; run npm ci first')
    output = subprocess.check_output([str(TSX), str(PRINT_CHARSET)], cwd=ROOT)
    return {ord(character) for character in output.decode('utf-8')}


def always_codes(available: set[int]) -> set[int]:
    extra: set[int] = set()
    for block in ALWAYS_RANGES:
        extra.update(code for code in block if code in available)
    return extra


def write_codepoint_list(path: Path, codes: set[int]) -> None:
    path.write_text(''.join(f'{code:04X}\n' for code in sorted(codes)), encoding='utf-8')


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    for filename in SHIPPORI_WEIGHTS.values():
        download(f'{RAW_BASE}/shipporimincho/{filename}', CACHE / filename)
    download(
        f'{RAW_BASE}/sourceserif4/SourceSerif4%5Bopsz%2Cwght%5D.ttf',
        CACHE / SOURCE_SERIF_FILE,
    )
    download(f'{RAW_BASE}/shipporimincho/OFL.txt', CACHE / 'OFL-ShipporiMincho.txt')
    download(f'{RAW_BASE}/sourceserif4/OFL.txt', CACHE / 'OFL-SourceSerif4.txt')

    displayed = {code for code in collect_displayed_codes() if code >= 0x20 and code != 0x7F}
    shippori_cmaps = [cmap_of(CACHE / filename) for filename in SHIPPORI_WEIGHTS.values()]
    shippori_available = set.intersection(*shippori_cmaps)
    source_available = cmap_of(CACHE / SOURCE_SERIF_FILE)

    shippori_chars = (displayed & shippori_available) | always_codes(shippori_available)
    source_chars = (displayed & source_available) | always_codes(source_available)

    PUBLIC_FONTS.mkdir(parents=True, exist_ok=True)
    for weight, filename in SHIPPORI_WEIGHTS.items():
        subset(
            CACHE / filename,
            PUBLIC_FONTS / f'shippori-mincho-{weight}.woff2',
            shippori_chars,
            'palt,kern',
        )
    subset(
        CACHE / SOURCE_SERIF_FILE,
        PUBLIC_FONTS / 'source-serif-4.woff2',
        source_chars,
        'kern,liga,calt,tnum,lnum,onum,pnum',
    )

    source_font = TTFont(PUBLIC_FONTS / 'source-serif-4.woff2')
    if 'fvar' not in source_font:
        raise SystemExit('Source Serif subset lost its variation axes')
    axes = {axis.axisTag for axis in source_font['fvar'].axes}
    if axes != {'wght', 'opsz'}:
        raise SystemExit(f'unexpected Source Serif axes: {sorted(axes)}')

    covered: set[int] = set()
    for path in sorted(PUBLIC_FONTS.glob('*.woff2')):
        covered |= cmap_of(path)

    missing = sorted(displayed & (shippori_available | source_available) - covered)
    if missing:
        sample = ', '.join(f'U+{code:04X}' for code in missing[:12])
        raise SystemExit(f'subset dropped {len(missing)} glyphs: {sample}')

    unsupported = displayed - shippori_available - source_available
    notes = Path(__file__).resolve().parent
    write_codepoint_list(notes / 'coverage.txt', covered)
    write_codepoint_list(notes / 'unsupported.txt', unsupported)

    for license_name in ('OFL-ShipporiMincho.txt', 'OFL-SourceSerif4.txt'):
        target = PUBLIC_FONTS / license_name
        target.write_bytes((CACHE / license_name).read_bytes())

    for path in sorted(PUBLIC_FONTS.glob('*.woff2')):
        print(f'{path.name}\t{path.stat().st_size}')
    print(f'covered {len(covered)} unsupported {len(unsupported)}')


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
