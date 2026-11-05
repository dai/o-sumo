"""Build and inspect the portable o-sumo plugin preparation ZIP."""
import json
from pathlib import Path
import re
import sys
import zipfile

root = Path(__file__).resolve().parent / "o-sumo"
output = Path(sys.argv[1]).resolve()
if root == output or root in output.parents:
    raise SystemExit("Write the ZIP outside the package directory.")
manifest = json.loads((root / "plugin.json").read_text())
interface = manifest["extensions"]["com.openai"]["interface"]
assert manifest["$schema"] == "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
assert manifest["name"] == root.name
assert re.fullmatch(r"\d+\.\d+\.\d+", manifest["version"])
assert len(interface["displayName"]) <= 30
assert len(interface["shortDescription"]) <= 30
assert len(interface["longDescription"]) <= 4000
assert interface["category"] == "Entertainment"
assert 1 <= len(interface["defaultPrompt"]) <= 3
assert len(set(interface["defaultPrompt"])) == len(interface["defaultPrompt"])
assert all(0 < len(p) <= 128 and "\n" not in p for p in interface["defaultPrompt"])
assert not manifest.get("apps")
assert not manifest["extensions"]["com.openai"].get("apps")
mcp = json.loads((root / "mcp.json").read_text())
assert mcp["$schema"] == "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json"
assert mcp["mcpServers"]["o-sumo"]["url"] == "https://osada.us/mcp"
assert mcp["mcpServers"]["o-sumo"]["type"] == "streamable-http"
cases = manifest["extensions"]["com.openai"]["review"]["test_cases"]
assert len(cases["positive"]) == 5 and len(cases["negative"]) == 3
for case in cases["positive"]:
    assert all(isinstance(case[k], str) and case[k] for k in ["description", "prompt", "tools_triggered", "expected_behavior"])
for case in cases["negative"]:
    assert all(isinstance(case[k], str) and case[k] for k in ["description", "prompt"])
inventory = sorted(p for p in root.rglob("*") if p.is_file())
assert all(not p.is_symlink() for p in root.rglob("*"))
assert {p.relative_to(root).as_posix() for p in inventory} == {"plugin.json", "mcp.json", "assets/logo-512.png"}
for key in ["logo", "composerIcon"]:
    asset = (root / interface[key]).resolve()
    assert root in asset.parents and asset.is_file()
    png = asset.read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n"
    assert int.from_bytes(png[16:20], "big") >= 256
    assert png[16:20] == png[20:24] and len(png) <= 5 * 1024 * 1024
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in inventory:
        archive.write(path, Path(root.name) / path.relative_to(root))
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == 3
    assert json.loads(archive.read("o-sumo/plugin.json")) == manifest
    assert json.loads(archive.read("o-sumo/mcp.json")) == mcp
    print("\n".join(archive.namelist()))
print(f"Built preparation draft: {output}")
print("Public submission incomplete: verified publisher, privacy/terms URLs, live tests, demo and portal checks remain.")
