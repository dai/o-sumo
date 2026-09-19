# GitHub Actions 安全再設計 — 実装 Todo

プラン: `C:\Users\dai\.claude\plans\cached-singing-flask.md`

## Phase 0: ローカル状態確認
- [x] git status / reflog 確認（clean, fix/data-publish-allowed-paths 上）
- [x] 既存テストの健全性（67 tests OK）
- [x] `@types/node@25` 固有 API の使用箇所なし（`node:fs`, `node:path`, `node:crypto` のみ）
- [x] アクション SHA 取得（checkout v4.4.0, setup-node v4.4.0, setup-python v5.6.0）

## Phase 1: ワークフロー安全設計
- [x] 1-E: `test.yml` — timeout-minutes 追加、permissions 明示、SHA ピン、コメント
- [x] 1-B: `daily-data-update.yml` — permissions 縮小
- [x] 1-C: `realtime-torikumi-direct-update.yml` — permissions 縮小
- [ ] 1-D: `news-feed-update.yml` — 変更なし（plan通り permissions 維持）
- [x] 1-A: `data-update.yml` — SHA ピン、delivery にも main-only if 追加

## Phase 2: 補助的安全策
- [x] 2-A: `scripts/ci/torikumi_paths.txt` 削除 + 関連 README/test 更新
- [x] 2-C: `test.yml` セキュリティガードのコメント追加（1-E に統合済）
- [x] 2-B: `@types/node` 整合 — **不要**（`app/` で Node 25 固有 API 未使用、typecheck 通過確認済）

## Phase 3: 検証
- [x] Python unittest 67 tests OK
- [x] TypeScript typecheck 通過
- [x] vitest 537 tests passed (71 files)
- [x] push_realtime_update_test.sh OK
- [x] blog:generate + git diff check (exit 0, 差分なし)
- [x] npm run build (built in 1.96s, PWA 119 entries 生成)
- [ ] ブランチ push → test.yml CI 通過
- [ ] main マージ後、realtime workflow_dispatch 実行確認

## レビュー

### 完了内容
- **Phase 1-A `data-update.yml`**: actions を SHA ピン留め、delivery ジョブに main-only if 追加
- **Phase 1-B `daily-data-update.yml`**: permissions を `contents: read` に縮小
- **Phase 1-C `realtime-torikumi-direct-update.yml`**: 同上
- **Phase 1-E `test.yml`**: timeout-minutes 20 追加、permissions 明示、2 アクション SHA ピン、セキュリティガードにコメント追加
- **Phase 2-A `torikumi_paths.txt` 削除**: 二重管理の片方を削除、`push_realtime_update_test.sh` と `README.md` も追従
- **Phase 2-B `@types/node` 整合**: **不要**（`app/` で Node 25 固有 API 未使用、typecheck 通過）
- **Phase 2-C セキュリティガードコメント**: 1-E に統合

### 検証結果
| 項目 | 結果 |
|---|---|
| Python unittest (7 ファイル) | 67 tests OK |
| vitest | 537 tests passed (71 files) |
| TypeScript typecheck | エラーなし |
| push_realtime_update_test.sh | "push conflict preserved remote schedule: OK" |
| blog:generate + git diff | 差分なし |
| npm run build | 成功（1.96s, PWA 119 entries） |

### 残作業（CI 確認）
- ブランチを push し、test.yml が緑になることを確認
- main マージ後、realtime workflow_dispatch を1回実行し PublishError が出ないことを確認
- Dependabot 設定追加（SHA ピン留め運用のため任意）

### ロールバック
- 各変更は独立して `git revert <commit>` で取り消し可能
- `torikumi_paths.txt` 復元: `git checkout HEAD~ -- scripts/ci/torikumi_paths.txt`

# Actions failure repair (2026-09-16)

- [x] Identify failed runs and trace the news acquisition timestamp error.
- [x] Reproduce elapsed acquisition and retry failures in orchestration tests.
- [x] Record completion time after each acquisition and evaluate publication with current time.
- [x] Investigate startup failures independently and repair confirmed workflow defects.
- [x] Run relevant regression tests and review the final diff.

## Review

- News run 35041882677 fetched successfully but rejected the candidate against a timestamp taken before acquisition. Completion time is now sampled after every acquisition; publication selection also uses current time.
- Daily run 34957084132 and realtime run 34955150310 were rejected before jobs started because their caller permissions did not allow the reusable workflow permissions. Both callers now match the existing reusable contract.
- Regression tests failed before their corresponding fixes. The full CI Python command passed 161 tests after the fixes. Actionlint passed for all three callers, the reusable workflow, and the Test workflow (shellcheck and pyflakes disabled).
- Independent review found no additional issues. Production workflow dispatch and real notifications were not performed.

