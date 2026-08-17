# API Changelog

## 2026-08-17

### 力士比較と合い口API

- `/compare/` を現役幕内・十両から2人を選ぶ比較画面へ刷新し、四股名・かな・ローマ字・番付検索、URL同期、キーボード操作、指定7項目の比較に対応
- `GET /api/v1/rikishi-matchups.json` を追加。公式プロフィールの場所・日別履歴を改名前後の公式力士IDへ統合し、順序付き一意IDペアと双方の通算勝数を公開
- 全対象プロフィールの取得・ID解決・相互整合が完了した場合だけ合い口JSONを置き換え、部分取得や解析不整合では正常な既存ファイルを保持
- 生成時点の公式履歴では安青錦（4230）対 義ノ富士（4279）は `1-5`。比較列を反転すると `5-1` と表示
- `/.well-known/api-catalog` と日英仕様・README・更新Runbookを新エンドポイントへ同期

### 人物名鑑検索のIME入力修正

- 人物名鑑（力士・行司・呼出）検索と番付検索で、IME 変換中の中間入力を URL クエリへ書き出さない共通フック `useDirectorySearchQuery` を導入
- 履歴の Back / Forward で `q=` と階級・所属部屋・出身地といった補助フィルターが入力欄と URL で一致して復元されるよう挙動を統一
- 力士・行司／呼出・番付の既存 URL フィルターを保ったまま、4 画面の focused / 全テストで型・入出力を検証

### 力士比較の通算成績・通算勝率修正

- 力士プロファイル生成器を旧「通算成績」と現行「生涯戦歴」の双方を解釈するよう拡張（例: `401勝235敗34休` を `401-235-34` として出力）
- 比較画面の勝率計算を「勝敗が決した取組」だけを分母に再定義（休場・不戦敗を分母から除外）
- `/compare/?ids=…` の例: 豊昇龍（3842） `401-235-34 / 63.1%`、大の里（4227） `189-69-26 / 73.3%`
- 現行index外の孤立 detail（例: `4275.json`）は比較画面から参照されないため既存のまま保持

### バナー文言更新（公式ディレクトリリリース告知）

- 日本語バナーを 2026-08-12 の行司・呼出名鑑告知から、公式ディレクトリ公開とそれに伴う discovery サーフェス提供を示す文言へ更新
- 英語バナーは指定がなかったため変更なし

## 2026-08-13

### 七月場所アーカイブと九月引き継ぎ準備

- 確定した七月場所（`202607`）の取組・番付を不変TypeScriptスナップショットとして追加
- 月別HTMLルート、metadata、sitemapを重複なしで維持し、公開v1 JSON APIは七月場所のまま継続
- 九月場所番付の公式公開まで、取組workflowは手動のみ・ニュースworkflowのみ自動実行とする運用へ文書を同期

## 2026-08-12

### 行司・呼出名鑑

- 行司42名・呼出45名の一覧APIと公式数値IDによる個別プロフィールAPIを追加
- 日本相撲協会公式サイトを出典とし、写真・画像フィールドを含めないデータ契約を追加
- `/.well-known/api-catalog` に行司・呼出の一覧APIを追加

## 2026-08-10

### AI Agent 対応 7 項目 — discovery サーフェス再構築

- Agent Skills Index を RFC v0.2.0 形式（`type: "skill-md"` + `digest: "sha256:{hex}"`）へ移行し、`osumo-content` / `osumo-discovery` の 2 件を公開
- MCP Server Card を新スキーマ（`serverInfo.version` が `package.json` と `mcpServerCardPlugin` で同期、`endpoint: null`）で公開
- `/.well-known/openid-configuration` と `/.well-known/oauth-authorization-server` を削除し、`/.well-known/oauth-protected-resource` を `{ resource, resource_documentation }` のみに最小化
- Markdown for Agents をビルド時に事前生成する方式へ統一し、`Link: </index.md>; rel="alternate"; type="text/markdown"` を公開ルートへ付与
- WebMCP を W3C Draft `document.modelContext.registerTool` 優先、`navigator.modelContext.registerTool` フォールバックへ刷新し、4 ツール（`search_rikishi`, `list_basho`, `get_banzuke_for_month`, `get_torikumi_for_day`）を公開
- Web Bot Auth ディレクトリ `/.well-known/http-message-signatures-directory` を公開し、JWKS と RFC 9421 署名を返却
- `public/auth.md` に WorkOS 仕様の `agent_auth` ブロック（`register_uri`, `identity_types_supported: ["anonymous"]`, `anonymous.credential_types_supported: ["none"]`）を追加

## 2026-08-04

### auth.md に agent registration metadata を追加

- `public/auth.md` に匿名・資格情報不要の公開アクセスを登録方式として記述し、scanner 向けの `agent_auth` メタデータを公開
- Protected Resource Metadata / Authorization Server Metadata を公開読み取り専用サービスとして正しく指し示す形へ更新

## 2026-04-30

### 力士画像クレジットと番付反映

