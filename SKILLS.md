# o-sumo Skills

[English Version](./SKILLS_en.md)

このリポジトリで公開している Skill 一覧です。Agent Skills Discovery RFC v0.2.0 形式で `public/.well-known/agent-skills/` 配下に SKILL.md を配布し、ビルド時に `agentSkillsPlugin` が `index.json` を生成します。

## 配布中の Skill

現在 `public/.well-known/agent-skills/` 配下に公開している SKILL.md は次の 2 件です。

### `osumo-content`

- 場所: `public/.well-known/agent-skills/osumo-content/SKILL.md`
- 目的: 大相撲の番付・取組・力士・行司・呼出の公開データへエージェントがアクセスするためのコンテンツ系の取り決め
- 主な対象:
  - 力士・行司・呼出の個別プロフィール
  - 番付 / 取組結果 / 取組予定 / 過去場所
  - 公開ルール（出典・更新時刻・写真不使用）

### `osumo-discovery`

- 場所: `public/.well-known/agent-skills/osumo-discovery/SKILL.md`
- 目的: discovery サーフェス（`api-catalog`, `mcp-server-card`, `agent-skills`, `web-bot-auth` など）の読み方と参照先
- 主な対象:
  - `public/.well-known/api-catalog`（RFC 9727 linkset）
  - `public/.well-known/mcp/server-card.json`（SEP-1649）
  - `public/.well-known/agent-skills/index.json`（RFC v0.2.0）
  - `public/.well-known/http-message-signatures-directory`（Web Bot Auth）
  - `auth.md`（エージェント登録なしの公開読み取り専用）

新しい Skill を追加する場合は `public/.well-known/agent-skills/<skill>/SKILL.md` を追加するだけで、index.json はビルド時に自動更新されます。

## 内部 Skill

リポジトリ内部で開発時に参照する Skill も公開しています。

### `osumo-api`

- 場所: `skills/osumo-api/SKILL.md`
- 目的: o-sumo 公開 API（`/api/v1/banzuke.json`, `/api/v1/torikumi.json`）の取得・解析・実装時のガイド
- 主な対象:
  - 番付データの利用
  - 15日分の取組結果/予定の利用
  - `pending` 日の扱い

フィールド詳細は `skills/osumo-api/references/field-map.md` を参照してください。

関連 API ドキュメント:

- 日本語仕様: `docs/api/v1.md`
- English spec: `docs/api/v1.en.md`
- 日本語ポリシー: `docs/api/policy.md`
- English policy: `docs/api/policy.en.md`
- 日本語変更履歴: `docs/api/changelog.md`
- English changelog: `docs/api/changelog.en.md`
- AI Agent 対応サマリー: `docs/agent-ready.md`
- A2A Agent Card: `docs/agent-card.md`
- 行司・呼出更新手順: `docs/official-profile-refresh-runbook.md`
