# 人物名鑑検索のIME入力修正（2026-08-17）

## Plan

- [x] IME変換中の入力値とURL同期を再現する失敗テストを追加する
- [x] ローカルdraftを基準にする共通検索フックを最小実装する
- [x] 力士・行司／呼出・番付検索へ適用し、既存URLフィルターを維持する
- [x] focused test、型チェック、全テスト、ブラウザ実測を行い、Reviewへ証跡を記録する

## Review

- RED: 力士・行司／呼出・番付の各テストで、composition中の途中入力が即座に`?q=`へ書き込まれることを再現し、各suiteが1件ずつ期待どおり失敗した。
- GREEN: ローカルdraft、composition guard、URL復元を`useDirectorySearchQuery`へ集約し、関連4 files / 30 testsが成功した。
- 実ブラウザ: 高速日本語入力を力士・行司・呼出・番付で実行し、入力値とURL queryが4画面すべて完全一致した。CDP実IMEでは`き`→`きむ`→`きむら`の変換中はURL未更新、確定後は入力値・URLとも`木村`、`compositionstart/end`は各1回だった。
- URL復元: `q=豊`から階級をpushし`q=大`へreplaceした後、Backで`q=豊`・階級all、Forwardで`q=大`・階級juryoへ入力欄とURLが一致して復元された。
- 完全検証: `npm run typecheck`、`npm test`（48 files / 335 tests）、`npm run build`、`git diff --check`がすべてexit 0。buildの既存archive chunk警告とBrowserslist更新警告のみ。
- 独立レビュー: 重大な指摘なし。実IMEと戻る・進むの実測を追加確認した。非IME入力のdebounceは今回の根因修正に不要なためスコープ外とした。

---

# 七月場所アーカイブ化と九月引き継ぎ準備（2026-08-13）

## Plan

- [x] 現行七月データと既存五月スナップショット契約を確認し、月解決・順序・route/metadata/sitemap互換性の回帰テストをREDで記録する
- [x] 七月の不変TypeScriptスナップショットを追加し、明示的な月解決、PAST_BASHO、重複しないroute設定へ最小実装する
- [x] plan.mdと日英の運用ドキュメントを九月番付公式発表待ちの状態に同期し、指定のPython/Vitest/型チェック/ビルド/diff検証を通す
- [x] 差分を自己レビューし、Reviewへ検証証跡を追記してコミットとtask reportを作成する

## Progress

- [x] task-1-brief.md、tasks/lessons.md、既存のarchive実装とルート/sitemap構成を確認した

## Review

- RED: `npm test -- app/lib/july2026-archive.test.ts` は新しい七月スナップショットmoduleを解決できず失敗した。bundle重複を防ぐ同一参照の回帰も、別インスタンスであるため期待どおりREDだった。
- GREEN: 七月スナップショット、明示的月解決、PAST_BASHO、重複しないroute設定を実装後、focused回帰は5 tests、関連route/sitemap/metadataは57 testsが成功した。
- 完全検証: `python scripts/update_sumo_data_parser_test.py`、`python scripts/update_sumo_data_torikumi_logic_test.py`、`npm run typecheck`、`npm test`（42 files / 313 tests）、`npm run build`、`git diff --check` がすべてexit 0。buildはPWA precacheまで生成した。
- 差分レビュー: currentデータは七月スナップショットへの参照に集約し、巨大データの二重bundleを除去した。月別JSON endpoint・`202609` route・pendingデータ・workflow scheduleは追加していない。
- コントローラ実測: Python 40 tests、Vitest 43 files / 315 tests、typecheck、build（July専用chunk 444.98 kB / main 1,345.40 kB）、`git diff --check` が成功。Wrangler delivery reportはBASE/LOCAL routing・metadata・sitemapすべてOK、`banzuke.json` / `torikumi.json` は200 `application/json`、独立レビューはspec/qualityともPASS。

## 独立レビュー修正 round 1

- [x] currentとの同一参照ではなく、七月snapshot自体の月・15日・公開状態・番付人数を回帰テストで固定する
- [x] 七月snapshotを専用Rollup chunkへ分離するVite設定をREDから追加し、将来のcurrent実体と同一entryへ結合しないことを検証する
- [x] API v1日英ドキュメントのtorikumi専用フィールドと番付例の更新時刻を実JSONへ同期する
- [x] focused/full tests、typecheck、build、diff check、self-review、追加commitとreport追記を完了する

