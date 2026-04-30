#!/usr/bin/env python3
"""
Generate SVG illustrations for all rikishi without local images.
This creates simple SVG placeholders based on rikishi name and rank.
"""

import json
from pathlib import Path


def generate_rikishi_svg(rikishi_id: int, name: str, rank: str) -> str:
    """Generate a simple SVG illustration for a rikishi"""
    # Use first character of name for placeholder
    char = name[0] if name else "力"

    # Determine color scheme based on rank
    if "横綱" in rank:
        ring_color = "#d4af37"  # Gold for Yokozuna
        mawashi_color = "#8b1538"  # Dark red
    elif "大関" in rank:
        ring_color = "#c0c0c0"  # Silver for Ozeki
        mawashi_color = "#1a3a52"  # Navy blue
    elif "関脇" in rank or "小結" in rank:
        ring_color = "#cd7f32"  # Bronze for Sekiwake/Komusubi
        mawashi_color = "#12314a"  # Dark blue
    elif "十両" in rank:
        ring_color = "#4a90e2"  # Blue for Juryo
        mawashi_color = "#5c2a12"  # Brown
    else:
        ring_color = "#6f5338"  # Brown for Maegashira
        mawashi_color = "#1a3a52"  # Navy

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg-{rikishi_id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f2ea" />
      <stop offset="100%" stop-color="#ece3d6" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-{rikishi_id})" />
  <circle cx="200" cy="200" r="150" fill="none" stroke="{ring_color}" stroke-width="3" opacity="0.3"/>
  <circle cx="200" cy="160" r="80" fill="#c9b49c" opacity="0.6"/>
  <ellipse cx="200" cy="320" rx="100" ry="60" fill="{mawashi_color}" opacity="0.7"/>
  <text x="200" y="385" text-anchor="middle" font-size="28" fill="#6f5338" font-family="sans-serif" font-weight="bold">{char}</text>
</svg>'''

    return svg_content


def generate_all_missing_images():
    """Generate SVG images for all rikishi without local images"""
    # Load rikishi list
    rikishi_json = Path("public/api/v1/rikishi.json")
    with open(rikishi_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    rikishi_list = data["rikishi"]
    images_dir = Path("public/images/rikishi")
    images_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating SVG illustrations for rikishi without local images...")
    print(f"{'='*60}\n")

    generated_count = 0
    skipped_count = 0

    for rikishi in rikishi_list:
        rikishi_id = rikishi["id"]
        name = rikishi["name"]
        rank = rikishi.get("currentRank", "")

        # Check if image already exists
        jpg_path = images_dir / f"{rikishi_id}.jpg"
        png_path = images_dir / f"{rikishi_id}.png"
        svg_path = images_dir / f"{rikishi_id}.svg"

        if jpg_path.exists() or png_path.exists() or svg_path.exists():
            skipped_count += 1
            print(f"- {name} ({rikishi_id}): Already has image")
            continue

        # Generate SVG
        svg_content = generate_rikishi_svg(rikishi_id, name, rank)
        svg_path.write_text(svg_content, encoding="utf-8")
        generated_count += 1
        print(f"✓ {name} ({rikishi_id}, {rank}): Generated SVG")

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Generated: {generated_count}")
    print(f"  Skipped (already exist): {skipped_count}")
    print(f"  Total: {len(rikishi_list)}")

    # Count final totals
    jpg_count = len(list(images_dir.glob("*.jpg")))
    png_count = len(list(images_dir.glob("*.png")))
    svg_count = len(list(images_dir.glob("*.svg")))
    print(f"\nFinal image count in {images_dir}:")
    print(f"  JPG files: {jpg_count}")
    print(f"  PNG files: {png_count}")
    print(f"  SVG files: {svg_count}")
    print(f"  Total:     {jpg_count + png_count + svg_count}")


if __name__ == "__main__":
    generate_all_missing_images()
