#!/usr/bin/env python3
"""
Update existing rikishi JSON files to use local images.
This script updates the photoUrl in all rikishi/*.json files to point to local images.
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


def update_rikishi_json_files():
    """Update all rikishi JSON files to use local images"""
    profile_dir = Path("public/api/v1/rikishi")

    if not profile_dir.exists():
        print(f"Error: Directory {profile_dir} does not exist")
        return

    json_files = list(profile_dir.glob("*.json"))
    print(f"Found {len(json_files)} rikishi JSON files")
    print(f"{'='*60}\n")

    updated_count = 0
    skipped_count = 0
    no_local_count = 0

    for json_file in sorted(json_files):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            rikishi_id = data.get("id")
            name = data.get("name", "Unknown")
            current_photo_url = data.get("photoUrl", "")

            # Check if local image exists
            local_url = get_local_image_url(rikishi_id)

            if not local_url:
                no_local_count += 1
                print(f"✗ {name} ({rikishi_id}): No local image available")
                continue

            # Update if different
            if current_photo_url == local_url:
                skipped_count += 1
                print(f"- {name} ({rikishi_id}): Already using local image")
            else:
                data["photoUrl"] = local_url
                with open(json_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.write("\n")  # Add trailing newline
                updated_count += 1
                old_url_info = current_photo_url if current_photo_url else "(empty)"
                print(f"✓ {name} ({rikishi_id}): Updated")
                print(f"  Old: {old_url_info}")
                print(f"  New: {local_url}")

        except Exception as e:
            print(f"✗ Error processing {json_file.name}: {e}")

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Updated: {updated_count}")
    print(f"  Already using local: {skipped_count}")
    print(f"  No local image: {no_local_count}")
    print(f"  Total: {len(json_files)}")


if __name__ == "__main__":
    update_rikishi_json_files()