---

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
- [x] isitagentready.com で満点確認（デプロイ後）
- [x] リリース PR を作成

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

# 行司・呼出名鑑 公式データ再実装（2026-08-12）

詳細計画: `tasks/plans/2026-08-12-gyoji-yobidashi-refresh.md`

## Plan

- [x] 公式HTMLパーサーをテスト先行で実装し、行司42名・呼出45名の一覧／個別JSONを生成する
- [x] 公式数値ID、日英階級表示、メタデータ、sitemapへUIとAPI型を接続する
  - [x] UI/API helper、動的metadata、sitemap入力検証、redirectのfocused testを先に追加し、期待したREDを確認する
  - [x] 数値ID契約、日英階級、取得情報、写真不使用UI、not-found、人物metadataを最小実装する
  - [x] build時に一覧と個別JSONの存在・kind・ID一致を検証してからsitemapを生成する
  - [x] focused testをGREENにし、typecheck、全test、build、diff checkを通す
  - [x] Task 2の検証結果とセルフレビューをreportへ記録し、変更をcommitする
- [x] 更新runbookを追加し、全テスト・型チェック・ビルド・HTTP配信を検証する
- [x] 独立レビューを通し、コミット・push・PRを作成する

### トップバナー更新

- [x] 行司名鑑・呼出名鑑とAPI公開の告知へ日英バナーを更新する
- [x] バナー文言の回帰テスト、型チェック、全テスト、ビルドを通す
- [x] 検証結果を記録し、PR #415へpushする

### マージ前ドキュメント・リポジトリ整理

- [x] README.md / README_en.mdを行司・呼出の画面、API、更新手順へ同期する
- [x] 公開APIカタログをREADMEのAPI一覧と一致させる
- [x] 一時・生成・内部レビュー成果物を軽く監査し、明白な不要物だけ除外する
- [x] 型チェック、全テスト、ビルド、diff checkを通してPR #415へpushする

### Final fix wave（2026-08-12）

- [x] 現行公式HTMLと同じ `<br>` 後の改行・空白を含むsanitized fixtureで生成器をREDにし、階級と読みの間だけ任意空白を許容しつつ一覧・詳細の氏名／読み／階級完全一致を維持する
- [x] profile helperで無効IDとHTTP 404だけをnot-foundにし、network／5xx／JSON・rankCode不正は運用エラーとして再throwする回帰テストをREDからGREENにする
- [x] profile取得stateを `{kind,id}` に結び付け、同期request-key遷移中はloading、旧profile・旧metadataなしとなるUI／metadata回帰テストをREDからGREENにする
- [x] 全17値から導出した `OfficialRankCode` unionとruntime setをUI取得検証・sitemap build検証で共有し、不正rankCodeを拒否する
- [x] rikishi／official sitemapの正ID・重複検証をlabel付き共通helperへ集約し、両方でpositive safe integerを要求する
- [x] runbookのPowerShell整合性検査を件数不一致・重複ID・非正数／非safe integer・kind／ID不一致・画像fieldでthrowするfail-fast手順にし、slashless `/yobidashi` と `/yobidashi/1935` を追加する
- [x] focused Python／Vitest、live 87件生成とretrievedAt以外の差分確認・snapshot復元、typecheck、全test、build、JSON／sitemap／Pages HTTP、`git diff --check` を実行する
- [x] Final fix reportとこのReviewへRED/GREEN・live生成・全検証結果を記録し、修正をcommitする（pushしない）

## Review