# 物申す分離 + GreetingSection (PR #625)

プラン: `C:\Users\dai\.claude\plans\jst-15-18-3-zippy-ripple.md`

## Phase A: Rename refactor (MonomosuSection extraction)
- [x] `DailyMonomosuBox.tsx` → `MonomosuSection.tsx` rename (git mv + content)
- [x] `DailyMonomosuBox.test.tsx` → `MonomosuSection.test.tsx` rename + describe/import/JSX 更新
- [x] `MonomosuSection` を `<section aria-labelledby>` + sr-only h2 に格上げ (ランドマーク化)
- [x] `DailyHighlightsSection.tsx` から nested MonomosuBox 削除 + `getRelativeMonomosuText` import 削除
- [x] `DailyHighlightsSection.test.tsx` から nested 期待値削除 (`.not.toBeInTheDocument()`)

## Phase B: GreetingSection 新規作成
- [x] `app/components/GreetingSection.tsx` 新規 (~50 行、card-header は `<div>` で重複 banner role 回避)
- [x] `blogFeed.items[0]` (最新記事) を editor's note として表示
- [x] `greeting.*` i18n 名前空間を ja/en に追加 (`title`, `viewAll`, `editorLabel`, `publishedOn`)

## Phase C: Home page 配線 + テスト更新
- [x] `app/page.tsx` に `<GreetingSection />` + `<MonomosuSection>` を `<BlogUpdatesSection>` の下に兄弟として配置
- [x] `featuredBoutDay` / `featuredShareTitle` / `featuredCustomComment` を `bashoStatus` から派生
- [x] `app/page.test.tsx` を新 DOM 構造に合わせて更新 (querySelector + screen.getByText)
- [x] `app/lib/relative-date.ts` の `getRelativeMonomosuText` を page.tsx 側に import

## Phase D: コミット + プッシュ + PR
- [x] 4 コミット作成 (refactor / feat / feat / docs)
- [x] `chore/realtime-3min-polling` ブランチへ push (remote tracking 設定)
- [x] PR #625 作成 (https://github.com/dai/o-sumo/pull/625)

## レビュー

### 完了内容
- **PR #625**: `feat(home): extract MonomosuSection and add GreetingSection`
- コミット 4 件: `84edd05` → `59b44af` → `c35a6ad` → `d05303a`
- 変更: 13 files, +115 / -37

### 検証結果
| 項目 | 結果 |
|---|---|
| TypeScript typecheck | clean |
| vitest | 71 files / 563 tests pass |
| npm run build | clean (3.72s) |
| Python unittest (workflow_config) | 4/4 pass |
| blog.json diff | no changes |
| CI test workflow | SUCCESS (GitHub Actions run 35183277454) |
| CI Cloudflare Pages preview | SUCCESS (o-sumo + o-sumo-blog) |

### 設計上の決定
- バックエンド・インフラ変更なし (`functions/` / `wrangler.toml` 触らず)
- pending (データなし) 状態でも Box は常に表示
- localStorage + 既存 `navigator.share` / clipboard パターンのみ利用
- `<header>` (GreetingSection の card-header) を `<div>` に変更して重複 banner role を回避 (testing-library getByRole('banner') の strict mode 衝突)

### 残作業 (別 PR で計画)
- **PR B**: 来場者コメント機能。`codex-instruction.md` の Cloudflare Workers 無料枠運用制約と整合させるため、giscus (blog.osada.us) / localStorage / Cloudflare KV の選択肢から設計比較が必要

# Actions failure repair (2026-09-17)

- [x] Identify `news_state.py:138` ValueError via `gh run view --log`
- [x] Apply graceful-skip fix: `raise ValueError` → `candidate = None`
- [x] Add regression test `test_stale_or_future_candidate_is_recorded_as_failure`
- [x] Run full Python CI suite (83 tests OK, no regressions)
- [x] Verify daily `torikumi.json` (run 35199436940) is self-healed (rikushi 3988 absent)

## Review

