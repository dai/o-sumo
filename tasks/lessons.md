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
