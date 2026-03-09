# o-sumo

日本語 / English

大相撲の番付・星取・取組データを毎日更新して配信するWebアプリです。  
A web app that publishes daily-updated sumo banzuke, hoshitori, and torikumi data.

## 1. 概要 / Overview

- フロントエンド: React + TypeScript + Vite
- データ生成: Python (`scripts/update_sumo_data.py`)
- 配信: Cloudflare Pages (`osada.us`)
- 公開API（静的JSON）:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`

This project uses official Nihon Sumo Kyokai Ajax endpoints and generates validated static datasets.

## 2. 主な機能 / Key Features

- 幕内42人・十両28人を厳密検証して番付データを生成
- 今日の取組結果と明日の取組予定（幕内21番 + 十両14番 = 35番）を生成
- 力士ごとに協会プロフィールURLを保持（将来のメモ追加に対応）
- Cloudflare Pages でサイトとJSON APIを同時配信

- Strict validation for banzuke counts (Makuuchi 42, Juryo 28)
- Daily torikumi dataset for today results + tomorrow schedule (35 bouts)
- Rikishi profile URLs included for future extension (notes, metadata)
- Site + JSON API served together on Cloudflare Pages

## 3. セットアップ / Setup

### 必要要件 / Requirements

- Node.js 18+
- npm 9+
- Python 3.10+

### インストール / Install

```bash
git clone https://github.com/dai/o-sumo.git
cd o-sumo
npm install
```

## 4. 開発コマンド / Commands

```bash
# 開発サーバー
npm run dev

# 本番ビルド
npm run build

# ビルド結果プレビュー
npm run preview

# Pages用ビルド（現状は build のエイリアス）
npm run pages:build

# データ再生成（番付・取組・API JSON）
python scripts/update_sumo_data.py
```

## 5. データ更新 / Data Update

`scripts/update_sumo_data.py` は以下を行います。

1. 公式Ajaxから番付・星取・取組を取得
2. 厳密バリデーション
   - 幕内42 / 十両28
   - 取組 35番（幕内21 + 十両14）
3. 出力を更新
   - `app/lib/sumo-data.ts`
   - `app/lib/torikumi-data.ts`
   - `public/api/v1/banzuke.json`
   - `public/api/v1/torikumi.json`

The script fails fast if counts are missing or inconsistent.

## 6. 自動更新 / Daily Automation

GitHub Actions:

- `.github/workflows/daily-data-update.yml`
- 毎日 18:00 JST (`cron: 0 9 * * *`)
- 更新内容は `main` 直pushではなく、PRとして作成

This keeps branch protection compatible with scheduled updates.

## 7. API公開 / API Endpoints

Cloudflare Pages デプロイ後:

- `https://osada.us/api/v1/banzuke.json`
- `https://osada.us/api/v1/torikumi.json`

These endpoints are static JSON files generated from official sources.

## 8. ディレクトリ / Important Paths

- `app/202603-o-sumo/page.tsx` - 番付ページ
- `app/202603-torikumi/page.tsx` - 取組ページ
- `app/components/BanzukeTable.tsx` - 番付テーブル
- `scripts/update_sumo_data.py` - データ生成の中核
- `public/api/v1/` - 公開JSON API

## 9. ライセンス / License

ISC

## 10. 作者 / Author

- [dai](https://github.com/dai)
