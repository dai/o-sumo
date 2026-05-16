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
python scripts/update_sumo_data.py --rikishi-only
python scripts/update_sumo_data.py --rikishi-only --profile-limit 10
python scripts/style_transfer_rikishi.py
python scripts/update_sumo_data.py --torikumi-only
python scripts/update_sumo_data.py --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-scope schedule
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope schedule
```

場所ごとの力士プロフィール更新手順は `docs/rikishi-profile-refresh-runbook.md` を参照してください。

2026年4月27日の五月場所番付発表時の手順:

```bash
git pull --ff-only origin main
python scripts/update_sumo_data.py --torikumi-scope schedule
npm run typecheck
npm test
npm run build
```

`public/api/v1/banzuke.json` の `bashoName` が `五月場所`、`year` が `令和八年`、幕内42人、十両28人であることを確認してから反映します。

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/archives`
- `http://localhost:3001/rikishi`
- `http://localhost:3001/rikishi/{id}`
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
- 実行時刻: JST 09:00, 18:00
- 更新対象: 取組予定のみ（`--torikumi-only --torikumi-scope schedule`）
- 変更がある場合は `main` ブランチに直接 commit / push

- Workflow: `.github/workflows/realtime-torikumi-update.yml`
- 実行時刻: 場所期間中は毎日 JST 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 19:00, 20:00
- 更新対象: 取組結果 + 取組予定 + 番付（`--torikumi-scope all --skip-rikishi-fetch`）
- 変更がある場合は `main` ブランチに直接 commit / push
- JST 20:30 に監視ジョブを実行し、`resultUpdatedAt` が当日でなければ warning を出力
- 実行ログへ `github.event.schedule` / JST現在時刻 / `resultUpdatedAt` / `scheduleUpdatedAt` を出力

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
- `app/archives/page.tsx`: 過去場所一覧ページ
- `app/banzuke/page.tsx`: 番付ページ
- `app/torikumi/page.tsx`: 取組結果 / 予定の一覧ハブ
- `app/components/TorikumiDayPage.tsx`: 日別の取組ページ
- `app/lib/archives-data.ts`: 過去場所データ
- `app/lib/torikumi-routes.ts`: 月キーと日付 URL の解決
- `app/lib/torikumi-data.ts`: 取組アーカイブデータ
- `app/lib/sumo-data.ts`: 番付データ
- `scripts/update_sumo_data.py`: データ生成スクリプト

## 注意点

- `dist/` はビルド生成物です
- `public/_redirects` で SPA fallback を設定しています（アプリルートのみ。`/api/v1/*` は静的 JSON をそのまま配信）
- 月キー付きルートは `app/lib/torikumi-routes.ts` を基準に扱います
- 固定の `YYYYMM-*` ルートを増やすのではなく、生成データ由来の月キー解決を使います
- `public/images/rikishi/*.png` は日本相撲協会プロフィール写真をもとに MiniMax I2I Generation で加工した画像です。再生成時は `MINIMAX_API_KEY` を設定して `python scripts/style_transfer_rikishi.py` を使います

## 運用制約ポリシー（2026年5月場所向け）

- `daily-data-update.yml`（JST 09:00, 18:00）と `realtime-torikumi-update.yml`（JST 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 19:00, 20:00）は自動実行する。
- `realtime-torikumi-update.yml` は JST 20:30 の監視ジョブを持ち、`resultUpdatedAt` が当日でなければ warning を出す。
- 結果未更新時の確認順は `run履歴` → `runログ（event.schedule, JST, updatedAt系）` → `供給元 judge` とする。
- 2026年4月27日の番付発表後は、手動で `python scripts/update_sumo_data.py --torikumi-scope schedule` を実行し、五月場所の番付・取組予定・静的 API を同期する。
- Cloudflare の従量抑制を優先し、`public/_headers` のキャッシュ方針（`/assets/*` 長期 immutable、`manifest` 1時間、`sw.js` 再検証、`/` 5分）を維持する。
- PWA 更新は `vite-plugin-pwa` の `registerType: "autoUpdate"` を維持し、更新を自動反映する。