- Root cause: `record_attempt` raised on stale/future-dated candidate, propagating as CalledProcessError through `state_publish`. News publish (and downstream main publish) never reached git commit.
- Fix: candidate invalid → counted as "failure" attempt (consecutiveFailures++), durable state preserved, `select_publication` circuit breaker (>=3 failures) handles suppression.
- Daily torikumi run 35199436940 (validator rejected fusen/absentee overlap for rikushi 3988 in day=5) was a data-driven failure that auto-healed on next upstream refresh — no validator change needed.
- Discord notification `curl: (6) Could not resolve host` is a secondary noise — `notify_discord.sh` uses `|| echo '::warning::'`, not blocking. Worth a separate investigation later (DNS for `DISCORD_WEBHOOK_URL` host).

- PR #628 (`fix(ci): treat stale or future-dated news candidates as failed attempts`) を 2026-09-17 に squash merge (CI: Cloudflare Pages x 2 + test 緑)。origin/main HEAD `a964d477`、local main merge commit `e0ec985` (Co-Authored-By 付与)、branch `fix/news-state-graceful-skip` 削除済。
- 修正点: PR #628 head (82956bf) の tree には本来 4 files (news_state.py / news_state_test.py / tasks/lessons.md / tasks/todo.md) のはずが、`app/lib/sumo-data.ts` / `app/lib/torikumi-data.ts` / `public/api/v1/banzuke.json` / `public/api/v1/torikumi.json` の data ファイル 4 つも混入していた (過去の cherry-pick 時に working tree dirty だった)。`gh pr merge 628 --squash` が main HEAD (5fc7951) と conflict (両 branch が tasks/lessons.md / tasks/todo.md に同一 news_state section を追加) したため、PR branch を df6d856 + news_state.py + news_state_test.py のみの clean な commit (`e0ffbc7`) に作り直して force-push してから merge。
- **force-push syntax 教訓**: `git push --force-with-lease origin <branch>` だけだとローカル branch 不在で "Everything up-to-date" 誤判定される。`origin <src>:<dst>` 形式で `git push --force-with-lease origin fix/news-state-graceful-skip:fix/news-state-graceful-skip` のように明示する必要あり。
- 副次発見: PR #628 head (82956bf) の親は実は `0c1dc88` (PR #627 refactor) で、PR の GitHub base `df6d856` とは別 commit — cherry-pick 時点の main HEAD で base 表記されたため。clean な PR 作成時は df6d856 を detached HEAD checkout → 必要 files のみ checkout で対応。

# Rikushi 3988 absentees overlap (2026-09-17)

- [x] Identify `validate_torikumi.py:129` rejecting day=5 participant/absentee overlap [3988] via `gh run view --log`
- [x] Confirm root cause via `Select-String` + line-range read on `public/api/v1/torikumi.json` (3988 in both scheduleDays juryo absentees and resultDays juryo bouts)
- [x] Verify validator is correct (`precise_fusen_losers` rule is stricter than `derive_absentees`'s `(fusen_loser_ids & roster)`)
- [x] Plan: extend `derive_absentees` signature with `cross_day_active_ids` and exclude active fusen losers
- [x] Apply `derive_absentees` signature extension + schedule-mode call site update
- [x] Add regression tests in `update_sumo_data_torikumi_logic_test.py`
- [x] Verify all Python CI tests pass (incl. existing `derive_absentees` tests)
- [x] Push branch + open PR via `gh pr create --fill`

## Review

- Root cause: `derive_absentees` was per-collection (`day_active_ids` only); no view of resultDays appearances.
- Validator's `precise_fusen_losers` (appearances==1) is stricter than generator's `(fusen_loser_ids & roster)` (all fusen losers). 3988 — a fusen loser who also appeared in resultDays — ends up in generator's absentee list but is rejected by validator.
- Fix: signature extension with `cross_day_active_ids` + targeted subtraction of the cross-day subset from `fusen_loser_ids` (not the full active_ids, to preserve the existing in-division fusen-loser semantics in resultDays).
- Plan agent's initial recommendation (案 a, inline `day_active_ids` union) was rejected: it does not address the `(fusen_loser_ids & roster)` re-addition. Option (b') addresses both the active merge and the fusen-loser exclusion.

# PR B: ホーム構造変更 + Visitor Comments (giscus)

プラン: `C:\Users\dai\.claude\plans\jst-15-18-3-zippy-ripple.md`

## Phase A: ホーム構造変更

