#!/usr/bin/env python3
"""Read-only production delivery verification (stdlib + gh)."""

import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import time
import urllib.request

PRODUCTION_FILES = (
    "public/api/v1/torikumi.json",
    "public/api/v1/banzuke.json",
    "public/api/v1/news.json",
)
REQUEST_TIMEOUT_SECONDS = 15


def github_reader(endpoint, timeout_seconds):
    """Collect every page without exposing gh stderr or credentials."""
    result = subprocess.run(
        ["gh", "api", "--method", "GET", "--paginate", "--slurp", endpoint],
        capture_output=True, text=True, timeout=timeout_seconds, check=True,
    )
    pages = json.loads(result.stdout)
    key = "check_runs" if "/check-runs?" in endpoint else "workflow_runs"
    return [record for page in pages for record in page[key]]


def production_reader(url, timeout_seconds):
    request = urllib.request.Request(url, headers={
        "Accept": "application/json", "Cache-Control": "no-cache",
        "User-Agent": "o-sumo-delivery-check",
    })
    with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
        return json.loads(response.read().decode("utf-8"))


def expected_versions(root):
    """Map each published JSON file in the checkout to its updatedAt."""
    versions = {}
    for path in PRODUCTION_FILES:
        file = Path(root) / path
        if not file.is_file():
            continue
        value = json.loads(file.read_text(encoding="utf-8")).get("updatedAt")
        if isinstance(value, str) and value:
            versions[path] = value
    return versions


def production_status(base_url, expected, nonce, timeout_seconds, *, fetch=production_reader):
    """Production is fresh when every file serves the expected updatedAt or newer."""
    if not expected:
        return {"status": "unavailable", "reason": "no_expected_versions"}
    files = {}
    for path, want in expected.items():
        url = f"{base_url.rstrip('/')}/{path.removeprefix('public/')}?delivery={nonce}"
        try:
            served = fetch(url, min(timeout_seconds, REQUEST_TIMEOUT_SECONDS)).get("updatedAt")
            fresh = (isinstance(served, str)
                     and datetime.fromisoformat(served) >= datetime.fromisoformat(want))
        except (OSError, ValueError, TypeError, AttributeError):
            # Do not report exception text: it is not needed to act on the result.
            files[path] = {"status": "unavailable", "expected": want}
            continue
        files[path] = {"status": "fresh" if fresh else "stale", "expected": want, "served": served}
    statuses = {entry["status"] for entry in files.values()}
    status = ("unavailable" if "unavailable" in statuses
              else "stale" if "stale" in statuses else "success")
    return {"status": status, "files": files}


def latest_status(records, sha, name, *, workflow=False):
    matches = [record for record in records
               if record.get("head_sha") == sha and record.get("name") == name
               and (not workflow or record.get("event") == "push")]
    if not matches:
        return {"status": "missing"}
    # A queued rerun may have no started_at; created_at still orders it above
    # earlier successes. run_attempt disambiguates workflow reruns sharing an id.
    record = max(matches, key=lambda item: (
        item.get("created_at") or item.get("started_at") or "",
        item.get("id", 0), item.get("run_attempt", 0),
    ))
    completed = record.get("status") == "completed"
    conclusion = record.get("conclusion")
    status = "success" if completed and conclusion == "success" else (
        "failure" if completed else "pending")
    return {"status": status, "id": record.get("id"),
            "conclusion": conclusion, "state": record.get("status")}


def _validate_budget(timeout_seconds, interval_seconds):
    if not 0 < timeout_seconds <= 600 or interval_seconds <= 0:
        raise ValueError("timeout must be in (0, 600]; interval must be positive")


