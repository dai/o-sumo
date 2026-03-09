# o-sumo

[English README](./README_en.md)

o-sumo は、大相撲の番付と取組情報を配信する静的 Web アプリです。React + TypeScript + Vite で構成し、Cloudflare Pages で公開しています。

## 概要

- 番付ページ: `/202603-banduke`
- 取組結果の月別ハブ: `/202603-torikumi`
- 取組予定の月別ハブ: `/202603-yotei`
- 日別の結果ページ: `/20260308-torikumi`, `/20260309-torikumi`
- 日別の予定ページ: `/20260308-yotei`, `/20260309-yotei`
- 公開 API:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`

## 技術スタック

- フロントエンド: React 19, TypeScript, React Router, Vite
- データ生成: Python (`scripts/update_sumo_data.py`)
- 配信: Cloudflare Pages
- データ取得元: 日本相撲協会の Ajax エンドポイント

## ローカル開発

前提:

- Node.js 18 以上
- npm 9 以上
- Python 3.10 以上

セットアップ:

```bash
git clone https://github.com/dai/o-sumo.git
cd o-sumo
npm install
```

開発サーバー:

```bash
npm run dev
```

確認先:

- `http://localhost:3001/`
- `http://localhost:3001/202603-banduke`
- `http://localhost:3001/202603-torikumi`
- `http://localhost:3001/20260308-torikumi`
- `http://localhost:3001/20260308-yotei`

本番ビルド確認:

```bash
npm run build
npm run preview
```

## データ更新

データ更新スクリプト:

```bash
python scripts/update_sumo_data.py
```

このスクリプトは以下を更新します。

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`

主な検証内容:

- 幕内 42 人
- 十両 28 人
- 幕内 21 番 + 十両 14 番
- 結果アーカイブは初日から当日まで生成
- 予定アーカイブは初日から翌日まで生成

## 自動更新

GitHub Actions で毎日 19:00 JST に更新します。

- Workflow: `.github/workflows/daily-data-update.yml`
- `main` へ直接 push せず、更新用ブランチから PR を作成

## Cloudflare Pages

本番:

- `https://osada.us`

branch preview の例:

- `https://codex-202603-ux-routing.o-sumo.pages.dev`

静的ホスティングでも日付 URL を直接開けるよう、`public/_redirects` で SPA fallback を設定しています。

## 主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: ホーム
- `app/202603-o-sumo/page.tsx`: 番付ページ
- `app/202603-torikumi/page.tsx`: 取組一覧ハブ
- `app/components/TorikumiDayPage.tsx`: 日別の結果/予定ページ
- `app/lib/torikumi-routes.ts`: 日付 URL とナビゲーションの解決
- `scripts/update_sumo_data.py`: 番付と取組データ生成

## 連絡先

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## ライセンス

ISC
