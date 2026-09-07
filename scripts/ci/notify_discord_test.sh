#!/usr/bin/env bash
# Tests for scripts/ci/notify_discord.sh
# Uses a PATH stub for curl so no real network calls happen.
set -euo pipefail

source_root=$PWD
script="$source_root/scripts/ci/notify_discord.sh"

root=$(mktemp -d)
root=$(cd "$root" && pwd -P)
case "$root" in
  /tmp/*|/c/Users/*/AppData/Local/Temp/*) ;;
  *) echo "refusing unsafe temp cleanup target: $root" >&2; exit 1 ;;
esac
cleanup() {
  if [ -n "$root" ] && [ "$root" != "/" ] && [ -d "$root" ]; then
    rm -rf -- "$root"
  fi
}
trap cleanup EXIT

mkdir -p "$root/stub-bin"
mkdir -p "$root/log"

cat >"$root/stub-bin/curl" <<'STUB'
#!/usr/bin/env bash
payload=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    -d) payload="$2"; shift 2 ;;
    *) shift ;;
  esac
done
echo "$payload" >"$STUB_LOG"
if [ "${STUB_FAIL:-0}" = "1" ]; then
  echo "stub curl forced failure" >&2
  exit 22
fi
exit 0
STUB
chmod +x "$root/stub-bin/curl"

# Run notify_discord.sh, capture exit code and stderr.
# Usage: invoke_notify <expected_status> <webhook_url> [script_args...]
invoke_notify() {
  local expected_status="$1"
  local webhook_url="$2"
  shift 2
  rm -f "$root/log/curl-payload.json"
  set +e
  env -i PATH="$root/stub-bin:/usr/bin:/bin" HOME="$HOME" \
    "DISCORD_WEBHOOK_URL=$webhook_url" \
    "STUB_LOG=$root/log/curl-payload.json" \
    bash "$script" "$@" >"$root/log/out" 2>"$root/log/err"
  local status=$?
  set -e
  if [ "$status" != "$expected_status" ]; then
    echo "expected status $expected_status, got $status" >&2
    cat "$root/log/err" >&2
    return 1
  fi
  return 0
}

# 1. Webhook unset -> exit 0, no curl invocation.
invoke_notify 0 "" failure "hello"
if [ -e "$root/log/curl-payload.json" ]; then
  echo "curl should not have been invoked" >&2
  exit 1
fi

# 2. Webhook set + valid JSON with quotes/newlines -> exit 0, curl received valid JSON.
title='He said "go" now'
detail=$'line1\nline2 with quote "x"'
invoke_notify 0 "https://discord.example/webhook" failure "$title" "$detail"
stub_log="$root/log/curl-payload.json"
grep -q 'go' "$stub_log" || { echo "expected JSON to contain go" >&2; cat "$stub_log" >&2; exit 1; }
# jq escapes embedded quotes; verify round-trip via jq rather than grep on escaped chars.
escaped_title=$(jq -r '.embeds[0].title' <"$stub_log")
if [ "$escaped_title" != "$title" ]; then
  echo "title did not round-trip through JSON: expected '$title', got '$escaped_title'" >&2
  exit 1
fi
grep -q 'line1' "$stub_log" || { echo "expected JSON to contain line1" >&2; cat "$stub_log" >&2; exit 1; }
grep -q 'line2' "$stub_log" || { echo "expected JSON to contain line2" >&2; cat "$stub_log" >&2; exit 1; }

# 3. JSON validity: payload must parse as JSON with jq and round-trip fields.
jq -e . <"$stub_log" >/dev/null
parsed_title=$(jq -r '.embeds[0].title' <"$stub_log")
if [ "$parsed_title" != "$title" ]; then
  echo "title round-trip mismatch: expected '$title', got '$parsed_title'" >&2
  exit 1
fi
parsed_color=$(jq -r '.embeds[0].color' <"$stub_log")
if [ "$parsed_color" != "15158332" ]; then
  echo "failure color mismatch: $parsed_color" >&2
  exit 1
fi

# 4. Unsupported status -> exit 1, no curl invocation.
rm -f "$stub_log"
invoke_notify 1 "https://discord.example/webhook" weird "x"
if [ -e "$stub_log" ]; then
  echo "curl should not have been invoked for unsupported status" >&2
  exit 1
fi

# 5. curl failure -> exit non-zero so caller can detect (caller must swallow).
set +e
env -i PATH="$root/stub-bin:/usr/bin:/bin" HOME="$HOME" \
  "DISCORD_WEBHOOK_URL=https://discord.example/webhook" \
  "STUB_LOG=$stub_log" \
  "STUB_FAIL=1" \
  bash "$script" success "y" >"$root/log/out" 2>"$root/log/err"
curl_status=$?
set -e
if [ "$curl_status" -eq 0 ]; then
  echo "expected non-zero exit on curl failure" >&2
  exit 1
fi
if [ ! -e "$stub_log" ]; then
  echo "expected curl to have been invoked even on failure" >&2
  exit 1
fi

echo "notify_discord.sh shell contract: OK"