def monitor(repo, sha, timeout_seconds=600, interval_seconds=20, *, production,
            reader=github_reader, clock=time.monotonic, sleep=time.sleep):
    """Wait until the push CI passes and production serves the pushed data.

    A successful Cloudflare Pages check only proves that commit was built: an
    older build finishing later can still own the production alias.
    """
    _validate_budget(timeout_seconds, interval_seconds)
    deadline = clock() + timeout_seconds
    result = {"sha": sha, "pages": {"status": "missing"}, "ci": {"status": "missing"},
              "production": {"status": "missing"}, "overall": "pending"}
    endpoints = (
        ("pages", f"repos/{repo}/commits/{sha}/check-runs?filter=all&per_page=100",
         "Cloudflare Pages: o-sumo", False),
        ("ci", f"repos/{repo}/actions/runs?head_sha={sha}&event=push&per_page=100",
         "Test", True),
    )
    while clock() < deadline:
        for key, endpoint, name, workflow in endpoints:
            remaining = deadline - clock()
            if remaining <= 0:
                result[key] = {"status": "unavailable"}
                continue
            try:
                records = reader(endpoint, remaining)
                result[key] = latest_status(records, sha, name, workflow=workflow)
            except (subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError):
                # Do not report exception text: upstream output can contain secrets.
                result[key] = {"status": "unavailable", "reason": "api_read_failed"}
        remaining = deadline - clock()
        if remaining > 0:
            result["production"] = production(remaining)
        if result["pages"]["status"] == "failure":
            result["overall"] = "failure"
            return result
        if result["production"]["status"] == "success":
            result["overall"] = "success"
            return result
        remaining = deadline - clock()
        if remaining > 0:
            sleep(min(interval_seconds, remaining))
    result["overall"] = ("production_stale" if result["ci"]["status"] == "success"
                         and result["production"]["status"] == "stale" else "timeout")
    return result


def monitor_production(timeout_seconds=300, interval_seconds=20, *, production,
                       clock=time.monotonic, sleep=time.sleep):
    """Wait until production serves the checked-out data (no push in this run)."""
    _validate_budget(timeout_seconds, interval_seconds)
    deadline = clock() + timeout_seconds
    result = {"sha": None, "production": {"status": "missing"}, "overall": "pending"}
    while clock() < deadline:
        result["production"] = production(deadline - clock())
        if result["production"]["status"] == "success":
            result["overall"] = "success"
            return result
        remaining = deadline - clock()
        if remaining > 0:
            sleep(min(interval_seconds, remaining))
    result["overall"] = ("production_stale" if result["production"]["status"] == "stale"
                         else "timeout")
    return result


def emit(result, output_json=None):
    rendered = json.dumps(result, ensure_ascii=True, sort_keys=True)
    print(rendered)
    if result.get("ci", {}).get("status") == "failure":
        print(f"::warning::Test workflow failed for pushed commit {result.get('sha')}")
    if output_json:
        Path(output_json).write_text(rendered + "\n", encoding="utf-8")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        lines = ["", "### Data delivery verification", ""]
        if result["sha"]:
            ci_status = result["ci"]["status"]
            ci_label = f"**{ci_status}** (warning)" if ci_status == "failure" else f"**{ci_status}**"
            lines += [f"Pushed commit: `{result['sha']}`", "",
                      f"Cloudflare Pages: o-sumo: **{result['pages']['status']}**", "",
                      f"Test (push): {ci_label}", ""]
        else:
            lines += ["No push in this run; checked production against `main`.", ""]
        lines += [f"Production data: **{result['production']['status']}**", "",
                  f"Delivery: **{result['overall']}**.", ""]
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write("\n".join(lines))
    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as handle:
            handle.write(f"status={result['overall']}\n"
                         f"production_status={result['production']['status']}\n")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo")
    parser.add_argument("--sha")
    parser.add_argument("--production-url", required=True)
    parser.add_argument("--production-only", action="store_true",
                        help="skip commit checks; verify production serves the checkout's data")
    parser.add_argument("--data-root", default=".")
    parser.add_argument("--timeout-seconds", type=float, default=600)
    parser.add_argument("--interval-seconds", type=float, default=20)
    parser.add_argument("--output-json")
    args = parser.parse_args(argv)
    if not args.production_only:
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repo or ""):
            parser.error("--repo must be owner/repo")
        if not re.fullmatch(r"[0-9a-fA-F]{40}", args.sha or ""):
            parser.error("--sha must be a full 40-character commit SHA")
    if not re.fullmatch(r"https://[A-Za-z0-9.-]+/?", args.production_url):
        parser.error("--production-url must be an https origin")
    if not 0 < args.timeout_seconds <= 600 or not 0 < args.interval_seconds < float("inf"):
        parser.error("timeout must be in (0, 600]; interval must be finite and positive")
    expected = expected_versions(args.data_root)

    def production(timeout_seconds):
        return production_status(args.production_url, expected, str(time.time_ns()),
                                 timeout_seconds)

    if args.production_only:
        result = monitor_production(args.timeout_seconds, args.interval_seconds,
                                    production=production)
    else:
        result = monitor(args.repo, args.sha.lower(), args.timeout_seconds,
                         args.interval_seconds, production=production)
    emit(result, args.output_json)
    return {"success": 0, "failure": 1, "production_stale": 1, "timeout": 2}[result["overall"]]


if __name__ == "__main__":
    raise SystemExit(main())
