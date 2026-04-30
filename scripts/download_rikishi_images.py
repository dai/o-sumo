#!/usr/bin/env python3
"""
Download rikishi profile images and generate stylized illustrations.

This script:
1. Reads the rikishi list from rikishi.json
2. Downloads profile images from sumo.or.jp
3. Generates stylized illustrations (SVG-based or simplified versions)
4. Saves them to public/images/rikishi/{id}.jpg
"""

import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

BASE_URL = "https://www.sumo.or.jp"
RIKISHI_JSON = Path("public/api/v1/rikishi.json")
IMAGES_DIR = Path("public/images/rikishi")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def load_rikishi_list():
    """Load the rikishi list from JSON"""
    with open(RIKISHI_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["rikishi"]


def fetch_profile_page(rikishi_id: int) -> str | None:
    """Fetch HTML from rikishi profile page"""
    url = f"{BASE_URL}/ResultRikishiData/profile/{rikishi_id}/"
    req = Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as res:
                return res.read().decode("utf-8")
        except Exception as exc:
            if attempt == 2:
                print(f"[ERROR] Failed to fetch profile {rikishi_id}: {exc}", file=sys.stderr)
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


def extract_image_url(html: str, rikishi_id: int) -> str | None:
    """Extract the profile image URL from HTML"""
    if not html:
        return None

    # Try to find og:image first
    og_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if og_match:
        img_url = og_match.group(1)
        # Skip generic facebook logo
        if "fb_logo.gif" not in img_url and "logo" not in img_url.lower():
            return img_url if img_url.startswith("http") else urljoin(BASE_URL, img_url)

    # Try to find img tags with profile/rikishi in src
    img_patterns = [
        r'<img[^>]*src=["\']([^"\']*(?:profile|rikishi|photo)[^"\']*)["\']',
        r'<img[^>]*src=["\']([^"\']*\.(?:jpg|jpeg|png))["\']',
    ]

    for pattern in img_patterns:
        matches = re.finditer(pattern, html, re.IGNORECASE)
        for match in matches:
            img_url = match.group(1)
            # Skip small icons and logos
            if any(x in img_url.lower() for x in ["icon", "logo", "banner", "fb_logo"]):
                continue
            if img_url:
                return img_url if img_url.startswith("http") else urljoin(BASE_URL, img_url)

    return None


def download_image(url: str, output_path: Path) -> bool:
    """Download an image from URL to local file"""
    if not url:
        return False

    req = Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as res:
                content_type = res.headers.get("Content-Type", "")
                # Only accept image content types
                if not content_type.startswith("image/"):
                    print(f"[WARN] URL is not an image: {url} (type: {content_type})", file=sys.stderr)
                    return False

                data = res.read()
                # Check minimum file size (avoid downloading tiny placeholder images)
                if len(data) < 1024:  # Less than 1KB is probably not a real photo
                    print(f"[WARN] Image too small: {url} ({len(data)} bytes)", file=sys.stderr)
                    return False

                output_path.write_bytes(data)
                print(f"[OK] Downloaded: {output_path.name} ({len(data)} bytes)")
                return True
        except Exception as exc:
            if attempt == 2:
                print(f"[ERROR] Failed to download {url}: {exc}", file=sys.stderr)
                return False
            time.sleep(1.5 * (attempt + 1))

    return False


def generate_fallback_svg(rikishi_id: int, name: str, rank: str) -> bool:
    """Generate a simple SVG as fallback when no photo is available"""
    # Determine if we should generate a detailed avatar or simple placeholder
    is_makuuchi = not rank.startswith('十両')

    # Use first character of name for placeholder
    char = name[0] if name else "力"

    # Simple placeholder SVG matching the app's style
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg-{rikishi_id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f2ea" />
      <stop offset="100%" stop-color="#ece3d6" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-{rikishi_id})" />
  <circle cx="200" cy="160" r="80" fill="#c9b49c" opacity="0.6"/>
  <ellipse cx="200" cy="320" rx="100" ry="60" fill="#b9956f" opacity="0.5"/>
  <text x="200" y="380" text-anchor="middle" font-size="32" fill="#6f5338" font-family="sans-serif" font-weight="bold">{char}</text>
</svg>'''

    svg_path = IMAGES_DIR / f"{rikishi_id}.svg"
    svg_path.write_text(svg_content, encoding="utf-8")
    print(f"[OK] Generated SVG placeholder: {svg_path.name}")
    return True


def process_rikishi(rikishi: dict) -> bool:
    """Process a single rikishi: download image or generate fallback"""
    rikishi_id = rikishi["id"]
    name = rikishi["name"]
    rank = rikishi.get("currentRank", "")

    # Check if image already exists
    jpg_path = IMAGES_DIR / f"{rikishi_id}.jpg"
    png_path = IMAGES_DIR / f"{rikishi_id}.png"
    svg_path = IMAGES_DIR / f"{rikishi_id}.svg"

    if jpg_path.exists() or png_path.exists() or svg_path.exists():
        print(f"[SKIP] {name} ({rikishi_id}): Image already exists")
        return True

    print(f"[INFO] Processing {name} ({rikishi_id}, {rank})...")

    # Fetch profile page HTML
    html = fetch_profile_page(rikishi_id)
    if not html:
        print(f"[WARN] {name}: Failed to fetch profile page, generating SVG fallback")
        return generate_fallback_svg(rikishi_id, name, rank)

    # Extract image URL from HTML
    img_url = extract_image_url(html, rikishi_id)
    if not img_url:
        print(f"[WARN] {name}: No image URL found, generating SVG fallback")
        return generate_fallback_svg(rikishi_id, name, rank)

    # Determine output format based on URL
    ext = ".jpg"
    if img_url.lower().endswith(".png"):
        ext = ".png"
    output_path = IMAGES_DIR / f"{rikishi_id}{ext}"

    # Download the image
    success = download_image(img_url, output_path)
    if not success:
        print(f"[WARN] {name}: Download failed, generating SVG fallback")
        return generate_fallback_svg(rikishi_id, name, rank)

    return True


def main():
    """Main execution"""
    print(f"Loading rikishi list from {RIKISHI_JSON}...")
    rikishi_list = load_rikishi_list()
    print(f"Found {len(rikishi_list)} rikishi")

    success_count = 0
    fail_count = 0

    for i, rikishi in enumerate(rikishi_list, 1):
        print(f"\n[{i}/{len(rikishi_list)}] ", end="")
        if process_rikishi(rikishi):
            success_count += 1
        else:
            fail_count += 1

        # Be polite: add delay between requests
        if i < len(rikishi_list):
            time.sleep(0.5)

    print(f"\n\n{'='*60}")
    print(f"SUMMARY:")
    print(f"  Total:   {len(rikishi_list)}")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print(f"{'='*60}")

    # Count files in directory
    jpg_count = len(list(IMAGES_DIR.glob("*.jpg")))
    png_count = len(list(IMAGES_DIR.glob("*.png")))
    svg_count = len(list(IMAGES_DIR.glob("*.svg")))
    print(f"\nImages in {IMAGES_DIR}:")
    print(f"  JPG files: {jpg_count}")
    print(f"  PNG files: {png_count}")
    print(f"  SVG files: {svg_count}")
    print(f"  Total:     {jpg_count + png_count + svg_count}")


if __name__ == "__main__":
    main()