- 実装完了後にコマンド結果、生成件数、代表プロフィール、配信確認結果を記録する。
- Task 1: `python scripts/update_official_profiles_test.py` はfixture取得の生成・不一致時の全出力未更新を確認して緑。公式HTMLから行司42名、呼出45名を取得し、数値IDの個別JSONと一覧JSONを生成、文字列slugの旧JSONを削除した。
- Task 2: focused Vitestは6 files / 66 tests、全Vitestは40 files / 289 tests、`npm run typecheck`、`npm run build`、`git diff --check`が緑。build後sitemapは行司42件・呼出45件の数値ID詳細URLと両一覧URLを含む。
- Task 2: 一覧と個別JSONのID重複・非正数、個別JSON欠落、kind不一致、ID不一致を検証し、不整合時はbuildを失敗させる。生成器と生成済みJSONは変更していない。
- Task 2 review fix round 2: 一覧取得状態を取得時のkindへ結び付け、effect実行前の同期遷移でも旧行・旧出典・旧取得日時を表示しない回帰テストを追加した。
- Task 3: `docs/official-profile-refresh-runbook.md` に、公式数値ID、画像非使用、生成・差分・JSON整合・sitemap・Pages配信の手順を記録した。現行HEADで `python scripts/update_official_profiles_test.py`（7 tests）、focused Vitest（6 files / 74 tests）、`npm run typecheck`、`npm test`（40 files / 297 tests）、`npm run build` を再実行して緑。JSONは行司42件・呼出45件、個別JSONも同数、正の数値ID、画像系フィールド0件で整合した。`dist/sitemap.xml` は両一覧と87詳細URLを含む。`wrangler pages dev dist` 実測では一覧・代表詳細の末尾スラッシュ付きURLが200、なしURLが正しい301 Location、4 JSON APIが200 application/jsonだった。ブラウザで行司一覧と木村庄之助（1986）の詳細を確認し、公式出典、取得日時、写真不使用、数値ID URLの表示を確認した。
- Final fix wave: 現行公式HTMLの `<br>` 後の改行・空白をfixtureへ反映すると、Python suiteは見出し不正を起点に3 failures / 3 errorsでREDになった。階級と読みの間だけ `\s*` を許容した後は7 testsがGREENで、氏名・階級・読みの完全一致判定は維持した。
- Final fix wave: helper／UI／sitemapのproduction変更前focused Vitestは8 tests failed。network／500がnot-foundになる、同期request-key commitで旧詳細が残る、unsafe rikishi IDと未知rankCodeが受理されることを再現した。identity mismatchもinvalid payloadとして1 testのREDを追加した。
- Final fix wave: live生成は `gyoji=42 yobidashi=45`。index 2件とdetail 87件の計89 JSONをHEADと構造比較し、`retrievedAt: 2026-08-12T02:01:21Z` 以外の差分は0件だった。証明後は生成snapshotをHEADへ復元し、timestamp-only差分をcommit対象から除外した。
- Final fix wave: final verificationはPython 7 tests、focused Vitest 6 files / 83 tests、typecheck、full Vitest 40 files / 306 tests、build 135 modulesがすべてexit 0。生成JSONは行司42/42・呼出45/45、safe unique ID、kind/ID、17 rankCode、画像field 0件、sitemap詳細42/45件が一致した。
- Final fix wave: runbook整合性コマンドは正常snapshotでexit 0、`UniqueIds=False` の検査結果で `Official profile integrity check failed: gyoji` をthrowしてexit 1。Wrangler Pagesは両一覧・代表詳細が200、slashless 4 URLが対応する末尾スラッシュURLへ301、4 JSON APIが200 `application/json`だった。
- 独立レビューでCritical／Important指摘0件、merge可能判定を確認した。`feat-gyoji` をpushし、draft PR #415を作成した。
- トップバナー: 日本語を指定文言へ更新し、英語も同内容の告知へ更新した。focused test 2件、typecheck、全Vitest 41 files / 308 tests、build 135 modules、`git diff --check` がすべてexit 0。生成済みbundleに新文言が含まれ、旧七月場所文言が残っていないことを確認した。
- マージ前同期: README日英へ行司・呼出の画面、API、公式出典、写真不使用、更新コマンドを追加し、Node要件とworkflow名の既存誤記を修正した。API仕様・変更履歴・APIカタログも新しい一覧／個別APIへ同期した。
- リポジトリ軽量監査: 追跡済みの一時・ログ・ビルド出力、空ファイル、5 MiB超のファイル、疑わしいバックアップ名は0件。生成JSONとHTML fixtureは配信・テストに必要なため保持し、実装から参照されない内部SDD report 4件だけをPR差分から削除した。Python 7 tests、focused Vitest 9 tests、typecheck、全Vitest 41 files / 308 tests、build 135 modules、`git diff --check` はすべてexit 0。

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
- [x] デプロイ後に isitagentready.com の Auth.md 項目と総合100点を再スキャンする

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
- Production scan: isitagentready.com の Auth.md 項目を含む対象チェックが通過し、コマース以外で総合100点を確認した。
# 全ページ更新日時の再チェック（2026-08-17）

