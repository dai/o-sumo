#!/usr/bin/env python3
"""
Style transfer for rikishi profile images using MiniMax AI.

This script:
1. Reads downloaded JPG photos
2. Uses MiniMax image generation API to create stylized portraits
3. Saves as PNG files

API Key: Set MINIMAX_API_KEY environment variable
"""

import base64
import json
import os
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen

IMAGES_DIR = Path("public/images/rikishi")

API_KEY = os.environ.get("MINIMAX_API_KEY")
if not API_KEY:
    print("[ERROR] MINIMAX_API_KEY environment variable not set", file=sys.stderr)
    sys.exit(1)


def create_stylized_portrait(image_path: Path, rikishi_id: int, name: str) -> bytes | None:
    """
    Use MiniMax AI to create a stylized portrait from a photo.
    Returns PNG bytes or None on failure.
    """
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    req_data = {
        "model": "image-01",
        "prompt": "Transform this sumo wrestler into a cute anime sticker portrait. Simple flat illustration style, clean lines, pastel colors, white background. PNG.",
        "subject_reference": [{
            "type": "character",
            "image_file": f"data:image/jpeg;base64,{img_b64}"
        }],
        "width": 512,
        "height": 512,
        "aspect_ratio": "1:1",
        "response_format": "base64"
    }

    req_json = json.dumps(req_data).encode("utf-8")

    req = Request(
        "https://api.minimax.io/v1/image_generation",
        data=req_json,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
            if "data" in data and "image_base64" in data["data"]:
                return base64.b64decode(data["data"]["image_base64"][0])
            else:
                print(f"[WARN] No image in response for {name}", file=sys.stderr)
                return None
    except Exception as exc:
        print(f"[ERROR] API call failed for {name}: {exc}", file=sys.stderr)
        return None


def main():
    print(f"Stylizing rikishi portrait images using MiniMax AI...")
    print(f"=" * 60)

    # Get all JPG files
    jpg_files = sorted(IMAGES_DIR.glob("*.jpg"))
    print(f"Found {len(jpg_files)} JPG files to process")
    print()

    success_count = 0
    fail_count = 0
    skipped_count = 0

    for i, jpg_path in enumerate(jpg_files, 1):
        rikishi_id = jpg_path.stem
        png_path = IMAGES_DIR / f"{rikishi_id}.png"

        # Skip if PNG already exists
        if png_path.exists():
            skipped_count += 1
            print(f"[{i}/{len(jpg_files)}] [SKIP] {rikishi_id}: PNG already exists")
            continue

        # Load rikishi name from JSON
        json_path = Path(f"public/api/v1/rikishi/{rikishi_id}.json")
        name = rikishi_id
        if json_path.exists():
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                name = data.get("name", rikishi_id)

        print(f"[{i}/{len(jpg_files)}] Processing {name} ({rikishi_id})...")

        png_data = create_stylized_portrait(jpg_path, int(rikishi_id), name)

        if png_data:
            png_path.write_bytes(png_data)
            size_kb = len(png_data) / 1024
            print(f"  [OK] Saved {png_path.name} ({size_kb:.1f} KB)")
            success_count += 1
        else:
            print(f"  [FAIL] Could not create stylized image")
            fail_count += 1

        # Small delay to avoid rate limiting
        if i < len(jpg_files):
            time.sleep(0.3)

    print()
    print(f"=" * 60)
    print(f"SUMMARY:")
    print(f"  Total:   {len(jpg_files)}")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"=" * 60)

    # Count final files
    png_count = len(list(IMAGES_DIR.glob("*.png")))
    jpg_count = len(list(IMAGES_DIR.glob("*.jpg")))
    print(f"\nImages in {IMAGES_DIR}:")
    print(f"  JPG files: {jpg_count}")
    print(f"  PNG files: {png_count}")
    print(f"  Total:     {jpg_count + png_count}")


if __name__ == "__main__":
    main()
