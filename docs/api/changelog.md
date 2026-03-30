# API Changelog

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
