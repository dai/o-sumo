# 開発ガイド

[English Version](./DEVELOPMENT_en.md)

このドキュメントは、現在の `o-sumo` リポジトリの実装と運用に合わせた開発メモです。

## 前提

- フロントエンドは React 19 + TypeScript + Vite + React Router
- 配信先は Cloudflare Pages
- データ更新は Python スクリプトで静的ファイルを生成します
- 公開物は静的サイトと静的 JSON API です

## セットアップ

```bash
git clone https://github.com/dai/o-sumo.git
cd o-sumo
npm install
```

補足:

- `package-lock.json` は commit します
- 初回セットアップは `npm install`
- 再現性確認や CI では `npm ci` を使います

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# テスト
npm test

# 型チェック
npm run typecheck

# 本番ビルド
npm run build

# ビルド後プレビュー
npm run preview

# データ再生成
python scripts/update_sumo_data.py
```

データ更新の主なバリエーション:

```bash
python scripts/update_sumo_data.py --torikumi-only
python scripts/update_sumo_data.py --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-scope schedule
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope result
```

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/{YYYYMM}-banduke`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`

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
- 実行時刻: 毎日 10:00 JST / 18:00 JST
- 更新対象: 番付 + 取組予定
- 変更がある場合は `main` ブランチに直接 commit / push

- Workflow: `.github/workflows/realtime-torikumi-update.yml`
- 実行時刻: 15:00-19:30 JST の 30 分間隔、および 20:00 JST
- 更新対象: 取組結果のみ
- 変更がある場合は `main` ブランチに直接 commit / push

### テスト

- Workflow: `.github/workflows/test.yml`
- PR と `main` / `codex/**` push で実行
- 実行内容:
  - `npm ci`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`

## 現在の主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: トップページ
- `app/banzuke/page.tsx`: 番付ページ
- `app/torikumi/page.tsx`: 取組結果 / 予定の一覧ハブ
- `app/components/TorikumiDayPage.tsx`: 日別の取組ページ
- `app/lib/torikumi-routes.ts`: 月キーと日付 URL の解決
- `app/lib/torikumi-data.ts`: 取組アーカイブデータ
- `app/lib/sumo-data.ts`: 番付データ
- `scripts/update_sumo_data.py`: データ生成スクリプト

## 注意点

- `dist/` はビルド生成物です
- `public/_redirects` で SPA fallback を設定しています
- 月キー付きルートは `app/lib/torikumi-routes.ts` を基準に扱います
- 固定の `202603-*` ルートをコードに追加するのではなく、生成データ由来の月キーを使います

## 運用制約ポリシー（2026年5月場所向け）

- Actions の休場中ストップ運用は維持し、`daily-data-update.yml` / `realtime-torikumi-update.yml` の `schedule` は復帰させない。
- Cloudflare の従量抑制を優先し、`public/_headers` のキャッシュ方針（`/assets/*` 長期 immutable、`manifest` 1時間、`sw.js` 再検証、`/` 5分）を維持する。
- PWA 更新は `vite-plugin-pwa` の `registerType: "prompt"` を維持し、利用者同意なしの即時更新を避ける。