- [x] `MonomosuSection` を sr-only h2 → visible h2 に昇格
- [x] `GreetingSection` を `MonomosuSection` 内にネスト (h3)
- [x] `BlogUpdatesSection` 完全削除 (component + test + dead CSS)
- [x] `app/page.tsx` から `BlogUpdatesSection` / `GreetingSection` import 削除
- [x] `getLatestBlogPost()` helper を `app/lib/blog-data.ts` に追加
- [x] i18n キー削除 (`blogUpdatesTitle`, `blogUpdatesAll`, `monomosuTitle`)
- [x] `.greeting-*` CSS を Digital Washi 整合で追加
- [x] `.blog-updates-*` dead CSS 5 ブロック削除
- [x] `.monomosu-title` をバッジ風 → visible h2 風に書き換え

## Phase B: giscus (cherry-pick 済)

- [x] `b74385f` feat(blog): wire giscus comments on blog.osada.us post pages
- [x] `5e10f1b` feat(blog): replace giscus placeholder IDs with real values
- [x] `24418ce` docs(blog): sync giscus 'Announcements' category

## Phase C: 検証

- [ ] TypeScript typecheck 通過
- [ ] vitest 通過
- [ ] blog.json diff なし
- [ ] npm run build 通過
- [ ] 新 PR 作成

# Torikumi Manual Refresh (2026-09-18)

プラン: `C:\Users\dai\.claude\plans\cozy-wondering-volcano.md`
設計: `tasks\plans\2026-09-18-torikumi-ux-design.md`

## ブランチ
- [x] `feat/torikumi-manual-refresh` を origin/main から新規作成 + push

## Commit 1: refactor
- [x] `app/lib/scroll-to-hash.ts` 新規作成 (`scrollToAnchorWithRetry` を抽出)
- [x] `app/components/ScrollToHash.tsx` の rAF リトライを `scrollToAnchorWithRetry` 呼び出しに置換
- [x] `app/components/ScrollToHash.test.tsx` の既存テストがパス (2/2)
- [x] `npx tsc --noEmit` 通過

## Commit 2: hook
- [x] `app/lib/use-scroll-restore.ts` 新規作成 (capture/restore/clear + suppress flag)
- [x] `app/lib/use-scroll-restore.test.ts` 新規作成 (pure helpers + hook + suppress flag lifecycle)
- [x] `npm test -- --run app/lib/use-scroll-restore.test.ts` パス (12/12)
- [x] `npx tsc --noEmit` 通過

## Commit 3: ボタン + i18n
- [x] `app/components/ManualRefreshButton.tsx` 新規作成 (状態機械 + ARIA)
- [x] `app/components/ManualRefreshButton.test.tsx` 新規作成 (idle/loading/upToDate/error 分岐)
- [x] `src/locales/ja/common.json` の `torikumi` 配下に `manualRefresh` / `refreshFailed` / `upToDate` 追加
- [x] `src/locales/en/common.json` の `torikumi` 配下に 3 キー追加
- [x] `npm test -- --run app/components/ManualRefreshButton.test.tsx` パス

## Commit 4: 組み込み
- [x] `app/components/ScrollToHash.tsx` に suppress-flag guard を追加
- [x] `app/components/TorikumiDayPage.tsx` に `liveData` state, `handleRefresh`, `useScrollRestore`, `<ManualRefreshButton>` を追加
- [x] `app/torikumi/page.css` に `.torikumi-refresh-*` ブロックを追記
- [x] `app/components/TorikumiDayPage.test.tsx` に回帰テスト追加
- [x] `npm test -- --run app/components/TorikumiDayPage.test.tsx` パス

## 検証
- [x] `npm run typecheck` 通過
- [x] `npm test -- --run` 全スイートパス (既存 68 + 新規 4 ファイル)
- [x] `npm run build` 通過
- [x] 手動スモーク (`http://localhost:3001/202609-torikumi/` でボタン押下とスクロール保持確認)
- [x] 4 コミット + push + `feat/torikumi-manual-refresh` PR 作成

## レビュー (実装後記入)

### 完了内容
- **ブランチ**: `feat/torikumi-manual-refresh` を origin/main から作成
- **4 コミット** (新規は 2 つ、既存 2 つは前フェーズで push 済み):
  - `4180899` `refactor(torikumi): extract scrollToAnchorWithRetry`
  - `231b26a` `feat(torikumi): add useScrollRestore hook`
  - `41ac4b8` `feat(torikumi): add ManualRefreshButton with i18n labels`
  - `db43104` `feat(torikumi): wire manual refresh + scroll restore in TorikumiDayPage`
