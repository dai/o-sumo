#!/usr/bin/env python3
"""Read-only, exact-commit production delivery verification (stdlib + gh)."""

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import time


def github_reader(endpoint, timeout_seconds):
    """Collect every page without exposing gh stderr or credentials."""
    result = subprocess.run(
        ["gh", "api", "--method", "GET", "--paginate", "--slurp", endpoint],
        capture_output=True, text=True, timeout=timeout_seconds, check=True,
    )
    pages = json.loads(result.stdout)
    key = "check_runs" if "/check-runs?" in endpoint else "workflow_runs"
    return [record for page in pages for record in page[key]]


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


def monitor(repo, sha, timeout_seconds=600, interval_seconds=20, *,
            reader=github_reader, clock=time.monotonic, sleep=time.sleep):
    if not 0 < timeout_seconds <= 600 or interval_seconds <= 0:
        raise ValueError("timeout must be in (0, 600]; interval must be positive")
    deadline = clock() + timeout_seconds
    result = {"sha": sha, "pages": {"status": "missing"},
              "ci": {"status": "missing"}, "overall": "pending"}
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
        statuses = [result[key]["status"] for key in ("pages", "ci")]
        if "failure" in statuses:
            result["overall"] = "failure"
            return result
        if statuses == ["success", "success"]:
            result["overall"] = "success"
            return result
        remaining = deadline - clock()
        if remaining > 0:
            sleep(min(interval_seconds, remaining))
    result["overall"] = "timeout"
    return result


def emit(result, output_json=None):
    rendered = json.dumps(result, ensure_ascii=True, sort_keys=True)
    print(rendered)
    if output_json:
        Path(output_json).write_text(rendered + "\n", encoding="utf-8")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write(f"\n### Data delivery verification\n\n"
                         f"Pushed commit: `{result['sha']}`\n\n"
                         f"Cloudflare Pages: o-sumo: **{result['pages']['status']}**\n\n"
                         f"Test (push): **{result['ci']['status']}**\n\n"
                         f"Delivery: **{result['overall']}**. A push alone does not prove publication.\n")
    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as handle:
            handle.write(f"status={result['overall']}\n"
                         f"pages_status={result['pages']['status']}\n"
                         f"ci_status={result['ci']['status']}\n")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--sha", required=True)
    parser.add_argument("--timeout-seconds", type=float, default=600)
    parser.add_argument("--interval-seconds", type=float, default=20)
    parser.add_argument("--output-json")
    args = parser.parse_args(argv)
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repo):
        parser.error("--repo must be owner/repo")
    if not re.fullmatch(r"[0-9a-fA-F]{40}", args.sha):
        parser.error("--sha must be a full 40-character commit SHA")
    if not 0 < args.timeout_seconds <= 600 or not 0 < args.interval_seconds < float("inf"):
        parser.error("timeout must be in (0, 600]; interval must be finite and positive")
    result = monitor(args.repo, args.sha.lower(), args.timeout_seconds, args.interval_seconds)
    emit(result, args.output_json)
    return {"success": 0, "failure": 1, "timeout": 2}[result["overall"]]


if __name__ == "__main__":
    raise SystemExit(main())
