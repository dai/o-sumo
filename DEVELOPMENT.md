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

七月場所は確定済みで、`app/lib/july2026-data.ts` と `app/lib/july2026-banzuke-data.ts` に不変スナップショットを保存しています。九月場所の番付が公式公開されるまでは、現行の `banzuke.json` と `torikumi.json` を七月場所のまま維持します。次の更新PRでは、公式番付・取組日程・公開JSON・月別ルート・sitemapを同時に検証してから切り替えます。

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/archives`
- `http://localhost:3001/rikishi`
- `http://localhost:3001/rikishi/{id}`
- `http://localhost:3001/{YYYYMM}-banzuke/`
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
- トリガー: 手動のみ（`workflow_dispatch`）— 七月場所終了（2026-07-26）後、自動スケジュールを停止
- 更新対象: 取組予定のみ（`--torikumi-only --torikumi-scope schedule`）
- 変更がある場合は `automation/data-updates` ブランチの PR を作成または更新

- Workflow: `.github/workflows/realtime-torikumi-direct-update.yml`
- トリガー: 手動のみ（`workflow_dispatch`）— 七月場所終了（2026-07-26）後、自動スケジュールを停止
- 更新対象: 取組結果のみ（`--torikumi-only --torikumi-scope result --skip-rikishi-fetch`）
- 変更がある場合は `automation/data-updates` ブランチの PR を作成または更新
- 実行ログへ `github.event.schedule` / JST現在時刻 / `resultUpdatedAt` / `scheduleUpdatedAt` を出力

- Workflow: `.github/workflows/news-feed-update.yml`
- 実行時刻: JST 09:00-19:00、2時間おき（唯一の自動実行 Workflow）
- 更新対象: ニュースフィード（`python scripts/update_news_feed.py`）
- 取得結果が変わらない場合は `news.json` を書き換えず、PR 差分を作らない

### テスト

- Workflow: `.github/workflows/test.yml`
- PR と `main` / `codex/**` / `automation/data-updates` push で実行
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

## AI Agent 対応 (Agent-Ready)

`public/.well-known/` 配下に以下の discovery 用エンドポイントを公開しています:

- `api-catalog` — RFC 9727 リンクセット（公開 JSON API へのポインタ）
- `openid-configuration` / `oauth-authorization-server` — 認証フローがないことを示す OIDC/RFC 8414 メタデータ
- `oauth-protected-resource` — RFC 9728 の Protected Resource Metadata
- `mcp/server-card.json` — MCP Server Card (SEP-1649)。MCP サーバーは提供していないため代替 endpoint のみ掲載
- `agent-skills/index.json` — Agent Skills Discovery RFC v0.2.0 形式のスキル index。sha256 ダイジェストはビルド時に計算
- `http-message-signatures-directory` — Web Bot Auth (IETF WebBotAuth WG) 署名ディレクトリ。Cloudflare Pages Function (`functions/.well-known/http-message-signatures-directory.ts`) が Ed25519 JWK を JWKS として公開し、RFC 9421 で自己署名します。署名鍵ペアは `scripts/generate_web_bot_auth_keys.mjs` で生成し、`functions/.well-known/_web-bot-auth-keys.ts` にインライン化されます（Pages の Workers ランタイムはリクエスト時に任意の fs を読めないため）

この他にルートに `auth.md`（エージェント登録なし・連絡先のみ）も公開しています。

ビルド時の挙動:

- `vite.config.ts` の `agentSkillsPlugin` がビルド時に SKILL.md を読み込み sha256 を計算して `index.json` を生成します
- `markdownViewsPlugin` が `scripts/build_markdown_views.ts` を呼び、`Accept: text/markdown` 用の静的 Markdown ビューを `dist/*/index.md` として書き出します
- スキルを増やしたい場合は `public/.well-known/agent-skills/<skill>/SKILL.md` を追加するだけで、index.json は自動更新されます

ブラウザ内の WebMCP は `app/components/WebMcpProvider.tsx` から `navigator.modelContext.provideContext()` で公開しています。Chrome 138+ 以外のブラウザでは no-op になります。

DNS-AID (SVCB/HTTPS) と DNSSEC の有効化は Cloudflare DNS 側の操作です。手順は `docs/agent-ready.md` を参照してください。

## 注意点

- `dist/` はビルド生成物です
- `public/_redirects` で SPA fallback を設定しています（アプリルートのみ。`/api/v1/*` は静的 JSON をそのまま配信）
- 月キー付きルートは `app/lib/torikumi-routes.ts` を基準に扱います
- 固定の `YYYYMM-*` ルートを増やすのではなく、生成データ由来の月キー解決を使います
- `public/images/rikishi/*.png` は日本相撲協会プロフィール写真をもとに MiniMax I2I Generation で加工した画像です。再生成時は `MINIMAX_API_KEY` を設定して `python scripts/style_transfer_rikishi.py` を使います

## 2026年七月場所アーカイブ後の運用

- 七月のスナップショットと現行APIは九月場所の番付公式公開まで変更しない。
- `daily-data-update.yml` と `realtime-torikumi-direct-update.yml` は `workflow_dispatch` のみとし、scheduleの復元と終了告知の解除は公式番付公開後の次PRで行う。
- 唯一の自動workflowである `news-feed-update.yml` は2時間おきのニュース更新を継続し、データに差分がない場合は `news.json` を書き換えない。
- Cloudflareのキャッシュ方針とPWAの `registerType: "autoUpdate"` は維持する。