- **PR**: `feat/torikumi-manual-refresh` を main に向けて作成 (URL は push 後の出力参照)

### 検証結果
| 項目 | 結果 |
|---|---|
| TypeScript typecheck | エラーなし |
| vitest (Commit 4 影響 4 ファイル) | 45/45 緑 |
| vitest (全スイート 72 ファイル / 587 tests) | 587/587 緑 (リグレッションなし) |
| npm run build | ✓ built in 2.38s, PWA 121 entries precached |

### 設計上の決定 (実装後の補足)
- **ManualRefreshButton**: `aria-label` を外して visible text を accessible name に使用 (state 遷移時に `getByRole` が破綻しないため)。代わりに `aria-live="polite"` で status 変更を screen reader に通知。
- **型 guard `isTorikumiDataSet`**: `app/lib/torikumi-data-validate.ts` に新規。`app/lib/rikishi-profile.ts:203` の `isRikishiMatchupsResponse` パターンを踏襲 (function-as-type-guard)。
- **`stripTrailingSlash` export**: 元は `torikumi-routes.ts` 内部 private だったが、`sessionStorage` キー用に `TorikumiDayPage` から参照するため export 化 (1 文字追加で済む軽微な API 拡張)。
- **scroll suppression window**: 1 秒 TTL の `window.__osumoScrollSuppressUntil` フラグで、`ScrollToHash` の `scrollTo(0, 0)` をガード。`use-scroll-restore.ts` で `Window` 型拡張 (`declare global`) を宣言。
- **CSS レシピ**: 既存の `.mokufuda-chip` (lines 77-146) を踏襲した Digital Washi — 0 px radius、primary/secondary 色、dark theme override、`prefers-reduced-motion` 対応 spinner。

### 残作業 (本 PR 外)
- **手動スモーク (任意)**: `npm run dev` → `http://localhost:3001/202609-torikumi/` でボタン押下 → スクロール保持確認。Cloudflare Pages プレビューでも確認可。
- **CDN 60 秒キャッシュ**: 現状維持 (ユーザー了解済み「10 分以内の反映を保証しない」)。
- **`useScrollRestore` のテスト改善余地**: 同一 ID を capture 後の挙動は現状仕様にないが、必要なら将来追加。

## PR #637 — fix(torikumi): only animate refresh button spinner during loading

### 背景 (実装後の補足)
- PR #634 (`feat(torikumi): manual refresh button with scroll position restore`) で `.torikumi-refresh-btn__spinner` に `animation: torikumi-refresh-spin .8s linear infinite` を**無条件**で付けた。
- PR #636 (`fix(torikumi): use Promise.race timeout fallback for SW-bound fetch`) で 8 秒 timeout (`Promise.race`) を入れたが、CSS animation 側は更新しなかった。
- 結果: status が `loading` → `error` (3 秒) → `idle` に遷移しても spinner が回り続け、UX 的に「永遠にクルクル」する状態になっていた。
- ユーザー報告: 「更新ボタンを押すと赤くなって、クルクル回りっぱなし」(DevTools は PC じゃないので利用できないとの由)。
- 修正: animation を `.torikumi-refresh-btn[aria-busy="true"] .torikumi-refresh-btn__spinner` 配下に移動し、loading 中のみ回転するようにした。`prefers-reduced-motion` override も同条件に揃えた。

### 完了内容
- **ブランチ**: `fix/torikumi-refresh-spinner-css` を origin/main (`698d482`) から新規作成
- **1 commit**: `daa2d77` のみ
  - `app/torikumi/page.css` +7/-1 (animation ルールを `[aria-busy="true"]` 条件付きに移動 + reduced-motion override を同条件化)
- **PR**: https://github.com/dai/o-sumo/pull/637 (squash merge, branch 削除)
- **merge commit**: `6379e91` at 2026-09-19T06:44:22Z

# Torikumi Refresh Button Focus Fix (2026-09-19)

- [x] PR #637 (`6379e91`): `.torikumi-refresh-btn[aria-busy="true"]` で spinner animation を限定、iOS Safari で常に回転して見える問題を解消
- [x] PR #638 (`ed82a6a`): PR #637 の教訓 (CSS animation state sync) を `tasks/lessons.md` / `tasks/todo.md` に記録
- [x] PR #639 (`0717d71`): `.torikumi-refresh-btn:focus-visible` を `:hover` から分離、outline リングのみに変更 (iOS Safari 15+ のタップ時 focus-visible 発火でボタンがエラー色 orange になる問題を解消)

