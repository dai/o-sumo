#!/usr/bin/env bash
set -euo pipefail

target_branch=${GITHUB_REF_NAME:-main}

for attempt in 1 2 3; do
  if git push origin "HEAD:${target_branch}"; then
    echo "pushed=true" >> "${GITHUB_OUTPUT:-/dev/null}"
    echo "commit_sha=$(git rev-parse HEAD)" >> "${GITHUB_OUTPUT:-/dev/null}"
    exit 0
  fi
  if [ "$attempt" -eq 3 ]; then
    echo "Push failed after 3 attempts; start a manual fresh rerun." >&2
    exit 1
  fi
  git fetch origin "$target_branch"
  if ! git rebase "origin/${target_branch}"; then
    git rebase --abort || true
    echo "Rebase conflict; remote data was preserved. Start a manual fresh rerun." >&2
    exit 1
  fi
  if ! python scripts/ci/validate_torikumi.py; then
    echo "Rebased payload validation failed; start a manual fresh rerun." >&2
    exit 1
  fi
done
