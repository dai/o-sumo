# o-sumo

[English README](./README_en.md)

o-sumo は、大相撲の番付と取組情報を配信する静的 Web アプリです。React 19 + TypeScript + Vite で構築し、Cloudflare Pages から静的サイトと静的 JSON API を公開しています。

## ドキュメント一覧

- README: `README.md` / `README_en.md`
- 開発ガイド: `DEVELOPMENT.md` / `DEVELOPMENT_en.md`
- Skills 一覧: `SKILLS.md` / `SKILLS_en.md`
- API 仕様: `docs/api/v1.md` / `docs/api/v1.en.md`
- API ポリシー: `docs/api/policy.md` / `docs/api/policy.en.md`
- API 変更履歴: `docs/api/changelog.md` / `docs/api/changelog.en.md`

## 概要

- Web ルート:
  - ホーム: `/`
  - 番付: `/{YYYYMM}-banduke`
  - 結果ハブ: `/{YYYYMM}-torikumi`
  - 予定ハブ: `/{YYYYMM}-yotei`
  - 日別結果: `/{YYYYMMDD}-torikumi`
  - 日別予定: `/{YYYYMMDD}-yotei`
- 現行ルート例:
  - `/202603-banduke`
  - `/202603-torikumi`
  - `/20260322-yotei`
- 旧番付 URL `/{YYYYMM}-o-sumo` は現行の番付 URL にリダイレクトされます。
- 公開 API:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`

関連ドキュメント:

- `docs/api/v1.md`
- `docs/api/policy.md`
- `docs/api/changelog.md`
- `DEVELOPMENT.md`

Skill 公開:

- `SKILLS.md`
- `skills/osumo-api/SKILL.md`

## 主な機能

- ホームから `番付 / 取組予定 / 結果` に直接遷移
- 番付ページで幕内・十両の番付と成績を表示
- 月別ハブで 15 日分の日別ページを一覧表示
- 日別ページで幕内・十両の取組を表示
- 番付・月別ハブ・日別ページで `昇順 / 降順` を切り替え可能
- 未更新日は `pending` として URL を先出しし、空状態メッセージを表示
- 月キーは `app/lib/torikumi-data.ts` の生成データから動的に決まります

## 技術スタック

- フロントエンド: React 19, TypeScript, React Router, Vite
- テスト: Vitest, Testing Library, jsdom
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

補足:

- `package-lock.json` は commit します
- 初回セットアップは `npm install`
- 再現性重視の再構築や CI は `npm ci`

主要コマンド:

```bash
# 開発サーバー
npm run dev

# 型チェック
npm run typecheck

# テスト
npm test

# 本番ビルド
npm run build

# ビルド結果のローカル確認
npm run preview
```

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/{YYYYMM}-banduke`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`
- `http://localhost:3001/rikishi/{id}`

## データ更新

フル更新（番付 + 取組 + 力士プロファイル）:

```bash
python scripts/update_sumo_data.py
```

力士プロファイルのみを更新:

```bash
python scripts/update_sumo_data.py --rikishi-only
```

力士プロファイル取得を最初の10人に限定（テスト用）:

```bash
python scripts/update_sumo_data.py --rikishi-only --profile-limit 10
```

取組だけを更新:

```bash
python scripts/update_sumo_data.py --torikumi-only
```

結果のみ / 予定のみを更新:

```bash
python scripts/update_sumo_data.py --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-scope schedule
```

取組だけを対象に結果または予定だけを更新:

```bash
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope schedule
```

生成・更新対象:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`
- `public/api/v1/rikishi.json`
- `public/api/v1/rikishi/{id}.json`（全力士分）

主な検証内容:

- 幕内 42 人
- 十両 28 人
- 結果 / 予定アーカイブを 15 日分生成
- 公開済み日は取得済みデータで埋める
- 未更新日は `pending` のプレースホルダーとして残す

## 自動更新

GitHub Actions で日次更新と結果更新を分けています。

- 日次更新: `.github/workflows/daily-data-update.yml`
  - 実行時刻: 毎日 10:00 JST / 18:00 JST
  - 実行内容: 番付 + 取組予定を更新
  - 変更がある場合は `main` に直接 commit / push
- 結果更新: `.github/workflows/realtime-torikumi-update.yml`
  - 実行時刻: 15:00-19:30 JST の 30 分間隔、および 20:00 JST
  - 実行内容: 取組結果のみ更新
  - 変更がある場合は `main` に直接 commit / push

## テスト

- test runner: Vitest
- component test: Testing Library
- workflow: `.github/workflows/test.yml`

現在の主な対象:

- `app/lib/torikumi-routes.ts` のルーティング helper
- `app/lib/sorting.ts` の並び替え helper
- ホームの主要導線
- 番付ページのソート
- 月別ハブの 15 日表示とソート
- 日別取組ページのソートと未更新表示

GitHub Actions では PR と `main` / `codex/**` への push で以下を実行します。

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Cloudflare Pages

- 本番 URL: `https://osada.us`
- SPA fallback: `public/_redirects`
- 日付ベースの URL を直接開いても `index.html` にフォールバックします

## 運用ポリシー（2026年5月場所向け）

- GitHub Actions の定期実行は休場中停止を維持し、`workflow_dispatch` のみで運用します（自動再開しない）。
- Cloudflare の従量抑制のため、`public/_headers` でキャッシュ方針を固定します。
- `/assets/*`: `public, max-age=31536000, immutable`
- `/manifest.webmanifest`: `public, max-age=3600`
- `/sw.js`: `public, max-age=0, must-revalidate`
- `/`: `public, max-age=300`
- PWA の Service Worker 更新は `registerType: "prompt"` で運用し、即時自動更新は行いません。

## 主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: ホーム
- `app/banzuke/page.tsx`: 番付ページ
- `app/torikumi/page.tsx`: 取組結果 / 取組予定の月別ハブ
- `app/rikishi/[id]/page.tsx`: 力士プロファイルページ
- `app/components/TorikumiDayPage.tsx`: 日別の結果 / 予定ページ
- `app/components/BanzukeTable.tsx`: 番付テーブルコンポーネント
- `app/lib/torikumi-routes.ts`: 月キー付き URL とナビゲーション解決
- `app/lib/sumo-data.ts`: 番付データ（力士型定義を含む）
- `app/lib/torikumi-data.ts`: 取組アーカイブデータ
- `scripts/update_sumo_data.py`: データ生成スクリプト

## 連絡先

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## ライセンス

ISC
