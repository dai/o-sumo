# Lessons

## 2026-08-17 現役力士の改名履歴と同名の別人を混同しない

- 四股名履歴のglobal aliasだけで対戦相手を現役IDへ解決すると、現役力士が後年使った旧名と、それ以前の同名の引退力士を誤って同一視する。active ownershipは同じ場所の`shikonaByPlace`でも一致する場合だけ確定する。
- 現役同士として解決した取組は、canonical化後に双方のプロフィール観測が揃うことを必須にする。未解決active alias、片側観測、矛盾のいずれかがあれば、生成済みendpointを置換しない。
- same-place ownershipがないだけではinactiveと断定しない。同場所で別名が明示されているか、対象場所が公式初土俵より前の場合だけ同名の別人として除外し、それ以外はpartial profile historyとして失敗させる。

## 2026-08-17 URL同期検索と日本語IME

- controlled inputの表示値をURL queryだけから読むと、各入力のnavigationでIMEのcomposition範囲が解除され、ローマ字とかなの連結や文字欠落が起きる。
- 入力欄はローカルdraftを唯一の表示値にし、composition中はURLを更新せず、`compositionend`で確定値を同期する。URLは共有・復元用の二次状態として扱う。
- 回帰確認はjsdomの完成済み文字列だけで終えず、Playwright/CDPの`Input.imeSetComposition`で変換途中の値、URL未更新、composition回数、確定後の入力値とURLを実測する。

## 2026-08-17 比較URL・IME commit・API検証

- URLから復元する選択をpassive effectだけでstateへ同期すると、外部navigation後の最初のcommitに旧selectorや旧tableが残る。描画時はURL遷移を同期的に判定し、URL由来のrequest keyと選択で古い表示をゲートする。
- `aria-expanded="true"`のcomboboxは、候補0件でも`aria-controls`先のlistboxをDOMに保つ。ゼロ件文言は選択不可のoptionとして、IDREFとpopupの意味を壊さない。
- 選択済みcomboboxのIME draftはcomposition中でも最初のcommitから旧選択名と不一致になる。URL更新をcompositionendまで待つ場合も、render時のdraft不一致で旧request key・比較表・profile値を同期的に隠す。
- 1 IDのURLがslot位置を表現できないため、slot 1を空のまま確定した場合は残存選択をslot 1へ詰める。ただし非空draftで置換中は、focus中の入力と候補操作を同じslotに保持し、URLだけを一時的にcompactする。URL正規化でキーボード操作の対象slotを入れ替えない。
- 置換draftによって選択IDを先に外した後、draftを空へ戻す経路もclear確定として扱う。handler分岐は現在のslot IDだけでなく、反対slotに残る選択とdraft値の組み合わせまで回帰テストする。
- IME composition中の空値は確定clearではない。空draftのcompact条件も`composing`でゲートし、compositionend後だけ選択位置を確定する。
- React RouterのURL更新はtransitionになるため、own-writeの目標URLを「描画済みURL」として先に記録しない。Router contextが追いつくまではローカル選択を描画し、外部navigationだけをURL由来stateで同期ゲートする。
- API文書がISO 8601日時を約束するフィールドは、単なる`string`判定で受理しない。レスポンス境界で形式・実在日・parse可能性を検証し、任意文字列を取得失敗として扱う。

## 2026-08-12 React一覧の種別切替で旧データを表示しない

- `useEffect`内で旧一覧を空にするだけでは、propやrouteが変わった直後のcommitに間に合わず、旧項目を新しい種別のURLへ再リンクして表示することがある。
- 非同期取得状態には、その結果を取得したrequest key（今回は`kind`）を保持する。描画時に現在のkeyと一致する結果だけを使い、不一致ならeffectの実行順に依存せずloadingとして扱う。
- 回帰テストは次のfetchを未解決にし、`flushSync`で種別変更をcommitしたcallback内で、旧行・旧出典・旧取得日時が消えていることを同期的に検証する。

## 2026-08-04 GitHub README の外部埋め込み

- GitHub README では外部 JavaScript が実行されないため、X の公式 `<blockquote>` + `<script>` embed は使用しない。投稿画像を通常の Markdown image として表示し、画像全体を投稿 URL へのリンクにする。
- README の表示変更は、HTML snippet の文字列一致だけで完了とせず、GitHub Markdown の制約を確認して実際の表示形を検証する。

## 2026-08-03 AI Agent Readiness 7 項目

### 1. jsdom テストで `document` を **全体置換** すると DOM API が壊れる

`Object.defineProperty(globalThis, 'document', { value: { modelContext: ... } })` のように `document` 自体を差し替えると、`@testing-library/react` の `render()` が `document.body.appendChild(...)` で失敗する。

**Why**: jsdom 環境では `globalThis.document` が jsdom の Document インスタンスで、`body` などの DOM API を持つ。`document` 全体を `{ modelContext }` だけに置き換えると DOM API が消える。

**How to apply**: テストでは `Object.defineProperty(document, 'modelContext', { value: ..., configurable: true })` で `modelContext` プロパティだけを extend する。`document` 全体は絶対に置き換えない。

### 2. Vitest の `toMatch` の正規表現はフェンス済みコードの取り扱いに注意

`^```yaml\n[\s\S]*?\n```$/m` のような行頭・行末を含む正規表現は、`[\s\S]*?` の lazy quantifier が Markdown ファイル全体の fences ブロックを巻き込んで想定外のマッチをする場合がある。

