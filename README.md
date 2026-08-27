# o-sumo

[![Is Your Site Agent-Ready? 100点達成（コマース以外）](https://pbs.twimg.com/media/HO21kitagAABB1E.png)](https://x.com/daisuke/status/2084522046508396992)

[![DeepWiki](https://img.shields.io/badge/DeepWiki-dai%2Fo--sumo-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/dai/o-sumo)



[English README](./README_en.md)

o-sumo は、大相撲の番付、取組、力士・行司・呼出名鑑を配信する静的 Web アプリです。React 19 + TypeScript + Vite で構築し、Cloudflare Pages から静的サイトと静的 JSON API を公開しています。

## ドキュメント一覧

- README: `README.md` / `README_en.md`
- 開発ガイド: `DEVELOPMENT.md` / `DEVELOPMENT_en.md`
- Skills 一覧: `SKILLS.md` / `SKILLS_en.md`
- API 仕様: `docs/api/v1.md` / `docs/api/v1.en.md`
- API ポリシー: `docs/api/policy.md` / `docs/api/policy.en.md`
- API 変更履歴: `docs/api/changelog.md` / `docs/api/changelog.en.md`
- 力士プロフィール・合い口更新手順: `docs/rikishi-profile-refresh-runbook.md`
- 行司・呼出データ更新手順: `docs/official-profile-refresh-runbook.md`

## 概要

- Web ルート:
  - ホーム: `/`
  - 過去場所一覧: `/archives`
  - 力士一覧: `/rikishi`
  - 力士プロフィール: `/rikishi/{id}`
  - マイ力士: `/my-rikishi/`
  - 力士比較: `/compare/?ids={id1},{id2}`
  - 行司名鑑: `/gyoji/`
  - 行司プロフィール: `/gyoji/{id}/`
  - 呼出名鑑: `/yobidashi/`
  - 呼出プロフィール: `/yobidashi/{id}/`
  - 番付: `/{YYYYMM}-banzuke/`
  - 結果ハブ: `/{YYYYMM}-torikumi`
  - 予定ハブ: `/{YYYYMM}-yotei`
  - 日別結果: `/{YYYYMMDD}-torikumi`
  - 日別予定: `/{YYYYMMDD}-yotei`
  - 決まり手: `/kimarite`
  - 場所ステータス分析: `/analytics/`
- 現行ルート例:
  - `/202607-banzuke/`
  - `/202607-torikumi`
  - `/20260712-yotei`
  - `/compare/?ids=3842,4227`
  - `/kimarite`
- 旧番付 URL `/{YYYYMM}-o-sumo` は現行の番付 URL にリダイレクトされます。
- 公開 API:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`
  - `/api/v1/rikishi.json`
  - `/api/v1/rikishi/{id}.json`
  - `/api/v1/rikishi-matchups.json`
  - `/api/v1/gyoji.json`
  - `/api/v1/gyoji/{id}.json`
  - `/api/v1/yobidashi.json`
  - `/api/v1/yobidashi/{id}.json`
  - `/api/v1/news.json`

関連ドキュメント:

- `docs/api/v1.md`
- `docs/api/policy.md`
- `docs/api/changelog.md`
- `DEVELOPMENT.md`

Skill 公開:

- `SKILLS.md`
- `public/.well-known/agent-skills/osumo-content/SKILL.md`
- `public/.well-known/agent-skills/osumo-discovery/SKILL.md`
- `skills/osumo-api/SKILL.md`

## 主な機能

- ホームから `番付 / 取組予定 / 結果 / 力士・行司・呼出名鑑 / マイ力士 / 力士比較 / 場所ステータス分析` に直接遷移
- **今日のみどころ（注目取組ピックアップ）**:
  - トップページの Hero 直下に、当日の注目取組（1〜2番）をピックアップして表示
  - 東西力士の対戦カード、番付、アバター、**合口（直接対戦成績・勝率比率メーター）**、みどころ解説文、および力士比較ページへのワンタップ導線を提供
  - 公式取組データが存在する日は当日の幕内結びから自動生成。手書きの固定対戦・固定解説・固定 head-to-head レコードは廃止
  - 公式取組が未発表の日は「今日のみどころ / 公式取組発表待ち / 公式取組の発表後に、注目取組・合口・比較への導線を掲載します。」のみを中立で表示し、力士名・記事・合口・比較・取組リンク・一言物申すは一切出さない
  - 合口は `/api/v1/rikishi-matchups.json`（公式プロフィール履歴から事前集計された JSON）からのみ取得し、取得成功時だけ表示。失敗時は合口を隠して比較・取組リンクは維持
- **力士比較の全面刷新 (`/compare/?ids={id1},{id2}`)**:
  - 相撲ファン注目の「**合口（直接対戦成績・相性）**」を主役に据えたスコアボード（スコア、勝率、勝ち越しバッジ、ツートンメーターバー）
  - 東 vs 西のグラフィカルな対決カード（番付・アバター・今場所成績）
  - 身長・体重・通算勝率の左右ビジュアル比較バー ＆ 体格差ハイライト
  - 本場所アーカイブから自動集計した得意決まり手（勝ち技ランキング）の並列比較
  - 注目対戦（横綱・大関・関脇対決等）やマイ力士ペアからのワンタップクイック選択
- 日本相撲協会公式サイトを出典とする現役行司42名・呼出45名の一覧と個別プロフィールを日英表示。公式数値IDをURLとJSON APIに使用し、写真は掲載しません
- 番付ページで幕内・十両の番付と成績を表示し、MiniMax I2I Generation で加工した力士プロフィール画像とあわせて力士プロフィールへ遷移
- マイ力士 (`/my-rikishi/`) で最大10名まで四股名を登録し、ナビゲーション件数バッジ表示、URL 同期と `localStorage` 永続化で端末をまたいで保持
- 場所ステータス分析 (`/analytics/`) で幕内優勝・三賞・十両優勝を一覧表示
- 各ページの URL を `ShareCurrentLink` ボタンでクリップボードへコピー（手動フォールバック付き）
- 月別ハブで 15 日分の日別ページを一覧表示
- 日別ページで幕内・十両の取組を表示し、取組力士名からプロフィールへ遷移
- 番付・月別ハブ・日別ページで `昇順 / 降順` を切り替え可能
- 未更新日は `pending` として URL を先出しし、空状態メッセージを表示
- 月キーは `app/lib/torikumi-data.ts` の生成データから動的に決まります
- ホームの **最新ニュース** セクションで日本相撲協会のお知らせと相撲界ニュース（dmenu スポーツから最新 5 件）を 2 つのサブセクションに分けて表示
- ホームの **決まり手** カードから全 82 手の索引ページ `/kimarite` へ遷移し、カテゴリ別の目次と並んで技の和英解説を閲覧可能
- ニュース JSON は GitHub Actions の `news-feed-update` ワークフローから Python スクレイパで自動生成（`/api/v1/news.json`）
- AI エージェント対応ブラウザー向けに WebMCP 4 ツール (`search_rikishi` / `list_basho` / `get_banzuke_for_month` / `get_torikumi_for_day`) を公開 (`document.modelContext.registerTool` を優先、`navigator.modelContext.registerTool` にフォールバック)

## 技術スタック

- フロントエンド: React 19, TypeScript, React Router, Vite
- テスト: Vitest, Testing Library, jsdom
- データ生成: Python (`scripts/update_sumo_data.py`, `scripts/update_official_profiles.py`)
- 配信: Cloudflare Pages
- データ取得元: 日本相撲協会の Ajax エンドポイント、および行司・呼出の公式会員一覧／プロフィールページ
- 力士画像: 日本相撲協会プロフィール写真をベースに MiniMax I2I Generation で加工したローカル PNG
- ニュース取得元: 日本相撲協会のお知らせページと dmenu スポーツ (`https://sumo.sports.smt.docomo.ne.jp/news/`)

## ローカル開発

前提:

- Node.js 20.19 以上、または 22.12 以上
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

# 現行データ切替の読み取り専用事前確認
npm run preflight:current-data

# ビルド結果のローカル確認
npm run preview
```

ローカル確認先:

- `http://localhost:3001/`
- `http://localhost:3001/archives`
- `http://localhost:3001/rikishi`
- `http://localhost:3001/rikishi/{id}`
- `http://localhost:3001/my-rikishi/`
- `http://localhost:3001/compare/?ids={id1},{id2}`
- `http://localhost:3001/gyoji/`
- `http://localhost:3001/gyoji/{id}/`
- `http://localhost:3001/yobidashi/`
- `http://localhost:3001/yobidashi/{id}/`
- `http://localhost:3001/{YYYYMM}-banzuke/`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`
- `http://localhost:3001/kimarite`
- `http://localhost:3001/analytics/`
- `http://localhost:3001/api/v1/rikishi-matchups.json`
- `http://localhost:3001/api/v1/news.json`

## データ更新

フル更新（番付 + 取組 + 力士プロファイル）:

```bash
python scripts/update_sumo_data.py
```

力士プロファイルのみを更新:

```bash
python scripts/update_sumo_data.py --rikishi-only
```

この全件更新ではプロフィール詳細に加え、改名前後の四股名を公式力士IDへ統合した `rikishi-matchups.json` も生成します。全対象の取得・ID解決・相互整合が完了した場合だけ置き換え、部分取得や解析失敗時は正常な既存ファイルを保持します。公開前の確認手順は `docs/rikishi-profile-refresh-runbook.md` を参照してください。

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

ニュースフィードだけを更新（日本相撲協会お知らせ + dmenu スポーツ）:

```bash
python scripts/update_news_feed.py
```

行司・呼出名鑑だけを日本相撲協会公式サイトから更新:

```bash
python scripts/update_official_profiles.py
python scripts/update_official_profiles_test.py
```

生成内容と公開前の整合確認は `docs/official-profile-refresh-runbook.md` を参照してください。

七月場所は確定済みで、`app/lib/july2026-data.ts` と `app/lib/july2026-banzuke-data.ts` に不変スナップショットを保持しています。`/api/v1/banzuke.json` と `/api/v1/torikumi.json` は、九月場所の番付が公式公開されるまで引き続き七月場所を返します。

切替前の確認は `npm run preflight:current-data` で実行します。公式年間日程と公式番付を取得し、現行の番付・取組、archive、ルート、sitemap、workflow の整合性を読み取り専用で検査します。既定値は `--current-month 202607 --target-month 202609` です。すべてのゲートが `[OK]` のときだけ `READY`（exit code 0）、公式公開前・取得失敗・不整合がある場合は `BLOCKED`（exit code 1）になります。生成器は実行せず、データ・ルート・sitemap・redirect・workflow は変更しません。

別の月を確認するときは `npm run preflight:current-data -- --current-month YYYYMM --target-month YYYYMM` のように npm 経由で `--` 以降に引数を渡してください（npm 8.x 以降）。あるいは `python scripts/preflight_current_basho.py --current-month YYYYMM --target-month YYYYMM` を直接呼び出すこともできます。npm script は固定の既定値のままなので、次回以降の切替時は月引数を毎回指定してください。

九月場所の公式番付公開後に、取得元・番付・取組日程を確認して次の更新PRを開始します。

次の更新PRでは、現行の七月スナップショットを変更せず、`banzuke.json` と `torikumi.json` を新しい場所の確定データへ同時に切り替えます。切替前には、番付・取組・公開JSON・月別ルート・sitemapの整合性を検証します。

生成・更新対象:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`
- `public/api/v1/rikishi.json`
- `public/api/v1/rikishi/{id}.json`（全力士分、`name` / `yomi` / `currentRank` / `sourceUrl` / `updatedAt` を含む）
- `public/api/v1/rikishi-matchups.json`（公式プロフィール履歴から生成した一意なIDペアと双方の勝数）
- `public/api/v1/news.json`（日本相撲協会お知らせ 3 件 + dmenu スポーツ最新 5 件）
- `public/api/v1/gyoji.json` / `public/api/v1/gyoji/{id}.json`（行司42名）
- `public/api/v1/yobidashi.json` / `public/api/v1/yobidashi/{id}.json`（呼出45名）
- `public/images/rikishi/{id}.png`（全力士分の加工済みプロフィールイラスト、個別ページと番付ページで恒久的に使用）

主な検証内容:

- 幕内 42 人
- 十両 28 人
- 結果 / 予定アーカイブを 15 日分生成
- 公開済み日は取得済みデータで埋める
- 未更新日は `pending` のプレースホルダーとして残す
- 行司42名・呼出45名の一覧と個別JSONが一致し、画像フィールドを含まない

## 自動更新

GitHub Actions で取組予定、取組結果、ニュース更新を分けています。変更がある場合はいずれも `automation/*-updates` ブランチの PR を作成または更新します。

共通スクリプト:

- `scripts/ci/run_torikumi_generator.sh` — 最大 2 回リトライで `update_sumo_data.py` を実行
- `scripts/ci/validate_torikumi.py` — `public/api/v1/torikumi.json` の構造検証
- `scripts/ci/validate_news.py` — `public/api/v1/news.json` の構造検証
- `scripts/ci/notify_discord.sh` — `DISCORD_WEBHOOK_URL` が設定されていれば Discord に失敗通知

ワークフロー一覧:

- 日次更新: `.github/workflows/daily-data-update.yml`
  - トリガー: 休止中は手動のみ（`workflow_dispatch`）
  - 実行内容: 取組予定のみ更新（`--torikumi-only --torikumi-scope schedule`）
  - 手動実行: GitHub Actions の `Run workflow` または `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main`
- 結果更新: `.github/workflows/realtime-torikumi-direct-update.yml`
  - トリガー: 休止中は手動のみ（`workflow_dispatch`）
  - 実行内容: 取組結果のみ更新（`--torikumi-only --torikumi-scope result --skip-rikishi-fetch --strict-torikumi-fetch`）
  - 手動実行: GitHub Actions の `Run workflow` または `gh workflow run realtime-torikumi-direct-update.yml -R dai/o-sumo --ref main`
  - ログ: GitHub Actions の Job Summary に step result / committed / event / run URL を集約
- ニュース更新: `.github/workflows/news-feed-update.yml`
  - 実行時刻: JST 09:05-19:05、2時間おき
  - 実行内容: 日本相撲協会お知らせ + dmenu スポーツを更新（`python scripts/update_news_feed.py`）
  - 取得結果が変わらない場合は `news.json` を書き換えず、PR 差分を作らない
  - PR 作成時は `gh pr merge --auto --squash` でテスト通過後に自動マージ

### Discord 通知（任意）

`DISCORD_WEBHOOK_URL` を repo secret に設定すると、3 つのワークフローの失敗時に Discord チャンネルへ通知が飛びます。未設定でも wf はそのまま動きます。

設定手順:

1. Discord の対象チャンネル → `編集` → `連携サービス` → `ウェブフック` を作成、URL をコピー
2. GitHub のリポジトリページ → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
3. Name: `DISCORD_WEBHOOK_URL`、Value: 上でコピーした URL → `Add secret`

通知のペイロードは `scripts/ci/notify_discord.sh` を参照（status / title / detail を受け取り Embed として POST）。

## GitHub Mobile + Copilot 運用

- 事前準備:
  - リポジトリ指示: `.github/copilot-instructions.md`
- 週末の最短フロー:
  - GitHub Mobile で Issue を作成し、Copilot cloud agent に割り当てる
  - Agent session で差分と説明を確認する
  - 作成された PR で `test.yml`（`typecheck` / `test` / `build`）通過を確認する
  - GitHub Mobile 上でレビューして merge する

## テスト

- test runner: Vitest
- component test: Testing Library
- workflow: `.github/workflows/test.yml`

現在の主な対象:

- `app/lib/torikumi-routes.ts` のルーティング helper
- `app/lib/sorting.ts` の並び替え helper
- `app/lib/kimarite-data.ts` の 82 手マスタ
- ホームの主要導線
- ホームのニュースセクション（相撲協会 / 相撲界ニュース 2 セクション・空状態・see-all リンク）
- 番付ページのソート
- 月別ハブの 15 日表示とソート
- 日別取組ページのソートと未更新表示
- 行司・呼出の一覧／詳細、日英階級、公式数値ID、APIパス、動的メタデータ、sitemap
- マイ力士のトグル／一覧／IME 入力補正と URL 同期
- 力士比較（2名固定）の4種類検索、URL同期、指定7項目、列順に応じた合い口表示
- 場所ステータス分析 (`/analytics/`) の幕内・三賞・十両結果
- `WebMcpProvider` の 4 ツール登録 (`document.modelContext.registerTool` / `navigator.modelContext.registerTool`)

GitHub Actions では PR と `main` / `codex/**` / `automation/data-updates` への push で以下を実行します。

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Cloudflare Pages

- 本番 URL: `https://osada.us`
- SPA fallback: `public/_redirects`（アプリルートのみ。`/api/v1/*` は静的 JSON をそのまま配信）
- 日付ベースの URL を直接開いても `index.html` にフォールバックします

## 運用ポリシー（七月場所アーカイブ〜九月場所番付発表前）

- 七月のTypeScriptスナップショットと現行の `/api/v1/banzuke.json` / `/api/v1/torikumi.json` は、九月場所の公式番付公開まで維持します。
- 取組予定・結果のworkflowは `workflow_dispatch` のみとし、九月場所の番付公開後の次PRで schedule を復元します。
- ニュース更新だけは JST 09:05-19:05 の2時間おきに継続します。
- CLI では `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main` / `gh workflow run realtime-torikumi-direct-update.yml -R dai/o-sumo --ref main` / `gh workflow run news-feed-update.yml -R dai/o-sumo --ref main` を使えます。
- 結果更新 workflow は `--torikumi-only --torikumi-scope result --skip-rikishi-fetch` を使い、取組結果に限定します。
- 「結果未更新」を確認した場合は、`run履歴` → `runログ（event.schedule, JST, updatedAt系）` → `供給元 judge` の順で切り分けます。
- Cloudflare の従量抑制のため、`public/_headers` でキャッシュ方針を固定します。
- `/assets/*`: `public, max-age=31536000, immutable`
- `/manifest.webmanifest`: `public, max-age=3600`
- `/sw.js`: `public, max-age=0, must-revalidate`
- `/`: `public, max-age=300`
- PWA の Service Worker 更新は `registerType: "autoUpdate"` で運用し、更新を自動反映します。

## 主要ファイル

- `app/main.tsx`: ルーティング定義
- `app/page.tsx`: ホーム
- `app/archives/page.tsx`: 過去場所一覧ページ
- `app/banzuke/page.tsx`: 番付ページ
- `app/kimarite/page.tsx`: 全 82 手一覧ページ
- `app/officials/page.tsx`: 行司・呼出の一覧／個別プロフィール
- `app/torikumi/page.tsx`: 取組結果 / 取組予定の月別ハブ
- `app/analytics/page.tsx`: 場所ステータス分析ページ
- `app/rikishi/MyRikishiPage.tsx`: マイ力士ページ
- `app/rikishi/CompareRikishiPage.tsx`: 力士比較ページ
- `app/components/TorikumiDayPage.tsx`: 日別の結果 / 予定ページ
- `app/components/BanzukeTable.tsx`: 番付テーブルコンポーネント
- `app/components/MyRikishiToggle.tsx`: マイ力士登録トグル
- `app/components/ShareCurrentLink.tsx`: 現在の URL をクリップボードへコピー
- `app/components/NewsSection.tsx`: ホームのニュースセクション（相撲協会 + 相撲界ニュースの 2 セクション）
- `app/components/KimariteCard.tsx`: ホームの「決まり手」カード
- `app/components/WebMcpProvider.tsx`: WebMCP ツール登録（`document.modelContext.registerTool` 優先）
- `app/components/PrimaryNavigation.tsx`: プライマリーナビゲーション
- `app/lib/archives-data.ts`: 過去場所データ
- `app/lib/torikumi-routes.ts`: 月キー付き URL とナビゲーション解決
- `app/lib/sumo-data.ts`: 番付データ（力士型定義を含む）
- `app/lib/torikumi-data.ts`: 取組アーカイブデータ
- `app/lib/news-data.ts`: ニュースフィードの静的データ
- `app/lib/kimarite-data.ts`: 決まり手 82 手のマスタ
- `app/lib/official-profile.ts`: 行司・呼出の型、API取得、数値IDパス
- `app/lib/my-rikishi.ts`: マイ力士の登録状態（localStorage 同期）
- `app/lib/basho-status.ts`: 場所ステータス（live / upcoming / final）判定
- `app/lib/webmcp.ts`: WebMCP ツール定義（4 ツール）
- `app/lib/july2026-data.ts`: 七月場所（名古屋）不変スナップショット
- `app/lib/july2026-banzuke-data.ts`: 七月場所番付不変スナップショット
- `app/lib/archive-basho-data.ts`: 過去場所・現行場所の集約データ
- `app/lib/agent-skills.ts`: Agent Skills Index メタデータ
- `scripts/update_sumo_data.py`: 番付・取組・力士プロファイル生成スクリプト
- `scripts/update_news_feed.py`: ニュースフィード生成スクリプト
- `scripts/update_official_profiles.py`: 行司・呼出データ生成スクリプト

## 連絡先

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## ライセンス

MIT

## ダウンロード

- [令和八年七月場所所属力士辞書](https://github.com/dai/shikona)
- [辞書の登録方法はこちら](https://x.com/daisuke/status/2027263585244889097)