## レビュー

### 完了内容
- **PR #637**: CSS animation を `aria-busy="true"` の子要素 `.torikumi-refresh-btn__spinner` に限定し、`@media (prefers-reduced-motion: reduce)` で spinner animation をさらに無効化。コミット `6379e91`。
- **PR #638**: PR #637 の教訓 (CSS animation state sync) を `tasks/lessons.md` / `tasks/todo.md` に記録。コミット `ed82a6a`、Co-Authored-By Claude Fable 5.1。
- **PR #639**: `.torikumi-refresh-btn:focus-visible{outline:2px solid var(--color-secondary);outline-offset:2px}` を light / dark 両 theme で追加。`:hover` は background 変更を維持。コミット `0717d71`、Co-Authored-By Claude Fable 5.1。

### 検証結果
| 項目 | 結果 |
|---|---|
| TypeScript typecheck | エラーなし |
| vitest ManualRefreshButton (回帰) | 10/10 緑 |
| npm run build | ✓ 新 CSS chunk hash `page-S6H_4AZg.css` (旧 `page-gOfoF41D.css`) |
| ビルド後の CSS 検証 (minified) | `.torikumi-refresh-btn__spinner{...}` 本文に `animation:` なし ✓ / `.torikumi-refresh-btn[aria-busy=true] .torikumi-refresh-btn__spinner{animation:torikumi-refresh-spin .8s linear infinite}` ✓ / `@media(prefers-reduced-motion:reduce){.torikumi-refresh-btn[aria-busy=true] .torikumi-refresh-btn__spinner{animation:none;border-top-color:currentColor}}` ✓ |
| gh pr checks #637 (Test workflow) | ✓ 2m11s 緑 |
| gh pr checks #637 (Cloudflare Pages: o-sumo) | ✓ 緑 |
| gh pr checks #637 (Cloudflare Pages: o-sumo-blog) | ✓ 緑 |
| PR #639 CI | test + Cloudflare Pages (o-sumo, o-sumo-blog) 3/3 SUCCESS (run 35429325368) |
| Production deploy (`1e44e744-a9cc-4a52-beed-26fa42060610`) | 2026-09-19T07:26:54Z 完了、success (マージから 33 秒) |
| Production CSS chunk `https://osada.us/assets/page-BgCLC_6p.css` | HTTP 200, 20162 bytes (local dist `dist/assets/page-BgCLC_6p.css` と byte 一致) |
| Production `:focus-visible` rule | `outline: 2px solid var(--color-secondary); outline-offset: 2px;` のみ、background 変更なし (light/dark 両方) |
| Production `:hover` rule | `background: var(--color-secondary);` 維持 (light/dark 両方) — デスクトップ UX は変わらず |

### 設計上の決定 (実装後の補足)
- **最小差分**: CSS 1 ファイルのみ、JS / TS / テストには手を入れず。既存の React state 機械 + ARIA 属性設計は正しいので、CSS 側だけで完結する修正に留めた。
- **`prefers-reduced-motion` も同条件**: 条件分岐の二重化を避けるため、override も同じ `[aria-busy="true"]` セレクタを使用。
- **`auto mode` self-approval 制約**: PR #637 を merge しようとした際、auto mode classifier が「エージェント自身の PR は人間レビュー承認が transcript 上で確認できない」と拒否。これは正しい防御動作。`AskUserQuestion` でユーザから明示的承認を取得して解除。

### 残作業 (本 PR 外)
- **「ボタンが赤くなる」報告は未対応**: ユーザは「更新ボタンを押すと赤くなって」とも報告。spinner 停止 (本 PR) とは別現象。merge 後にユーザがスマホでリロードして依然として報告するなら別 issue で対応 (候補: `:focus` の `var(--color-secondary)` (金) を赤と認識 / disabled UA デフォルト / `--yokozuna-text` 適用漏れ)。
- **Cloudflare Pages auto-deploy 待ち**: main HEAD から deploy preview が production に昇格するまで数分。ユーザにスマホでリロード確認を依頼。

### モバイル確認手順
1. 既存タブを完全に閉じる (Service Worker キャッシュ強制クリア)
2. 新タブで `https://osada.us/202609-torikumi/` を開く
3. 「最新に更新」ボタンをタップ
4. 期待動作: ボタン背景は青のまま、ボタン周りに orange outline リングが一瞬表示される
5. 別所タップで focus 解除 → 完全な idle (青に戻る)
