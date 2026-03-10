# 開発ガイド

このドキュメントは、現在の `o-sumo` リポジトリの実装と運用に合わせた開発メモです。

## 前提

- フロントエンドは React + TypeScript + Vite
- 配信先は Cloudflare Pages
- R2 は使いません
- Cloudflare Workers / R2 Worker も使いません
- データ更新は Python スクリプトで静的ファイルを生成します

## セットアップ

```bash
git clone https://github.com/dai/o-sumo.git
cd o-sumo
npm install
```

補足:

- このリポジトリは lockfile を commit していません
- 依存解決は `npm install` 前提です

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# テスト
npm test

# 本番ビルド
npm run build

# ビルド後プレビュー
npm run preview

# データ再生成
python scripts/update_sumo_data.py
```

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/202603-banduke`
- `http://localhost:3001/202603-torikumi`
- `http://localhost:3001/20260308-torikumi`
- `http://localhost:3001/20260308-yotei`

## デプロイ

Cloudflare Pages に対して `wrangler pages deploy` を使います。

例:

```bash
# branch preview
npx wrangler pages deploy dist --project-name o-sumo --branch codex-my-branch

# production branch として反映
npx wrangler pages deploy dist --project-name o-sumo --branch main
```

## 自動更新

### データ更新

- Workflow: `.github/workflows/daily-data-update.yml`
- 毎日 19:00 JST に更新
- 更新内容は PR として作成

### テスト

- Workflow: `.github/workflows/test.yml`
- PR と `main` / `codex/**` push で実行
- 実行内容:
  - `npm install`
  - `npm test`
  - `npm run build`

## 現在の主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: トップページ
- `app/202603-o-sumo/page.tsx`: 番付ページ
- `app/202603-torikumi/page.tsx`: 取組結果/予定の一覧ハブ
- `app/components/TorikumiDayPage.tsx`: 日別の取組ページ
- `app/lib/torikumi-routes.ts`: 月キーと日付 URL の解決
- `app/lib/torikumi-data.ts`: 取組アーカイブデータ
- `app/lib/sumo-data.ts`: 番付データ
- `scripts/update_sumo_data.py`: データ生成スクリプト

## 注意点

- `dist/` はビルド生成物です
- `public/_redirects` で SPA fallback を設定しています
- 月キー付きルートは `app/lib/torikumi-routes.ts` を基準に扱います
- 将来の場所替わりでも、固定の `202603-*` を新規追加しない方針です