詳細計画: `docs/superpowers/plans/2026-08-17-update-timestamp-synchronization-audit.md`

## Plan

- [ ] 生成データと月別 snapshot の更新日時契約をテストで固定する
- [ ] 番付生成を結果更新日時へ連動させ、取組三日時の CI 検証を追加する
- [ ] 現行・archive・人物名鑑の各画面で表示値を厳密に検証する
- [ ] News・Archives・Kimarite の「更新日時を表示しない」仕様を固定する
- [ ] 全テスト・build・Markdown・Wrangler route matrix を検証し PR #434 へ積む

## Review

- 実装後に source別の期待日時、画面の実測値、検証コマンド結果を記録する。

---
# 力士比較の通算成績・通算勝率修正（2026-08-17）

## Plan

- [x] 現行公式HTMLの「生涯戦歴」を再現する生成器テストをREDにする
- [x] 比較画面で休場を勝率分母に含めない表示テストをREDにする
- [x] 生成器と勝率計算を最小修正し、focused testsをGREENにする
- [x] 力士プロフィール全件を再生成し、通算成績ゼロ件と代表値を検証する
- [x] 型チェック、全テスト、build、diff check、画面実測を行う

## Review

- RED: 現行公式HTMLの `<dt>生涯戦歴</dt><dd>401勝235敗34休（51場所）</dd>` に対して生成器は `0勝0敗0休`、比較画面は休場込みで豊昇龍 `59.9%`、テストfixtureの大の里 `75.0%` を返し、Python 1件・Vitest 1件が期待どおり失敗した。
- GREEN: 生成器は旧「通算成績」と現行「生涯戦歴」をともに認識し、勝率は勝敗が決した取組だけを分母にした。focused Python 41 tests、比較画面 3 testsが成功した。
- live生成: `python scripts/update_sumo_data.py --rikishi-only` で現行index 70名を取得し、通算成績ゼロ件は0。豊昇龍 `401-235-34`、大の里 `189-69-26`。通算成績・updatedAt以外の差分は、誕生日を迎えた5名の年齢更新だけだった。
- 完全検証: `npm run typecheck`、全Vitest 48 files / 336 tests、Python 41 tests、`npm run build`、`git diff --check` がすべてexit 0。buildの既存chunk size警告とBrowserslist更新警告のみ。
- 実ブラウザ: `/compare/?ids=3842,4227` で豊昇龍 `401-235-34 / 63.1%`、大の里 `189-69-26 / 73.3%` を確認した。
- 独立レビュー: 重大・重要な指摘0件。現行index外の孤立detail `4275.json` は比較画面から参照されないため既存のまま保持し、今回の全件保証は現行index掲載70名を対象とする。

---

# 20260817 バナー文言更新

## Plan

- [x] 日本語バナーの指定文言を回帰テストでREDにする
- [x] 日本語ロケールを指定文言へ更新する
- [x] focused test、typecheck、全テスト、build、diff checkを通してPR #434へpushする

## Review

- RED: 指定文言を期待するfocused testが旧 `20260812` 文言を受け取り、1件失敗した。
- GREEN: 日本語ロケールを指定どおり更新し、focused 2 testsが成功した。英語文言は指定がないため変更していない。
- 完全検証: `npm run typecheck`、全Vitest 48 files / 336 tests、`npm run build`、`git diff --check` がすべてexit 0。buildの既存chunk size警告とBrowserslist更新警告のみ。

---

# 力士比較ページ刷新（2026-08-17）

詳細設計: `docs/superpowers/specs/2026-08-17-rikishi-comparison-refresh-design.md`

実装計画: `docs/superpowers/plans/2026-08-17-rikishi-comparison-refresh.md`

## Plan

- [x] 公式プロフィール履歴を改名前後の力士IDへ統合し、検証済み合い口JSONを生成する
- [ ] 比較画面を2つのcomboboxと指定7項目の2人比較表へ刷新する
- [ ] API／README／catalogを同期し、全テスト・実ブラウザ・Wrangler配信を検証する

## Review

- 実装後にRED／GREEN、代表合い口、全検証コマンド、ブラウザ／配信実測を記録する。

---
