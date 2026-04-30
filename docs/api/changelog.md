# API Changelog

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
