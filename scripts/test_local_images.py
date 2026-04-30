#!/usr/bin/env python3
"""
Test script to verify local image URL generation works correctly.
"""

import json
from pathlib import Path


def get_local_image_url(rikishi_id: int) -> str:
    """Check for local image and return the appropriate URL"""
    local_images_dir = Path("public/images/rikishi")

    # Check for different image formats in order of preference
    for ext in [".jpg", ".png", ".svg"]:
        image_path = local_images_dir / f"{rikishi_id}{ext}"
        if image_path.exists():
            return f"/images/rikishi/{rikishi_id}{ext}"

    return ""


def test_local_images():
    """Test that local images are being found"""
    rikishi_json = Path("public/api/v1/rikishi.json")
    with open(rikishi_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    rikishi_list = data["rikishi"]

    print(f"Testing local image detection for {len(rikishi_list)} rikishi...")
    print(f"{'='*60}\n")

    found_count = 0
    missing_count = 0

    for rikishi in rikishi_list[:10]:  # Test first 10
        rikishi_id = rikishi["id"]
        name = rikishi["name"]

        local_url = get_local_image_url(rikishi_id)
        if local_url:
            found_count += 1
            print(f"✓ {name} ({rikishi_id}): {local_url}")
        else:
            missing_count += 1
            print(f"✗ {name} ({rikishi_id}): No local image")

    print(f"\n{'='*60}")
    print(f"Found: {found_count}, Missing: {missing_count}")


if __name__ == "__main__":
    test_local_images()
