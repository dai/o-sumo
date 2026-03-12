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

主な UI:

- トップページの主ナビは `番付 / 取組予定 / 結果`
- 番付ページ、月別ハブ、日別ページに `昇順 / 降順` ソートあり
- 取組結果 / 取組予定は 15 日分のページを常に先出し
- 未更新日は `結果未更新` / `取組予定未更新` として空状態表示

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

`package-lock.json` は commit します。初回セットアップは `npm install`、再現性を重視した再構築や CI は `npm ci` を使います。

開発サーバー:

```bash
npm run dev
```

確認先:

- `http://localhost:3001/`
- `http://localhost:3001/202603-banduke`
- `http://localhost:3001/202603-torikumi`
- `http://localhost:3001/202603-yotei`
- `http://localhost:3001/20260308-torikumi`
- `http://localhost:3001/20260308-yotei`

本番ビルド確認:

```bash
npm run build
npm run preview
```

テスト実行:

```bash
npm test
```

型チェック:

```bash
npm run typecheck
```

## データ更新

データ更新スクリプト:

```bash
python scripts/update_sumo_data.py
```

取組だけを高頻度更新する場合:

```bash
python scripts/update_sumo_data.py --torikumi-only
```

このスクリプトは以下を更新します。

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`

主な検証内容:

- 幕内 42 人
- 十両 28 人
- 結果 / 予定アーカイブは 15 日分生成
- 公開済み日は実データで埋める
- 未更新日は pending として空状態のまま生成

## 自動更新

GitHub Actions で通常更新と高頻度更新を分けています。

- 日次更新: `.github/workflows/daily-data-update.yml`
  - 毎日 10:00 JST / 18:00 JST
  - 番付と取組予定データを更新
- 高頻度更新: `.github/workflows/realtime-torikumi-update.yml`
  - 15:00-18:00 JST に 30 分間隔
  - 取組結果だけを更新
- どちらも `main` へ直接 push せず、更新用ブランチから PR を作成

## テスト

最小の自動テストを導入しています。

- test runner: Vitest
- component test: Testing Library
- workflow: `.github/workflows/test.yml`

現在の対象:

- `app/lib/torikumi-routes.ts` のルーティング helper
- `app/lib/sorting.ts` の並び替え helper
- ホームページの主要導線
- 番付ページのソート
- 月別ハブの 15 日表示とソート
- 日別取組ページのソートと未更新表示

GitHub Actions では PR と `main` / `codex/**` への push で以下を実行します。

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `python scripts/update_sumo_data.py`
- `git diff --exit-code`

生成スクリプト実行後に差分が残る場合、生成物の commit 漏れとして CI を fail させます。

## Cloudflare Pages

本番:

- `https://osada.us`

branch preview の例:

- `https://codex-ux-15day-sort-live.o-sumo.pages.dev`

静的ホスティングでも日付 URL を直接開けるよう、`public/_redirects` で SPA fallback を設定しています。

## 主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: ホーム
- `app/banzuke/page.tsx`: 番付ページ
- `app/torikumi/page.tsx`: 取組一覧ハブ
- `app/components/TorikumiDayPage.tsx`: 日別の結果/予定ページ
- `app/lib/torikumi-routes.ts`: 日付 URL とナビゲーションの解決
- `scripts/update_sumo_data.py`: 番付と取組データ生成

## 連絡先

- X: https://x.com/daisuke
   - X: https://x.com/daisuke/status/2027263585244889097 しこ名辞書 (v202603) 
- GitHub: https://github.com/dai/o-sumo

## ライセンス

ISC
