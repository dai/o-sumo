#!/usr/bin/env bash
#
# Discord webhook 通知スクリプト
#
# 使い方:
#   bash scripts/ci/notify_discord.sh <status> <title> [detail]
#
# 引数:
#   status: success | failure | cancelled
#   title : 通知タイトル（例: "Realtime Torikumi Update 失敗"）
#   detail: 任意の追加 Markdown 詳細
#
# 環境変数:
#   DISCORD_WEBHOOK_URL    : Webhook URL（secrets）
#   DISCORD_USERNAME       : 投稿ユーザー名（省略可）
#   DISCORD_AVATAR_URL     : 投稿 avatar URL（省略可）
#
# secrets 未設定時は exit 0 で no-op。
# curl 失敗時は non-zero で終了するが、caller 側で握りつぶす想定。
set -euo pipefail

status="${1:-failure}"
title="${2:-GitHub Actions notification}"
detail="${3:-}"

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "DISCORD_WEBHOOK_URL is not set; skipping Discord notification."
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed" >&2
  exit 1
fi

case "${status}" in
  success)   color=3066993 ;; # green
  cancelled) color=12745742 ;; # grey
  failure)   color=15158332 ;; # red
  *)
    echo "Unsupported status: ${status}" >&2
    exit 1
    ;;
esac

# JSON ペイロード生成 (jq -n --arg で安全にエスケープ)
payload=$(jq -n \
  --arg username "${DISCORD_USERNAME:-o-sumo bot}" \
  --arg avatar_url "${DISCORD_AVATAR_URL:-}" \
  --arg title "${title}" \
  --arg description "${detail}" \
  --argjson color "${color}" \
  '{username: $username, avatar_url: $avatar_url, embeds: [{title: $title, description: $description, color: $color}]}')

echo "Posting notification to Discord..."
# -m 10 で全体タイムアウト, --fail で 4xx/5xx を fail として扱う
curl --silent --show-error --fail-with-body \
  -H 'Content-Type: application/json' \
  -m 10 \
  -d "${payload}" \
  "${DISCORD_WEBHOOK_URL}"

echo "Discord notification sent."
