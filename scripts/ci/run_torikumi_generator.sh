#!/usr/bin/env bash
# Common runner for `scripts/update_sumo_data.py` invoked from CI workflows.
#
# Usage:
#   bash scripts/ci/run_torikumi_generator.sh <flags-for-update_sumo_data.py>
#
# Behavior:
#   - Forwards all arguments to update_sumo_data.py.
#   - Retries the command up to 2 times with a 10 second back-off on failure.
#   - Exits non-zero if all attempts fail.
#
# Designed to be sourced or executed directly. Uses `set -euo pipefail` so any
# unexpected error aborts the run.

set -euo pipefail

extra_flags=("$@")

success=0
for attempt in 1 2; do
  if python scripts/update_sumo_data.py "${extra_flags[@]}"; then
    success=1
    break
  fi

  if [ "$attempt" -lt 2 ]; then
    echo "Generate torikumi data failed (attempt ${attempt}/2). Retrying..." >&2
    sleep 10
  fi
done

if [ "$success" -ne 1 ]; then
  echo "Generate torikumi data failed after 2 attempts." >&2
  exit 1
fi
