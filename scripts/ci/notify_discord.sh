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
#   detail: 任意の追加 Markdown 詳細（${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }} 等を展開可能）
#
# 環境変数:
#   DISCORD_WEBHOOK_URL    : Webhook URL（secrets）
#   DISCORD_USERNAME       : 投稿ユーザー名（省略可）
#   DISCORD_AVATAR_URL     : 投稿 avatar URL（省略可）
#
# secrets 未設定時は exit 0 で no-op。
set -euo pipefail

status="${1:-failure}"
title="${2:-GitHub Actions notification}"
detail="${3:-}"

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "DISCORD_WEBHOOK_URL is not set; skipping Discord notification."
  exit 0
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

# JSON ペイロード生成 (jq で安全に文字列をエスケープ)
read -r -d '' payload <<JSON
{
  "username": "${DISCORD_USERNAME:-o-sumo bot}",
  "avatar_url": "${DISCORD_AVATAR_URL:-}",
  "embeds": [
    {
      "title": ${title@Q},
      "description": $(printf '%s' "${detail}" | jq -Rs .),
      "color": ${color}
    }
  ]
}
JSON

echo "Posting notification to Discord..."
# -m 10 で全体タイムアウト, --fail で 4xx/5xx を fail として扱う
curl --silent --show-error --fail-with-body \
  -H 'Content-Type: application/json' \
  -m 10 \
  -d "${payload}" \
  "${DISCORD_WEBHOOK_URL}"

echo "Discord notification sent."