**Why**: lazy quantifier `[\s\S]*?` は最短マッチで `\n```` の直前の改行を探そうとするが、Markdown ファイル全体の中で別の fences ブロックに当たってバックトラックが多発する。

**How to apply**: フェンス済みコードブロックの検証は `toContain('```yaml')` と `lastIndexOf('```') > indexOf('```yaml')` の文字列マッチで組み立てる。複雑な regex を使い回さない。

### 3. Cloudflare Pages の Markdown-for-Agents は **Pro 以上必須**

`curl -H 'Accept: text/markdown'` で HTML→MD 自動変換する機能は **Free プランでは使えない**。事前生成 `dist/<route>/index.md` 方式を採用するなら、Cloudflare プランに縛られず常に Markdown を返せる。

**Why**: Cloudflare の公式ドキュメントに "Pro / Business / Enterprise" 限定と明記されている。

**How to apply**: 事前に `wrangler` 依存があっても `wrangler.toml` がなくて `functions/` もないプロジェクトでは Cloudflare Pages 静的配信が基本。Markdown 配信は事前生成方式で構築する。

### 4. WebMCP の API 名前空間は **`document.modelContext` (W3C Draft) と `navigator.modelContext` (legacy)**

isitagentready.com の SKILL.md と初期 Chrome 実装は `navigator.modelContext.provideContext` を使っているが、W3C Community Group Draft (2026-07-28) は `document.modelContext.registerTool` に名称変更済み。

**Why**: `navigator.modelContext.provideContext` は単一の関数を呼ぶ旧 API。W3C Draft は `document.modelContext.registerTool(tool, { signal })` でツールごとに登録し、`AbortSignal` で寿命管理する。

**How to apply**: 両方を特徴検出して対応する。`document.modelContext.registerTool` を優先し、無ければ `navigator.modelContext.provideContext` にフォールバック。`AbortController` を 1 個作って共通の `signal` を全ツールに渡し、SPA 遷移時に `controller.abort()` で解除する。

### 5. RFC 9728 §3.2 "Parameters with zero values MUST be omitted"

OAuth Protected Resource Metadata で `authorization_servers: []` のような空配列を残すと、RFC 仕様違反になる。

**Why**: RFC 9728 §3.2 は明確で、zero values は省略必須。

**How to apply**: 「OAuth を提供しない」サイトを表現するなら、空配列を `[]` で残さない。認証メタデータ内の `agent_auth` 宣言へ discovery client を案内する必要がある場合だけ実在する issuer を指定し、`scopes_supported: ["public"]` や Bearer 対応のような未実装機能は宣言しない。`auth.md` 側でもトークンや認可フローを提供しないことを明示する。

### 6. Agent Skills Index の digest 形式は `sha256:` プレフィックス必須

Cloudflare Agent Skills Discovery RFC v0.2.0 は `digest: "sha256:{64-hex}"` 形式を要求する。プレフィックスなしの `sha256` キーだけだと RFC 違反。

**Why**: Cloudflare スキーマで `digest` フィールドの `pattern` が `^sha256:[0-9a-f]{64}$` を要求。

**How to apply**: `app/lib/agent-skills.ts` の `computeSha256` は hex のみ返すので、`buildSkillEntry` 内で `sha256:` プレフィックスを付与する。テストも `/^sha256:[0-9a-f]{64}$/` 形式に追随させる。

### 7. `public/.well-known/agent-skills/index.json` はビルド時に **再生成** される

`vite.config.ts` の `agentSkillsPlugin` が `closeBundle` で `dist/.well-known/agent-skills/index.json` を上書きする。`public/` 配下のファイルは **dev モードでしか直接配信されない**。

**Why**: `vite build` で `dist/` を一旦空にしてから書き直すので、`public/` の古い digest は本番には反映されない。

**How to apply**: dev モードでも正しい digest を返すために、ビルド後に `public/.well-known/agent-skills/index.json` を `dist/.well-known/agent-skills/index.json` で上書きする。SKILL.md の frontmatter 変更で digest 値が変わるので、ビルド → 上書きコピーを 1 セットで行う。

### 8. MCP Server Card の `serverInfo.version` は **package.json から同期** する

手書きの `version: "0.0.0"` のようなフィールドは徐々に drift する。ビルド plugin で `package.json` の version を読み、必ず同期する形にする。

**Why**: MCP Server Card (SEP-1649) は `serverInfo.version` を必須フィールドとして要求する。リリース毎に手動更新するのは忘れる。

**How to apply**: `vite.config.ts` に `mcpServerCardPlugin()` を追加し、`closeBundle` で `app/lib/mcp-server-card.ts:readPackageVersion()` から version を取得してカードを上書きする。テンプレート `public/.well-known/mcp/server-card.json` には version 固定値を入れないか、`<package.json>` プレースホルダにしておく。

## 2026-07-08 時刻依存 UI テストの固定化
- `new Date()` や JST 現在時刻からリンク先・表示位置を決める UI のテストでは、期待値を固定する前に `vi.useFakeTimers()` と `vi.setSystemTime(...)` で時計を固定する。実行時刻に依存した期待値は、ローカル実行時間や CI 時刻で不安定になる。

## 2026-06-29 七月場所着手準備（mixed current/archive 化）
- 場所切替は **current（七月）と archive（五月・三月）が同じデータ層で共存できる形** で導入する。`app/lib/archive-basho-data.ts` を **current/archive の単一エントリポイント** に据えると、`torikumi-routes.ts` / `archives-data.ts` / `main.tsx` の重複定義（`MAY2026_*` 直接 import など）が消えて回帰しづらくなる。
- `resultDays` と `scheduleDays` を **別 monthKey で持つ mixed current/archive 仕様** は、初日の前日〜初日（七月と五月の境界）をまたぐ導線で「五月アーカイブの結果」と「七月場所の予定」を同時に見せられる。`json` レベルで `bashoName = 七月場所 / pathDate = 20260510（五月アーカイブ結果）/ pathDate = 20260712（七月予定）` が混在し得ることを CI レビューで許容する。
- 五月場所を archive 化するには、`torikumi-data.ts` / `sumo-data.ts` の **五月相当を static snapshot としてコピー**（`may2026-data.ts` / `may2026-banzuke-data.ts`）する必要がある。`CURRENT_BANZUKE_DATA` は引き続き `torikumiArchive` / `makuuchiData` を参照し、archive 側は snapshot を直接参照する。
- `app/page.tsx` の championship-table（最終結果セクション）は **`PAST_BASHO[0]` 駆動の動的構成** へ寄せておくと、次の場所で chipship / 三賞を更新するときに手書きのハードコードを増やさずに済む。
- ドキュメント同期は「README」「DEVELOPMENT（ja/en）」「API policy（ja/en）」「rikishi-profile-refresh-runbook」の 4 系統を必ず同時に更新する。手順の日付（例: `2026年4月27日`）と route 例（`/202605-...`）は1セットで残るので、片方だけ更新すると「手順の Route 例が古い」状態になる。
- workflow 自動実行停止期間（2026-07-01 JST まで）の間は `daily-data-update.yml` / `realtime-torikumi-update.yml` の `schedule:` ブロックを **あえて残さない**。早期復活させると CI runner によっては意図しない実行が始まる。`workflow_dispatch` のみを維持する運用が安全。

## 2026-06-29 末尾スラッシュ正規化（配信ルーティング課題）
- Cloudflare Pages の `_redirects` で **末尾スラッシュなし静的パスを `index.html 200` で直接受けていた**場合、本番側で 308 → `/` に吸収されてアプリに到達できない事例がある（`/archives`、`/*-yotei`、`/*-o-sumo` で再現）。
- 修正は **`/archives /archives/ 301` のように末尾スラッシュ付き URL への 301 を明示する**こと。`/archives/` 側は `index.html 200` の SPA fallback に任せる。
- splat を含むパターンは **`/:slug-torikumi /:slug-torikumi/ 301` のように splat 名を両辺で一致** させないと Cloudflare 評価器が認識しない。`*` ワイルドカードと `:slug` の混在は冗長・予期しない評価順の原因になるため、どちらかに統一する。
- 修正後は必ず `pwsh ./scripts/verify_delivery_flow.ps1` を再走させ、`ROUTING_BEHAVIOR=OK` を確認する。`DATA_SYNC=OK` だけでは「データ欠損」が無いことは示せるが、ルーティング修復は別判定。

## 2026-06-29 worktree での再検証
- 七月場所準備コミットが既存 worktree に既に入っている状態で「把握」を依頼されたときは、まず `git status` / `git log` で HEAD を確認してから新規着手範囲を判断する。プラン文書をゼロから書くと既存コミットと重複して二重コミットになる危険がある。
- worktree 内には `.claude/skills/impeccable/` が checkout されないことがある。デザイン lint は **メインリポジトリの cwd** から `node .claude/skills/impeccable/scripts/detect.mjs --json <worktree 内ファイルの絶対パス>` で走らせる。
- Worktree 上で `pwsh ./scripts/verify_delivery_flow.ps1` を回すことは技術的には可能だが、`osada.us` の 308 リダイレクト検出や DATA_SYNC 判定は **main 反映後** に確定する情報に大きく依存する。worktree のみの再検証では typecheck / test / build / design lint までの 4 軸で十分とする。

## 2026-05-18 八日目結果未更新の根因
- `ResultData/torikumiAjax` は `Origin` / `Referer` だけでは足りず、`Cookie: mischeief=OK` がないと 403 になることがある。取得不能時は upstream HTML と実POSTを比較して、必要なブラウザ由来ヘッダを再確認する。
- 当日結果ページのテストで live 生成データの「特定日が pending」のような固定前提を置かない。日次更新で壊れやすい箇所は、テスト内で最小の `pending/published` 状態を合成して検証する。
- typed mock を `mockReturnValue()` で返すときは、対象 interface の必須項目を省略しない。特に route config 系は `monthKey` のような一見使っていないフィールドも `typecheck` 前提で揃える。

## 2026-05-13 配信フロー切り分け
- 不具合報告が「画面表示」でも、最初に `UI起因` と `配信起因` を分離して検証する。
- 最低限の証拠は3点で揃える: `origin/main` の生成物、GitHub Actions由来の更新時刻、`https://osada.us/api/v1/torikumi.json` の本番値。
- 「データ欠損」と「URLルーティング」を同じ不具合として扱わない。`DATA_SYNC` と `ROUTING_BEHAVIOR` を別判定で残す。
- 検証結果は `tasks/reports/delivery-flow-<timestamp>.md` に保存し、`tasks/todo.md` の Review にコマンド結果まで記録する。

## 2026-05-13 五月場所更新導線と末尾スラッシュ正規化
- 五月場所を主対象にする指示がある場合、`MARCH2026_*` データセットと文言を変更しない。3月は回帰テストで「不変」を担保する。
- `app/lib/torikumi-routes.ts` のような中核ヘルパーに競合マーカーが残っていると、見た目の不具合より先にビルド不能を引き起こす。最優先で除去してから機能修正へ進む。
- 末尾スラッシュ問題は「リンク生成」「Route定義」「配信fallback」の3点セットで扱う。1箇所だけ修正しても再発しやすい。
- バナー文言のような運用系表示は固定文で持たず、公開済みデータ（今回なら `scheduleDays` の published 最終日）から算出して手動更新をなくす。
- ワークフローの更新時刻変更だけでは要件達成にならない。実行コマンドが生成対象（結果/予定/番付/プロフィール）に一致しているかを必ず確認する。

## 2026-05-13 バナー千秋楽誤表示と結果/予定混線の再発防止
- バナー日次を `dayLabel`（例: 千秋楽）で扱うと、公開境界を超えたデータで誤表示しやすい。表示は必ず `day` 数値を使い、`n日目` 形式で固定する。
- 予定公開日は単独で最大公開日を採用しない。`min(scheduleLatest, resultLatest + 1)` で結果進行に追従させる。
- 生成スクリプトの fallback は `resultDays` と `scheduleDays` を絶対に横断しない。source を明示引数で分離し、混線を防ぐ。
- 日次上限の仕様（結果=当日まで、予定=当日+1まで）をロジックとテストの両方で保証する。仕様はテストが先に破る形で回帰検出できる状態を保つ。

## 2026-05-13 番付星取表が古いまま残る運用ミスの防止
- `--torikumi-only` は番付生成を更新しない。番付（星取表）反映が必要な更新では使わない。
- 結果更新日に番付も同期する場合は `python scripts/update_sumo_data.py --torikumi-scope result --skip-rikishi-fetch` を標準コマンドにする。
- 更新確認は `torikumi.json` だけでなく `banzuke.json.updatedAt` も必ず見る。片方だけ新しい状態を「更新完了」と判断しない。

## 2026-05-13 三日目結果ページ未更新に見えるケース
- `*-torikumi` の末尾スラッシュなしURLは、Cloudflare側で `/` へ 308 される場合がある。`_redirects` で `/:slug-torikumi -> /:slug-torikumi/` を明示する。
- データが更新済みでも、URL正規化が崩れると「結果ページが未更新」に見える。まず `torikumi.json` の day status と URLリダイレクトを分離確認する。

## 2026-05-13 十両特例幕内出場の休場誤判定
- 休場者算出は部門単体（幕内だけ/十両だけ）で判定しない。同日全取組（幕内+十両）に出場IDが存在すれば休場から除外する。
- 「出場中なのに休場表示」の検証は、`matches` 由来ID集合と `absentees` の積集合件数を機械的に確認する。
- 幕内人数の奇数起因で十両上位が幕内へ組み込まれる前提を、生成ロジックと回帰テストの両方で保持する。

## 2026-05-14 五月場所五日目pending残留と翌日自動更新の再発防止
- `today_day`は`BashoInfo.day`だけを信用しない。`torikumiAjax`で取組が存在する最新日も`effective_today_day`に含める。
- 取組ゼロ日の`absentees`は「全員休場」と同義ではない。`matches`由来のアクティブIDが空なら`absentees: []`を返す。
- realtime更新を`--torikumi-scope result`だけで回すと予定側が取り残される。場所中は`--torikumi-scope all`で結果と予定を同時更新する。
- 「結果未更新」判定は`winner`確定だけでなく、取組公開済み（未定含む）状態を区別して扱う。

## 2026-05-14 六日目予定公開の部分更新とローカル403対策
- 相撲協会APIは部門ごとに公開タイミングがずれる。片部門のみ公開時でも`status`/表示を壊さない設計にする。
- `matches`が空の部門は`absentees`を空に固定し、「未公開」を「全員休場」と誤表示しない。
- `post_json`は`Origin`/`Referer`不足で403を招く。AJAXエンドポイントごとにRefererを付与して取得安定性を上げる。
- `--torikumi-only`時に番付APIが落ちても、既存`torikumi.json`から`basho_id/day`を復元して更新継続できるようにする。

## 2026-08-29 Locale 文字列に月や場所をハードコードしない
- ヒーロー copy (`home.heroFinalDescription` 等) に「七月」「July」を直書きすると、次の場所に切り替わった瞬間に沈黙 desynchronize する。人の目視レビューなしには検出できない。
- locale 文字列は `{{bashoName}}` などの補間プレースホルダを持たせ、表示側で公開済みデータ (`torikumiArchive.bashoName` / `monthKey`) から派生させる。`basho-meta.ts` のように localized 月名テーブル (`MONTH_NAMES_EN`) を一枚用意し、JA は raw 値、EN は派生値を使う。
- Lesson #9（Discovery surface は SoT から派生）と同じ思想。文字列リテラルが「単一 source of truth」として振舞うのを避け、プログラム的に計算できる値は計算させる。
- 検証は「九月 mode でも正しい月名が表示される」を Vitest で固定する。locale 文字列の shift-jis / ハードコード検出 lint が将来あれば併用したい。

## 2026-08-28 Phase 1 完了記録（PR #494 / #495 / #496 / docs refresh）

PR #479 で満点に到達した AI Agent Readiness 7 項目を維持しつつ、保守性と可観測性を底上げする 4 PR を 2026-08-28 に順次マージした。

| PR | commit | スコープ | 満点項目への影響 |
| --- | --- | --- | --- |
| PR 1 (#494) | `817d56a` | Task 2-A + 5-A + 7-A: discovery 表面整理（WebMCP `provideContext` JSDoc、`oauth-authorization-server` 残置明文化、`bashoListForMonthKey` の `PAST_BASHO` 動的化） | ⑥ WebMCP ↑ |
| PR 2 (#495) | `88d1a30a` | Task 6-A: A2A Agent Card skills 同期 plugin（`mapSkillEntryToA2aSkill()` で `skills[]` を `SKILL_MANIFEST` から派生） | ④ A2A / ① Discovery 整合 |
| PR 3 (#496) | `e3195e7` | Task 11-A + 11-D: `prefersMarkdown` (RFC 9110 §12.5.1) pure 関数化 + `functions/_middleware.ts` substring match 置換 + `app/lib/__tests__/functions/` に直接テスト | ⑤ Markdown ↑ / ⑦ Functions ↑ |

### Lesson #9: Discovery surface は single source of truth から派生させる

`bashoListForMonthKey` も `skills[]` も、手書きの固定値ではなく **`PAST_BASHO` / `SKILL_MANIFEST` を source of truth として派生** する。新規 basho 追加や skill 追加は source of truth への追記に集約され、WebMCP と A2A Agent Card の双方が自動的に同期する。

**Why**: 同じデータを 2 箇所（template のハードコード + 派生関数の元データ）で持つと、drift で PR #479 の満点を崩すリスクがあった。`SKILL_MANIFEST` を `export const` 化した PR 2 で、`skills[]` が source から導出されることを `npm run build` 後の `dist/.well-known/agent-card.json` で検証できる。

**How to apply**: 新規 discovery surface を追加するとき、最初の手書き template の直下に「source of truth を export し、ビルド時に派生する」設計を入れる。手書きの固定配列を残したまま派生関数を追加しない。

### Lesson #10: Cloudflare 依存は pure 関数で分離して Vitest 単体テスト化する

`functions/_middleware.ts` のような Pages Functions は wrangler が bundle するため、`functions/` 配下に `.test.ts` を置くと vitest import が Pages build を破壊する（PR 3 の最初の CI 失敗）。Functions から呼ぶロジックは **`app/lib/` の pure 関数に切り出し**、テストは **`app/lib/__tests__/` 配下に置く**。Functions 側はその pure 関数の薄いラッパに保つ。

**Why**: `prefersMarkdown` を `functions/_middleware.ts` 内に直接書けば CI は通るが、`Accept` ヘッダの境界条件（q=0、ワイルドカード、パース失敗時の安全側）を網羅する単体テストが書けなくなる。`app/lib/content-negotiation.ts` に切り出すと、`tsconfig.json` の `functions` exclude を維持しつつ Node + jsdom で 8 it が GREEN になる。

**How to apply**: Cloudflare 固有 API（`context.nextContext()`, `context.env.ASSETS`, `crypto.subtle.sign('Ed25519', ...)` など）に依存しないロジックは `app/lib/` に切り出す。Functions は thin wrapper にして、Vitest は Node 環境で動く pure 関数に対してだけ書く。Functions 配下の直接テストが必要なら `app/lib/__tests__/functions/` に置く。

### 既存 Lesson #4 / #5 の有効性

- **Lesson #4**（WebMCP API 名前空間）— PR 1 で `NavigatorModelContext` / `registerWebMcpTools` の JSDoc を 4 段階検出順序として明文化済み。
- **Lesson #5**（RFC 9728 §3.2）— PR 1 で `oauth-authorization-server` を「`agent_auth` 拡張付き metadata-only discovery surface として残置」と `docs/agent-ready.md` に明記済み。

## 2026-09-17 news_state の stale/future candidate で raise しない
- ニュース durable state の `record_attempt` は、`acquired > attempted_at or acquired < state["lastSuccessAt"]` を検出したとき `ValueError` を投げず、`candidate = None` にして "failed attempt" として記録する。`consecutiveFailures` をインクリメントし、`latestGood` / `lastSuccessAt` は不変。
- 旧来の raise 挙動は `state_publish` の `CalledProcessError` 経由で GitHub Actions の publish ジョブ全体を失敗させ、後続トリガの自動再実行を妨げていた (news run 35041882677 の連鎖失敗)。同じ source が新データを送らない限り永続的に失敗し続ける構造。
- 時計が source 側で戻った／進んだ／遅延配信された candidate は「失敗 attempt」相当として扱い、3 連続失敗で `select_publication` の `consecutiveFailures < 3` ガードが publication を抑制する。これで durable state の不変条件 (`latestGood` の monotonic な `lastSuccessAt`) は維持される。
- 回帰テスト: `scripts/ci/news_state_test.py:test_stale_or_future_candidate_is_recorded_as_failure` で future-dated と stale candidate の両方をロック。
- **Why**: monotonic な `updatedAt` を期待するパイプラインで、source が stale データを返し続けた瞬間に raise すると、repair 用の safe path が消える。「成功 candidate がない」状態を永続化するのが正解で、閾値ベースの circuit breaker は別レイヤ (`select_publication`) で持つ。
- **How to apply**: state-machine で candidate を reject する 2 択 = `raise` or `skip-as-failure`。後者は (a) durable invariants を壊さず、(b) 閾値ベースの circuit breaker に上位で判定させる、という設計原則に適合する。`raise` を採用するのは schema 不一致など repair 不能な corrupt case のみ。

## 2026-09-17 schedule absentees と resultDays 出場者の reconciliation
- `scripts/update_sumo_data.py:derive_absentees` は従来 `day_active_ids` (同一 collection 内の active set) のみを受け取っていた。schedule absentees を計算するときに、resultDays の同じ日の出場者が見えないため、JSA upstream が「schedule absentees リスト」と「resultDays 結果」を別 snapshot で配信するケース (day=5 rikushi 3988) で validator `precise_fusen_losers` (appearances==1) と不整合を起こしていた。
- 単純な fix として `day_active_ids |= result_active_ids` だけ行うと、`(fusen_loser_ids & set(roster.keys()))` の項が依然として active な fusen_loser を absentees に再追加するため、validator 拒否は解消しない。閾値ベースの validator (appearances==1) と generator の `(fusen_loser_ids & roster)` 判定基準が微妙にずれているので、union 案は generator 側のfus en_loser 再追加ロジックを止めない。
- fix: `cross_day_active_ids: set[int] | None = None` を signature に追加し、(a) `active_ids |= cross_day_active_ids` で cross-day 出場者を active 集合へマージ、(b) `fusen_loser_ids -= cross_day_active_ids` で **cross-day subset のみ** を fusen_loser から除外 (full active_ids ではなく surgical な subset)。resultDays call sites は `cross_day_active_ids=None` のままなので既存セマンティクス (in-division fusen_loser は absentees に残る) が完全に保持される。
- 回帰テスト: `scripts/update_sumo_data_torikumi_logic_test.py:test_derive_absentees_excludes_cross_day_active_fusen_loser` (cross_day active で除外される) と `test_derive_absentees_keeps_inactive_fusen_loser` (cross_day inactive なら除外されない boundary)。
- **Why**: generator と validator の判定基準が微妙にずれている場合、表面的な union 案 (案 a) は active 集合を増やすだけで、generator 内部の「fusen_loser を absentees に再追加する」ロジックを止めない。signature 拡張 + targeted subtraction で surgical に除く必要がある。
- **How to apply**: 「state machine の単調増加ロジック」と「validator の閾値ロジック」の判定基準が一致しているか、テスト前に必ず照合する。一致しない場合は generator 側で「active なら absentees ではない」と明示的に除外するロジックを追加する。surgical な subset (`cross_day_active_ids` のみ) を subtract する方が、full active_ids を subtract するより「同じ collection 内の fusen_loser は absentees に残る」既存セマンティクスを壊さず安全。

## 2026-09-17 PR clean 化 force-push / tree 汚染 / base SHA ずれ (PR #628)

PR を clean な状態にして squash merge する過程で 3 つの operational pitfall に遭遇した。`tasks/todo.md` の Review 節 (Actions failure repair) に詳細ログあり。

### force-push syntax: `origin <src>:<dst>` を明示する
ローカル branch を削除した状態 (detached HEAD からの再生成など) で force-push しようとすると、`git push --force-with-lease origin <branch>` は "Everything up-to-date" で誤って成功扱いされる。`origin <src>:<dst>` の refspec を明示し、`git push --force-with-lease origin fix/news-state-graceful-skip:fix/news-state-graceful-skip` のように書く。

**Why**: `<branch>` がローカルに存在しないと refspec 解決に失敗し、リモート ref との差分判定ができずに「最新」と判定される。`--force-with-lease` の safety 機構 (上流 ref との比較) も効かない。

**How to apply**: detached HEAD (`git checkout <sha>` / `git switch --detach`) から force-push するときは常に `origin <src>:<dst>` の refspec 形式を使う。`<src>` には branch 名 (リモート側に同名 branch がある場合) または SHA を入れる。通常の working branch からの force-push でも `<src>:<dst>` を明示する癖をつけると事故が減る。

### PR tree に無関係 file が混入する (dirty working tree + cherry-pick)
cherry-pick や rebase 実行時に working tree が dirty だと、競合解決の `git add` で無関係な file も staged に入り、PR head の tree にそのまま残る (PR #628 の事例: news_state.py / news_state_test.py / tasks/lessons.md / tasks/todo.md の 4 files だけのつもりが、`app/lib/sumo-data.ts` / `app/lib/torikumi-data.ts` / `public/api/v1/banzuke.json` / `public/api/v1/torikumi.json` の data ファイル 4 つも混入)。

**Why**: cherry-pick は `--no-commit` で working tree 上の競合を解決させるため、`git add` する時点で dirty だった他 file も一緒に index 入りする。`git commit` 時の tree は index 全体を snapshot するため、cherry-pick 対象とは無関係な file がそのまま commit に含まれる。

**How to apply**: cherry-pick / rebase 開始前に必ず `git status` で clean 確認 (必要なら `git stash`)。`git push` 直前に `git diff --name-only HEAD~1 HEAD` で意図した file のみが含まれることを必ず確認。PR 作成時に意図しない file が混入していたら、PR を閉じる前に detached HEAD で clean な commit を作り直して force-push する (前項参照)。

### PR base ref と actual parent commit はズレ得る
PR head の parent commit (`git log --format=%P -1 HEAD`) と GitHub が表示する base ref (`gh pr view --json baseRefName`) は、cherry-pick 時点と push 時点の main HEAD がズレると別 SHA になる (PR #628: actual parent `0c1dc88` (PR #627 refactor)、GitHub base `df6d856`)。

**Why**: GitHub の base ref は PR open / push 時点の commit を記録し、後で main に新 commit が積まれても自動更新されない。conflict 検出は PR 作成時の tree で行うため、cherry-pick 中の main HEAD ズレが merge 時に surface する。

**How to apply**: clean な PR を再生成するときは、GitHub base と同じ SHA を detached HEAD で checkout → 必要 file のみ checkout (`git checkout df6d856 -- <files>`) → commit → push の手順で再生成する。`git merge-base HEAD origin/main` が PR の GitHub base ref と一致するか PR 作成前に照合する習慣をつけると、conflict 発生を事前に予測できる。

## 2026-09-13 OGP画像の意図と配信履歴を照合する
- 古いOGP表示の報告では、現在の配信画像だけからキャッシュ原因に絞らない。ユーザーが以前作成した正しい画像、Gitの画像履歴、公開画像の内容を照合する。
- 画像URLのバージョン変更を提案する前に、その画像自体がユーザーの指定（読みもの・年月日・場所名なし）を満たすことを目視で確認する。

## 2026-09-15 GitHub Actions 安全再設計（PR #619）

### ユーザー指示が明確なときは探索サイクルを即終了する

「ローカルを最新化しておいて」「5つの全ワークフローを安全再設計」のように指示が具体的なら、Plan モードの5フェーズ（探索→設計→レビュー→最終プラン→承認）を省略する。各フェーズで AskUserQuestion を連発すると「3時間かかって壊れた」と言われる。

**Why**: Plan モードは本来「曖昧な要件を具体化する」仕組みだが、要件が明確なタスクでは逆に overhead になる。ユーザーが「ボツ」と明示したときは、探索結果を破棄して指示の最小解釈で即実装に入る。

**How to apply**: 指示が具体的（対象ファイル名・対象スコープ・「安全再設計」のような動詞）なら、最初の Explore エージェントは最大2個、Plan エージェントは省略可能。`tasks/todo.md` にチェックリストを書いて進捗を可視化するだけで、5フェーズ formalism を満たせる。

### ブランチ状態（ahead/behind）は rebase / merge 提案より先に確認する

`fix/data-publish-allowed-paths` で作業中に main との関係を `git log main..HEAD` / `git log HEAD..main` で確認したら 50 コミット ahead だった。`git rebase origin/main` を進めようとすると reflog に abort が残り、ユーザーから「壊れた」と言われる。

**Why**: 「ローカルを最新化」の意味が「pull して追従」なのか「main にマージ」なのかは、ahead/behind 数で完全に分岐する。ahead なら rebase は逆方向に進む。

**How to apply**: `git status` と `git log --oneline main..HEAD` を最初に確認。ahead が大きい（10+ コミット）なら「cherry-pick 戦略」「main へのマージ方針」を AskUserQuestion で確定する。

### GitHub Actions は tag ではなく SHA でピン留めする

`actions/checkout@v4` は mutable ref で、悪意ある/誤った re-tag があれば CI が任意のコードを実行する。`@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0` のように SHA + バージョンコメントに固定する。

**Why**: GitHub のタグは force push で書き換え可能（実際は禁止運用だが技術的には可能）。SHA は commit object への immutable ref。Dependabot で更新運用の自動化が必要だが、最初の SHA 固定で「現状は安全」を保証できる。

**How to apply**: `git ls-remote --tags https://github.com/<owner>/<repo>.git | grep -E 'refs/tags/v?<maj>.<min>.<patch>$' | tail -1` で最新タグの SHA を取得。`uses: <owner>/<repo>@<sha> # <tag>` 形式で記述。

### 単一情報源（SoT）の二重管理は silent failure の温床

`scripts/ci/run_data_update.py:18` の `TORIKUMI` タプルと `scripts/ci/torikumi_paths.txt` が同じ 4 ファイルを別管理していた。ジェネレータが新ファイルを書くと片方だけ更新され、`data_publish.py:91` の `PublishError: Generated changes outside allowed_paths` で CI が落ちる（PR #618 で実例）。

**Why**: 二箇所で同じ情報を更新するのは「片方忘れる」が必ず起きる。CI 設定の SoT を 1 箇所に絞ると、新規ファイル追加時に修正箇所が明確になる。

**How to apply**: CI の許可パスリスト・cron 定義・トリガー条件など「同じ情報を複数ファイルに書く」設計を見つけたら、片方を single source of truth にする。テストで SoT と派生ファイルの一致を検証する。`push_realtime_update_test.sh:25` のように「作るが読まない」dead code ファイルは積極的に削除する。

### ファイル参照は grep だけでなく「実際に read されているか」を確認する

`scripts/ci/push_realtime_update_test.sh:25` で `torikumi_paths.txt` を作成していたが、後続のテストフロー（line 26-52）はそのファイルを**読まなかった**。grep では「参照箇所あり」になるが、実際に dead code。

**Why**: grep は「文字列の出現」を見つけるが、「読み書きの用途」は見つけない。生成だけのファイルは削除しても影響しない。

**How to apply**: ファイルを削除する前に、(1) テスト・CI・本番スクリプトの grep、(2) 各参照箇所のコンテキスト確認（read か write か）、(3) 削除後のテスト再実行、の3ステップを踏む。
## 2026-09-18 ユーザー用語を機能名・コンポーネント名に勝手に翻訳しない

- 「只今の速報」「コア時間に自動更新」のように、機能・コンポーネントを連想させる日本語フレーズを聞いたら、対応する既存実装の有無を先に確認する。新機能として Phase を起こし始めない。
- 既存実装(`buildLiveTorikumiTarget` など)で実現できているなら「現状で動作している」ことを明示し、追加実装は本当に不足している部分のみに限定する。
- 推測で新セクション(D-4 / D-5)や新フェーズ(Phase 2)を混ぜると、ユーザーは「忘れて」「ニュースは無関係よ」と一発で否定することになる。設計に組み込む前に 1 問で確認する。
- 確認の仕方は `AskUserQuestion` で、語句の意味・スコープ・優先度を 2-3 問に絞る。`top page の只今の速報` のような曖昧語が来たら、`既存ライブリンクか / ニュースか / 別の何かか` の選択肢を提示して明示させる。

**Why**: 同じ失敗で PR を 1 回分まるごと組み直しになると、設計ドキュメントの信頼性も commit 履歴もノイズになる。曖昧語 → 実装対応の橋渡しは、確認 1 回で防げる。

## 2026-09-19 CSS animation は状態機械と同期させる

`.torikumi-refresh-btn__spinner` に無条件で `animation: torikumi-refresh-spin .8s linear infinite` を付けていた。React の status state は `loading` → `error` (3 秒後) → `idle` に遷移するが、`.torikumi-refresh-btn__spinner` の CSS animation は独立して動き続けたため「永遠に回り続ける」ように見えていた。PR #636 で `Promise.race` の 8 秒 timeout を入れたが、CSS 側を更新しなかったため UX 的に spinner が止まらない問題は残った。

修正: animation を `.torikumi-refresh-btn[aria-busy="true"] .torikumi-refresh-btn__spinner` 配下に移動し、`prefers-reduced-motion` override も同条件に揃えた。

**Why**: CSS animation は JS の state 遷移と独立。React が `aria-busy` 属性を外しても、CSS セレクタが条件を絞っていなければ animation は止まらない。CSS は「状態」を持たないため、状態機械との同期は属性セレクタ (`[aria-busy="true"]`, `[data-state="loading"]`, `:disabled`) で明示的に結ぶ必要がある。

**How to apply**:
1. 連続的に動く animation (`infinite`, ステップ系 keyframes) を要素に付けるとき、親または自身の状態属性セレクタで囲う: `button[aria-busy="true"] .spinner { animation: ... }`
2. `prefers-reduced-motion` の override も同条件で更新する (条件分岐を二重にしない)
3. `aria-busy` / `disabled` / `data-state` などの状態属性を loading インジケータの唯一のスイッチとして扱う
4. CSS animation の単体テスト (jsdom 不可) の代わりに、minify 後の chunk を `grep -oE` でルール本文を取り出して「無条件 animation がないこと / 条件付き animation があること」を検証する

## 2026-09-19 hover と focus-visible は同じ background を共有せず outline リングに分離する

- `.btn:hover, .btn:focus-visible { background: var(--color-secondary); }` のように background 変更を 1 ルールにまとめると、iOS Safari 15+ で `:focus-visible` がタップ時に発火し、ボタン全面が `--color-secondary` (sumō orange `#c2410c`) に変わる。エラー色に見える UX バグになる (PR #639 の事例: torikumi 更新ボタンがタップ中に橙色になり、クルクル回るアニメーションと重なり「エラー状態」と誤認される)。
- 修正: `:hover` は background 変更 (デスクトップ UX)、`:focus-visible` は `outline: 2px solid var(--color-secondary); outline-offset: 2px;` のリング表示のみに分離する。background 変更を共有しない。
- `:focus-visible` (W3C Selectors 4) は `:focus` と異なり、キーボード操作や「最後の入力がキーボードだった」状態で発火する。モダンブラウザ (iOS Safari 15+ 含む) では pointer (tap) でも発火するため、hover と focus を「同じ視覚表現」にすると意図しない場面で UX が破綻する。
- **Why**: `--color-secondary` のような accent 色は hover の "feedback" 用途と focus の "位置表示" 用途で意味が違う。前者は「ユーザーが触った」合図、後者は「いま focus している」合図。背景塗りつぶしは focus には強すぎて、エラーやアクティブ状態と誤認される。`--color-secondary` が light mode で `#c2410c` (sumō orange) と非常に強く見える色のため、誤認リスクが特に高い。
- **How to apply**: ボタン系要素は (1) `:hover` → background 変化 (デスクトップのみ)、(2) `:focus-visible` → outline リング (background 変化なし、`outline-offset` 最低 2px)、(3) `:active` → 微小な transform/inset shadow (押下フィードバック)、(4) `[aria-busy="true"]` → opacity 低下、を 4 チャネルに分離して CSS を書く。`outline-offset` を 0 にするとリングがボタン枠に被ってギザギザに見える。light / dark 両 theme で同じ分離を忘れずに適用する。
