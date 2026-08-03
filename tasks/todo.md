# o-sumo AIエージェント対応 7項目

> プラン: [C:\Users\dai\.claude\plans\sparkling-snacking-micali.md](../../../../../../Users/dai/.claude/plans/sparkling-snacking-micali.md)
> 方針: 「嘘をつかない・仕様に従う・既存資産を最大活用」の 3 原則

## ① Agent Skills Index（RFC v0.2.0 準拠）

- [x] `app/lib/agent-skills.ts` を `type: 'skill-md'` + `digest: "sha256:{hex}"` に変更
- [x] `public/.well-known/agent-skills/index.json` をビルド後の digest で同期
- [x] `public/.well-known/agent-skills/osumo-content/SKILL.md` frontmatter を `type: skill-md` に
- [x] `public/.well-known/agent-skills/osumo-discovery/SKILL.md` frontmatter を `type: skill-md` に
- [x] `app/lib/agent-skills.test.ts` を新仕様に追随

## ② OAuth / OIDC 削除 + PRM 最小化

- [x] `public/.well-known/openid-configuration` を **削除**
- [x] `public/.well-known/oauth-authorization-server` を **削除**
- [x] `public/.well-known/oauth-protected-resource` を最小化（`resource` のみ）
- [x] `public/_headers` の OAuth ブロックから 2 行を削除
- [x] `public/auth.md` の Endpoint 表から 2 行を削除
- [x] `docs/agent-ready.md` の Discovery surfaces 表から 2 行を削除
- [x] `app/lib/agent-metadata.test.ts`（新規）で PRM を検証

## ③ auth.md

- [x] `agent_auth` 構造体（YAML）を WorkOS 仕様に合わせて追加
- [x] `app/lib/auth-md.test.ts`（新規）で必須キーと空配列を検証

## ④ MCP Server Card

- [x] `public/.well-known/mcp/server-card.json` を新スキーマに更新
- [x] `vite.config.ts` に `mcpServerCardPlugin()` を追加（version 同期）
- [x] `app/lib/mcp-server-card.test.ts`（新規）で version 同期と必須フィールドを検証

## ⑤ Markdown for Agents

- [x] `public/_headers` に `Link: </index.md>; rel="alternate"; type="text/markdown"` を追加
- [x] `scripts/build_markdown_views.ts` から `MARKDOWN_ROUTES` を export
- [x] `scripts/build_markdown_views.test.ts`（既存）を強化

## ⑥ WebMCP

- [x] `app/lib/webmcp.ts` を `document.modelContext.registerTool` に刷新
- [x] `WEBMCP_TOOLS` に `annotations` を追加
- [x] `registerWebMcpTools` を `AbortController` 管理の `{ mode, dispose }` 形に変更
- [x] `app/components/WebMcpProvider.tsx` を **クリーンアップ付き** useEffect に変更
- [x] `app/lib/webmcp.test.ts` を `registerTool` 期待値に追随
- [x] `app/components/WebMcpProvider.test.tsx` を `registerTool` 期待値に追随

## 最終検証

- [x] `npm run typecheck` 緑
- [x] `npm test` 緑（35 files / 242 tests pass）
- [x] `npm run build` 緑
- [ ] isitagentready.com で満点確認（デプロイ後）
- [ ] リリース PR を作成

## レビュー

`npm run build` の結果、`dist/.well-known/` には次の 4 ファイルが揃う：

- `agent-skills/index.json` — `type: "skill-md"` + `digest: "sha256:{hex}"`
- `mcp/server-card.json` — `endpoint: null`、`serverInfo.version` が `package.json` と同期
- `oauth-protected-resource` — `{ resource, resource_documentation }` のみ
- `api-catalog` — RFC 9727 linkset（変更なし）

`openid-configuration` / `oauth-authorization-server` は削除済み（404 になることが正しい状態）。
`public/_headers` の `/` および各 Markdown 対応ルートに `Link: <…/index.md>; rel="alternate"; type="text/markdown"` を追加。
`SKILL.md` 2 本の frontmatter を `type: skill-md` に統一。
WebMCP は `document.modelContext.registerTool` 優先 + `AbortController.signal` 寿命管理、`navigator.modelContext.provideContext` フォールバック維持。
