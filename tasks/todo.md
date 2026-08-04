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

---

# Auth.md agent registration metadata（2026-08-04）

## Scope

- 最新 `origin/main` に既存の `/auth.md`、`/.well-known/oauth-protected-resource`、`/.well-known/oauth-authorization-server` を再利用する。
- o-sumo は公開・読み取り専用であり、ユーザーアカウント、OAuth token、API key、claim、revocation を提供しない。この制約を変えず、匿名・資格情報不要の公開アクセスを登録方式として正確に記述する。
- scanner 対策のために、存在しない token endpoint、API key、claim/revocation 処理を捏造しない。

## Plan

- [x] 指定された Auth.md skill を全文確認し、必須フィールドと方式別要件を整理する
- [x] 最新 `origin/main` とローカル `main` を同期し、専用 branch / worktree を作成する
- [x] 現行の Auth.md、Protected Resource Metadata、Authorization Server Metadata、配信 header、テストを確認して失敗原因を特定する
- [x] `agent_auth` を URL と配列を用いた匿名・資格情報不要の公開アクセス方式へ変更し、`register_uri`、`identity_types_supported`、`anonymous.credential_types_supported` を scanner が解釈できる形にする
- [x] `/auth.md` に discovery、匿名アクセス開始、資格情報不要、claim/revocation 非該当、公開 API 利用手順を一貫した内容で記述する
- [x] `app/lib/auth-md.test.ts` と `app/lib/agent-metadata.test.ts` を placeholder 文字列の存在確認から、JSON/YAML の有効な型・URL・相互参照を検証する回帰テストへ更新する
- [x] focused tests、typecheck、全テスト、build、`git diff --check` を実行する
- [x] `dist` を `wrangler pages dev` で配信し、GET / HEAD の status、Content-Type、metadata の相互参照を実測する
- [ ] デプロイ後に isitagentready.com の Auth.md 項目と総合100点を再スキャンする

## Acceptance

- `/auth.md` は H1 に `auth.md` を含み、匿名の公開アクセスに登録・資格情報・claim・revocation が不要であることを手順として説明する。
- Protected Resource Metadata は `resource`、`authorization_servers`、`scopes_supported`、`bearer_methods_supported: ["header"]` を維持する。
- Authorization Server Metadata の `issuer` は PRM の `authorization_servers` と一致し、`agent_auth.skill` は `/auth.md` を指す。
- `agent_auth.register_uri` は有効な HTTPS URL、`identity_types_supported` は `anonymous` を含む配列、匿名方式の credential type は資格情報不要を表す配列として公開する。
- 実装していない token、claim、revocation、identity assertion の endpoint や credential を広告しない。
- build 後の3公開面がローカル Cloudflare Pages runtime で GET / HEAD 200 と正しい Content-Type を返す。

## Progress

- primary checkout `C:\dai\GitHub\o-sumo` は `codex/07-22` 上で未追跡 `.github/github-app.yml` があるため変更していない。
- `origin/main` とローカル `main` を `0d29be117f34de965be73045566bf719800c83e2` に同期した。
- branch `codex/auth-md-agent-registration` と worktree `C:\Users\dai\.codex\worktrees\auth-md-agent-registration\o-sumo` を作成した。
- 現行失敗原因は `register_uri`、`identity_types_supported`、credential fields が URL / 配列ではなく `"not applicable"` 文字列で、完全な登録方式として検出されないこと。
- ユーザー確認により、実認証基盤ではなく scanner 向け metadata-only 対応を選択した。JSON と Auth.md の双方に、account、credential、claim、server-side state を作らないことを明記した。
- `public/_headers` の `/auth.md` 個別 rule を削除し、既存 `/*.md` rule に集約して重複 Content-Type を解消した。

## Review

- TDD RED: focused tests は placeholder metadata により 2 files / 3 tests failed。実装後は 2 files / 8 tests pass。
- Static checks: `npm run typecheck` pass。独立した lint script / ESLint dependency はないため、TypeScript と `git diff --check` を lint 相当として実行した。
- Full tests: 35 files / 243 tests pass。
- Build: `npm run build` pass。既存の 500 kB 超 chunk warning と browsers data warning のみ。
- Wrangler HTTP: `/auth.md`、`/.well-known/oauth-protected-resource`、`/.well-known/oauth-authorization-server` の GET / HEAD はすべて 200。Content-Type は Markdown 1件、JSON 2件とも単一かつ正しい値。
- Wrangler content contract: Auth.md の H1 / credential metadata、Authorization Server Metadata の `register_uri` / `anonymous.credential_types_supported` を実レスポンスで確認し、`WRANGLER_AUTH_MD=OK`。
- Independent review: metadata-only が実 credential 発行ではない点を明示し、YAML fence内の完全一致検証と重複 header 除去を追加した。