- `/rikishi/{id}` の出典欄に、掲載画像が MiniMax I2I Generation で加工したプロフィールイラストである旨を追記
- 番付ページでも `public/images/rikishi/{id}.png` のローカル加工画像を優先表示するように更新
- `docs/api/v1.md` / `README*.md` / `DEVELOPMENT*.md` / `docs/rikishi-profile-refresh-runbook.md` / `public/images/rikishi/README.md` を現行の画像運用に同期

## 2026-04-28

### 力士プロフィールページ

- `/rikishi` と `/rikishi/{id}` の自前プロフィール画面を追加
- 番付ページと取組日別ページから自前プロフィール画面への導線を追加
- `public/api/v1/rikishi/{id}.json` に `name` / `yomi` / `currentRank` / `sourceUrl` / `updatedAt` を後方互換の追加フィールドとして追加
- 場所ごとの力士プロフィール更新 Runbook を `docs/rikishi-profile-refresh-runbook.md` に追加

## 2026-04-28（追記）

### 番付ページのプロフィール導線

- 番付ページの「プロフィール」リンクを `/rikishi/{id}`（o-sumo 内製ページ）に統一
- 日本相撲協会プロフィールへの外部リンクは `/rikishi/{id}` の `sourceUrl` のみで提供

## 2026-04-27

### ドキュメント同期

- `README.md` / `README_en.md` に `/archives` ルートと `rikishi` API エンドポイント（`rikishi.json`, `rikishi/{id}.json`）の案内を追加
- 実装と不一致だった README の記述（`app/rikishi/[id]/page.tsx` 参照、ローカル UI ルートとしての `/rikishi/{id}` 案内）を削除
- `DEVELOPMENT.md` / `DEVELOPMENT_en.md` に `--rikishi-only` / `--profile-limit` を含む更新手順、`/archives` ローカル確認先、`archives` 関連主要ファイルを追記
- `docs/api/v1.md` / `docs/api/v1.en.md` に `GET /api/v1/rikishi.json` と `GET /api/v1/rikishi/{id}.json` の仕様とレスポンス例を追加

## 2026-04-24

### 五月場所更新準備

- 2026年4月27日の五月場所番付発表に向けた手動更新手順を README / 開発ガイド / API ポリシーに追加
- `realtime-torikumi-update.yml` が2026年5月1日まで `workflow_dispatch` のみであることをドキュメントに同期
- 五月場所 pending データの `isoDate` を API 仕様どおり `YYYY-MM-DD` に統一し、`pathDate` は `YYYYMMDD` を維持
- 全ページのヘッダーとフッターにトップページリンクを追加

## 2026-04-14

### 仕様・運用更新

- 五月場所の `pending` 運用を正規化し、`statusMessage` を `結果未更新` / `取組予定未更新` に統一
- 五月場所の日付を 15 日連続（`20260510` - `20260524`）に修正
- 結果更新 workflow（`realtime-torikumi-update.yml`）の cron を再開、日次更新は `workflow_dispatch` 運用を維持
- API ドキュメントの場所名例と pending 説明を現行運用に同期

## 2026-03-30

### 新機能

- 番付ページの力士名クリックで力士詳細ページ `/rikishi/{id}` に遷移
- 力和モダンUIへの刷新：Shippori Minchoフォント導入、カラーパレット刷新

### データモデル拡張

- `Rikishi` インタフェースに以下を追加：`birthDate`, `height`, `weight`, `shusshin`, `debut`, `careerStats`, `photoUrl`
- 新規 `RikishiProfile` インタフェース追加

### Pythonスクリプト更新

- `--rikishi-only` オプション追加：力士プロファイルのみを取得
- `--profile-limit N` オプション追加：取得する力士数を制限（テスト用）

## 2026-03-23

- `README.md` / `README_en.md` を現行のルート設計、更新コマンド、GitHub Actions 運用に合わせて更新
- `DEVELOPMENT.md` を現行の開発コマンド、更新フロー、CI 実態に合わせて更新
- `docs/api/policy.md` の更新時刻を workflow 実装に合わせて修正
- `docs/api/v1.md` の `winner`, `dayHead`, `resultUpdatedAt`, `scheduleUpdatedAt`, `statusMessage` 説明を実データに合わせて更新
- `docs/api/v1.md` のレスポンス例を `public/api/v1/*.json` の現行データに寄せて更新
- `docs/api/v1.en.md` を追加し、API v1 ドキュメントの英語版を公開
- `docs/api/policy.en.md` を追加し、API 運用ポリシーの英語版を公開
- `docs/api/changelog.en.md` を追加し、API 変更履歴の英語版を公開
- `SKILLS.md` に API ドキュメントの日英リンクを追加
- `SKILLS_en.md` を追加し、Skill 一覧の英語版を公開
- `DEVELOPMENT_en.md` を追加し、開発ガイドの英語版を公開
- `README.md` / `README_en.md` の冒頭に日英ドキュメント一覧を追加
- `skills/osumo-api/SKILL.md` と `skills/osumo-api/references/field-map.md` を API v1 の現行仕様に同期

## 2026-03-11

- `docs/api/v1.md` を追加し、`banzuke.json` / `torikumi.json` のフィールド仕様を明文化
- `docs/api/policy.md` を追加し、更新頻度・互換性・廃止方針を明記
- `skills/osumo-api/SKILL.md` を追加し、Codex 向け利用手順を公開
