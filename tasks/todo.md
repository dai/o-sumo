## 令和八年七月場所 番付更新 Todo（2026-06-29）

### Scope
- 対象は **七月場所の番付更新** を主軸にしつつ、関連する **トップページの三月場所導線復帰** を含む。
- 更新対象は `public/api/v1/banzuke.json`、`app/lib/sumo-data.ts`、必要に応じて `app/banzuke/page.tsx` / `app/lib/archive-basho-data.ts` / `docs/api/v1*.md` / `README*.md` とする。
- source of truth は相撲協会の番付・星取表系 endpoint（`ResultBanzuke/tableAjax` / `ResultData/hoshitoriAjax`）とし、更新後は UI / API / docs の整合を取る。

### Plan
- [x] 現行 `main` の番付データと UI 導線を確認し、七月場所番付更新の差分要件を明文化する
- [x] `scripts/update_sumo_data.py` と parser tests を確認し、今回の番付更新で必要な取得・変換条件を洗い出す
- [x] failing / regression test を追加または更新し、七月場所番付と三月場所ホーム導線の期待状態を固定する
- [x] 番付データを再生成し、`public/api/v1/banzuke.json` と `app/lib/sumo-data.ts` を更新する
- [x] `app/banzuke/page.tsx` と関連導線を確認し、current / archive の表示や文言にズレがあれば最小修正する
- [x] `README.md` / `README_en.md` / `docs/api/v1.md` / `docs/api/v1.en.md` など必要な運用 docs を同期する
- [x] `npm run typecheck` / `npm test -- --run` / 必要な Python unit / data sanity check を実行し、Review に結果を記録する

### Acceptance
- `banzuke.json` が七月場所の番付を返し、`updatedAt` が今回生成時刻へ更新されている
- `app/banzuke/page.tsx` で current route が七月場所番付を表示し、五月・三月 archive 導線が壊れていない
- `scripts/update_sumo_data.py` の番付取得ロジックがテストで担保されている
- docs の route 例・手順・確認ポイントが七月場所前提に揃っている

### Progress
- 最新 `origin/main@316610f` から `codex/202607-banzuke-update` を作成し、worktree `C:\Users\dai\.codex\worktrees\202607-banzuke\o-sumo` を切った
- `tasks/lessons.md` を再確認し、番付更新では `--torikumi-only` を使わず、`banzuke.json.updatedAt` まで確認する方針を継続する
- item 1 確認結果:
  - `public/api/v1/banzuke.json` は既に `bashoName=七月場所`、`year=令和八年`、`updatedAt=2026-06-29T14:30:39+09:00` 相当で、幕内42人・十両28人を満たしている
  - `app/banzuke/page.tsx` と `app/banzuke/page.test.tsx` は current=`/202607-banduke`、archive=`/202605-banduke` / `/202603-banduke` を前提に整っている
  - 差分要件としては **「七月場所へ切り替える」本体は main に既に入っており、今回ブランチで新たに必要なのは追加の regression 固定や次回更新に備えた確認・最小差分の洗い出し** が中心
- トップページ導線の確認結果:
  - `app/page.tsx` は `PAST_BASHO[0]` のみを `latestPastBasho` として描画しており、五月場所だけが表示対象になっている
  - `app/lib/archives-data.ts` には `202603` の三月場所データが残っているため、**三月場所が消えた原因はデータ欠落ではなくホーム導線の単一表示化**
- item 2 確認結果:
  - `scripts/update_sumo_data.py` は `load_banzuke_context()` で `bashoId` を番付ページから抽出し、`/ResultBanzuke/tableAjax/...` と `/ResultData/hoshitoriAjax/...` を Cookie 付きで取得する構成
  - `scripts/update_sumo_data_parser_test.py` には `and=mouse` / `game=cat` Cookie、`basho_id` の引き回し、年間日程からの初日抽出まで既に回帰テストがある
  - したがって現時点では、番付取得ロジックの欠陥修正より **UI regression と再生成条件の固定** を優先すべきと判断
- 三月場所導線の実装:
  - `app/page.test.tsx` に「トップページで三月場所 archive guidance を保持する」回帰テストを追加し、RED を確認
  - `app/page.tsx` は `PAST_BASHO[0]` 単体描画から `PAST_BASHO.map(...)` へ変更し、五月・三月の archive セクションを両方表示するよう修正
  - これによりトップページから `202603-banduke` / `202603-yotei` / `202603-torikumi` へ直接遷移できる状態に戻した
- 再生成結果:
  - `python scripts/update_sumo_data.py --torikumi-scope schedule --skip-rikishi-fetch` を実行
  - 差分は `public/api/v1/banzuke.json` / `public/api/v1/torikumi.json` / `app/lib/torikumi-data.ts` の `updatedAt` / `scheduleUpdatedAt` 更新のみ
  - `app/lib/sumo-data.ts` の rank データ自体に変更はなく、番付内容は既に `main` と整合していたことを確認
- 導線 / docs 確認結果:
  - `app/banzuke/page.tsx` は current=`202607`、archive=`202605` / `202603` の導線・表示をそのまま維持できているため追加修正なし
  - `README.md` / `README_en.md` / `docs/api/v1.md` / `docs/api/v1.en.md` は七月場所前提の手順と route 例に既に同期済みで、今回追加修正は不要

### Review
- TDD:
  - `npm test -- --run app/page.test.tsx`: fail → pass
  - fail 時の内容: `Home page > keeps March 2026 archive guidance on the top page` で `令和八年 三月場所` heading が見つからない
- Validation:
  - `npm run typecheck`: pass
  - `npm test -- --run`: pass（15 files / 69 tests）
  - `npm run build`: pass（既存の chunk size warning のみ）
  - `python -m unittest scripts.update_sumo_data_parser_test.OfficialBashoScheduleTest scripts.update_sumo_data_parser_test.PostJsonRequestHeadersTest scripts.update_sumo_data_parser_test.LoadBanzukeMetaRequestTest`: pass
  - data sanity:
    - `banzuke.json`: `bashoName=七月場所`, `year=令和八年`, `makuuchiRikishi=42`, `juryoRikishi=28`, `updatedAt=2026-06-29T16:26:01+09:00`
    - `torikumi.json`: `resultDays[0].pathDate=20260510`, `scheduleDays[0].pathDate=20260712`, `scheduleDays[0].status=published`
  - `git diff --check`: pass
- Environment:
  - 新 worktree には `node_modules` が無かったため、検証前に `npm ci` を実行

## Cloudflare Pages 反映後 verify 再実行 Todo（2026-06-29）

### Plan
- [x] Cloudflare Pages の反映先 URL と PR 状態を確認する
- [x] `verify_delivery_flow.ps1` を反映先に対して再実行する
- [x] preview / production の差異を切り分けて結果を記録する
- [x] 次の番付更新タスクへ移る前提条件を整理する

### Progress
- PR #94 の Cloudflare Pages check-run (`external_id=57894290-03ba-4018-8e87-35b4cc6e9242`) から、preview URL `https://57894290.o-sumo.pages.dev` と branch preview URL `https://codex-202607-july-basho-prep.o-sumo.pages.dev` を確認。
- `gh pr view 94 --json mergeStateStatus,statusCheckRollup` で、PR は `OPEN / READY / mergeStateStatus=CLEAN`、Cloudflare Pages check は `SUCCESS` で完了済みと確認。
- `pwsh ./scripts/verify_delivery_flow.ps1` を `https://osada.us` に対して再実行し、production は依然 `DATA_SYNC=OK / ROUTING_BEHAVIOR=ISSUE` と確認。
- `pwsh ./scripts/verify_delivery_flow.ps1 -BaseUrl https://codex-202607-july-basho-prep.o-sumo.pages.dev` を branch preview に対して再実行し、preview は `ROUTING_BEHAVIOR=OK` と確認。
- script は秒単位の report 名 (`delivery-flow-yyyyMMdd-HHmmss.md`) を使うため、parallel 実行では衝突する。今回は順次再実行し、証跡を `tasks/reports/delivery-flow-production-20260629.md` と `tasks/reports/delivery-flow-preview-codex-202607-july-basho-prep-20260629.md` に退避。

### Review
- Cloudflare reflection:
  - `gh api repos/dai/o-sumo/commits/<HEAD>/check-runs`: pass
  - 結果: `Cloudflare Pages` check run success、preview URL `https://57894290.o-sumo.pages.dev`、branch preview URL `https://codex-202607-july-basho-prep.o-sumo.pages.dev`
- production verify:
  - `pwsh ./scripts/verify_delivery_flow.ps1`: pass
  - 結果: `DATA_SYNC=OK`, `ROUTING_BEHAVIOR=ISSUE`
  - 追加 header check: `https://osada.us/archives -> 308 /`、`https://osada.us/20260512-yotei -> 308 /`
  - 解釈: PR #94 は **まだ `main` 未反映** のため、production `https://osada.us` は旧 routing のまま
- preview verify:
  - `pwsh ./scripts/verify_delivery_flow.ps1 -BaseUrl https://codex-202607-july-basho-prep.o-sumo.pages.dev`: pass
  - 結果: `DATA_SYNC=ISSUE`, `ROUTING_BEHAVIOR=OK`
  - 追加 header check: `https://codex-202607-july-basho-prep.o-sumo.pages.dev/archives -> 301 /archives/`、`https://codex-202607-july-basho-prep.o-sumo.pages.dev/20260512-yotei -> 301 /20260512-yotei/`
  - 解釈: routing 修正自体は Cloudflare Pages preview で反映済み。`DATA_SYNC=ISSUE` は script が `origin/main` を比較元に固定しているためで、preview が branch 先頭 `f32efe6` を配信していることと整合する
- next for banzuke:
  - 次の番付更新系作業では、`scripts/update_sumo_data.py` の `ResultBanzuke/tableAjax` / `ResultData/hoshitoriAjax` 経由更新と、`public/api/v1/banzuke.json.updatedAt` / `app/lib/sumo-data.ts` / `app/banzuke/page.tsx` の 3点確認を起点にする
  - production で `verify_delivery_flow.ps1` の `ROUTING_BEHAVIOR=OK` を確認するには、PR #94 の `main` 反映後に `https://osada.us` へ再実行が必要

## PR 仕上げ Todo（2026-06-29）

### Plan
- [x] ローカル残差分を精査し、commit 対象と除外対象を切り分ける
- [x] delivery-flow レポートを tasks 配下の証跡として commit する
- [x] PR タイトル / 本文 / Draft 状態を整える
- [x] push 後に状態を再確認し、Review を追記する

### Progress
- `git status` で未コミット差分は `app/lib/sumo-data.ts` / `app/lib/torikumi-data.ts` / `public/api/v1/banzuke.json` / `public/api/v1/torikumi.json` と `tasks/reports/delivery-flow-20260629-150901.md` であることを確認。
- 4つの生成物差分は、ローカル検証時の `python scripts/update_sumo_data.py --torikumi-scope schedule` 再実行により **current mixed-state を崩したローカル差分** であり、PR に含めるべき変更ではないと判断。
- `git checkout -- <4 files>` で生成物差分を破棄し、commit 対象を `tasks/reports/delivery-flow-20260629-150901.md` のみへ整理。

### Review
- cleanup:
  - `git checkout -- app/lib/sumo-data.ts app/lib/torikumi-data.ts public/api/v1/banzuke.json public/api/v1/torikumi.json`: pass
  - 結果: ローカル検証で崩れた generated diff を除去し、残差分は `tasks/todo.md` と `tasks/reports/delivery-flow-20260629-150901.md` のみ
- diff health:
  - `git diff --check`: pass
- PR state:
  - `gh pr ready 94 --undo`: pass（PR #94 を metadata 更新のため draft 化）
- commit / push:
  - `git commit -m "docs(tasks): add delivery flow verification report"`: pass（`2269905`）
  - `git push`: pass（`codex/202607-july-basho-prep` -> `origin/codex/202607-july-basho-prep`）
- PR finalize:
  - `gh pr edit 94 --title "2026年七月場所準備と配信ルーティング正規化" --body ...`: pass
  - `gh pr ready 94`: pass（PR #94 を ready for review に復帰）
- final status:
  - `git status --short`: clean

## 令和八年七月場所準備 Todo（2026-06-29）

### Plan
- [x] `202607` ブランチを最新 `main` から切り、独立 worktree で作業する
- [x] current basho を `202607` に切り替える failing tests を追加する
- [x] 五月場所を static archive 化し、routes / home / archives / banzuke / hub の導線を更新する
- [x] 七月場所データを再生成し、README / DEVELOPMENT / API docs の手順を同期する
- [x] typecheck / test / build / データ sanity check を実行して Review に記録する

### Progress
- `C:\Users\dai\.codex\worktrees\202607\o-sumo` を `main@7543e867` から `git worktree add -b 202607 ... main` で作成。
- 現行 repo を確認し、current basho はまだ五月場所、archives は三月場所のみ、docs は 2026-04-27 の五月場所切替手順が残っていることを確認。
- 五月場所を archive として維持するには、現在の `torikumi-data.ts` / `sumo-data.ts` 相当を static snapshot 化する必要があることを確認。
- `app/lib/may2026-data.ts` と `app/lib/may2026-banzuke-data.ts` を追加し、五月場所の結果・番付を static archive として固定化。
- `app/lib/archive-basho-data.ts` と `app/lib/torikumi-routes.ts` を中心に、current basho を `202607`、archive を `202605` / `202603` で共存させる導線へ更新。
- `scripts/update_sumo_data.py` に `ResultBanzuke/tableAjax` / `ResultData/hoshitoriAjax` の Cookie 対応、年間日程からの初日抽出、LF 固定書き出しを追加。
- `public/api/v1/torikumi.json` は `bashoName = 七月場所`、`scheduleDays[0].pathDate = 20260712`、`resultDays[0].pathDate = 20260510` の mixed current/archive 仕様へ再生成。
- README / DEVELOPMENT / API docs / runbook を、2026-06-29 の七月場所番付発表時点の手順と route 例へ同期。

### Review
- Python unit:
  - `python -m unittest scripts.update_sumo_data_parser_test.OfficialBashoScheduleTest scripts.update_sumo_data_parser_test.PostJsonRequestHeadersTest scripts.update_sumo_data_parser_test.LoadBanzukeMetaRequestTest`: pass
- Data sanity:
  - `python scripts/update_sumo_data.py --torikumi-scope schedule`: pass
  - `public/api/v1/torikumi.json`: `bashoName=七月場所`, `resultDays[0].pathDate=20260510`, `scheduleDays[0].pathDate=20260712`, `scheduleDays[0].status=published`
- Typecheck:
  - `npm run typecheck`: pass
- Test:
  - `npm test -- --run`: pass（15 files / 68 tests）
- Build / diff:
  - `npm run build`: pass（既存の chunk size warning のみ）
  - `git diff --check`: pass

## 七月場所着手準備 Re-verification（worktree `202607` 上での 2026-06-29 ハンドオフ確認）

### Plan
- [x] worktree `C:\Users\dai\.codex\worktrees\202607\o-sumo` の HEAD `fe4c3af` を `main@7543e86` と比較し、Phase 1〜5 の大半が既コミット済みであることを確認する
- [x] worktree 上で `npm run typecheck` / `npm test -- --run` / `npm run build` を再走させ、コミット時点と同等の緑であることを確認する
- [x] impeccable `detect.mjs --json` を編集対象 TSX/CSS に走らせ、No-Line / gradient text / side-stripe / 1px border の違反がないことを確認する
- [x] `tasks/todo.md` の Review に再検証ログを追記する
- [x] `tasks/lessons.md` に「2026-07 着手準備」節を追加し、`tasks/lessons.md` で 7 月着手時のチェックポイントを明文化する
- [ ] workflow スケジュール再開（2026-07-01 JST 以降）と PR 化は次セッションで判断

### Progress
- `git switch 202607` 後、`git status` は clean、`git log --oneline -5` は `fe4c3af 令和八年七月場所の準備を反映` で頭。
- `main` 上に `stash@{0,1}` の未適用 WIP（`用料→取組予定` 関連）が残っているが、指示に従い **触らず** 七月準備へ進む方針を確認。
- `fe4c3af` で既に五月場所は `app/lib/may2026-data.ts` + `app/lib/may2026-banzuke-data.ts` にスナップショット化、`app/lib/archive-basho-data.ts` が current/archive の単一エントリポイントとして導入されている。
- `app/page.tsx` は `torikumiArchive` / `PAST_BASHO[0]` 駆動の動的構成へ、championship-table は削除。五月の最終結果は `PAST_BASHO` 経由で archives ページ側に集約済み。
- `app/main.tsx` の静的ルートは `CURRENT_BANZUKE_PATH` / `CURRENT_RESULT_PATH` / `CURRENT_SCHEDULE_PATH` 経由の汎用化、五月アーカイブは明示ルートで温存。
- `scripts/update_sumo_data.py` は年間日程からの初日抽出、`ResultBanzuke/tableAjax` / `ResultData/hoshitoriAjax` の Cookie 対応、LF 固定書き出しを追加。
- `public/api/v1/torikumi.json` は `bashoName = 七月場所`、`resultDays[0].pathDate = 20260510`（五月アーカイブ維持）、`scheduleDays[0].pathDate = 20260712`（七月予定）の mixed current/archive 仕様。
- README / DEVELOPMENT / API policy / runbook は全て 2026-06-29 の七月場所番付発表時点の手順へ同期済み。
- 検証ログは本エントリの Review に集約（再走結果の詳細は commit 時点の Review ブロックから参照可能）。

### Review
- 検証端末: `C:\Users\dai\.codex\worktrees\202607\o-sumo`、`$env:Path = "C:\nvm4w\nodejs;" + $env:Path` を前置
- Typecheck:
  - `npm run typecheck`: pass（exit 0、stderr なし）
- Test:
  - `npm test -- --run`: pass（15 files / 68 tests、所要 18.57s）
  - 新規ケース: `BanzukePage > renders July 2026 as the default current banzuke route and keeps May 2026 as an archive route`、`BanzukePage > renders May 2026 archive data for the 202605 route` を確認
- Build:
  - `npm run build`: pass（exit 0、117 modules transformed、既存の chunk size warning のみ）
  - PWA: precache 84 entries (11990.65 KiB)
- Design lint:
  - `node .claude/skills/impeccable/scripts/detect.mjs --json <編集10ファイル>`: pass（出力 `[]`、violation ゼロ）
  - 編集対象: `app/page.tsx` / `app/main.tsx` / `app/archives/page.tsx` / `app/banzuke/page.tsx` / `app/components/TorikumiDayPage.tsx` / `app/lib/archives-data.ts` / `app/lib/torikumi-routes.ts` / `app/lib/archive-basho-data.ts` / `app/index.css` / `app/styles/banzuke.css`
- Diff / 状態:
  - `git status`: clean、HEAD は `fe4c3af`
  - `git diff --check`: pass
- 未実施項目（次セッション判断）:
  - workflow `schedule:` ブロックの復活（2026-07-01 JST まで `workflow_dispatch` のみという条件を尊重し、当面は据え置き）

## 末尾スラッシュ正規化（308 → 301）修正 Todo（2026-06-29）

### Plan
- [x] `pwsh ./scripts/verify_delivery_flow.ps1` を worktree 上で実行し、`DATA_SYNC` / `ROUTING_BEHAVIOR` のスナップショットを採取する
- [x] `tasks/reports/delivery-flow-20260629-150901.md` を Read し、`/archives` / `/-yotei` の 308 → `/` のトラップをリストアップする
- [x] `public/_redirects` を splat 名揃えの 301 redirect ベースへ全面改訂する
- [x] 修正後に `npm run build` / `npm run typecheck` で退行がないことを確認する
- [x] 修正 commit を作成する
- [ ] 修正を `origin/202607` へ push し、本番反映後に `pwsh ./scripts/verify_delivery_flow.ps1` を再度走らせて `ROUTING_BEHAVIOR=OK` を観測する（次セッション判断）

### Progress
- `pwsh ./scripts/verify_delivery_flow.ps1`: pass（`DATA_SYNC=OK`, `ROUTING_BEHAVIOR=ISSUE`）→ `tasks/reports/delivery-flow-20260629-150901.md` に出力。
- 失敗ケースの内訳:
  - `/archives` (308 → `/`)
  - `/20260512-yotei` (308 → `/`)
- 既に正常なケース: `/202605-torikumi` (301 → `/202605-torikumi/`)、`/20260512-torikumi` (301 → `/20260512-torikumi/`)
- `public/_redirects` の全面改訂方針:
  - `/archives /archives/ 301`、`/rikishi /rikishi/ 301` を追加
  - `/:slug-torikumi /:slug-torikumi/ 301` を splat 名揃えの正規 redirect へ固定
  - `/:slug-yotei /:slug-yotei/ 301` を新設（旧来の `/*-yotei /index.html 200` の 308 トラップを除去）
  - `/*-o-sumo /:slug-banduke/ 301` を splat 名揃えの redirect へ変更
  - 末尾スラッシュあり変種は `index.html 200` の SPA fallback に統一
- `npm run build`: pass（117 modules transformed、既存の chunk size warning のみ）
- `npm run typecheck`: pass

### Review
- 修正前レポート: `tasks/reports/delivery-flow-20260629-150901.md`
  - `DATA_SYNC=OK`、`ROUTING_BEHAVIOR=ISSUE`
  - `/archives` 308、`/20260512-yotei` 308 が対象
- 修正後 build / typecheck: pass
- 修正後 delivery-flow: worktree からは `_redirects` の効果は観測できない（Cloudflare Pages の評価器に依存）。本番反映後の再走で `ROUTING_BEHAVIOR=OK` を確認する
- 影響範囲:
  - `/archives` / `/rikishi` / `/*-torikumi` / `/*-yotei` / `/*-o-sumo` の **末尾スラッシュなし静的パス** が 301 redirect 化される
  - 五月・三月の **既存アーカイブ導線** は壊れない（既に 301 redirect 経由だったページを、より短い redirect hop で正しく正規 URL に着地させる）
  - 7 月場所予定 `/{YYYYMMDD}-yotei` の feed からの流入も 308 → `/` ではなく 301 → 正規 URL に変わる

## 五月場所 最終反映（番付15日目 + 最終結果セクション）Todo（2026-05-25）

### Plan
- [x] `scripts/update_sumo_data.py` に、公開済み `resultDays` から星取りを再構築する処理を追加する
- [x] 星取り補完ロジックの回帰テストを `scripts/update_sumo_data_torikumi_logic_test.py` に追加する
- [x] `app/page.tsx` の動的優勝争い表示を固定の「令和八年五月場所最終結果」表へ差し替える
- [x] `src/locales/ja/common.json`（+ `en`）に最終結果表示の文言キーを追加する
- [x] `public/api/v1/banzuke.json` と `app/lib/sumo-data.ts` を再生成し、15日目星取りを反映する
- [x] typecheck / 対象テスト / データ検証を実行して結果を記録する

### Progress
- `scripts/update_sumo_data.py` に `build_profile_day_marks()` / `apply_result_days_to_rank_groups()` を追加。
- 補完ロジックは `resultDays(status=published)` をソースに、各日ごとに `match.winner` と `absentees` から `win/loss/draw` を構築。未明示力士は公開日上の休み（`draw`）として扱う実装にした。
- `main()` の書き出し前に補完処理を挿入し、`makuuchi` と `juryo` の `results` / `wins` / `losses` / `draws` を再計算するようにした。
- `scripts/update_sumo_data_torikumi_logic_test.py` に、15日目データ欠落時でも15日分へ補完されるテストを追加。
- `app/page.tsx` の championship 算出関数群を削除し、固定の最終結果テーブルへ置換。
- `src/locales/ja/common.json` / `src/locales/en/common.json` に最終結果テーブル用キーを追加。
- ローカル `torikumi.json` を正として `public/api/v1/banzuke.json` と `app/lib/sumo-data.ts` を再生成し、星取り15日目を反映。

### Review
- データ検証:
  - `node` で `banzuke.json` を検証
  - 結果: `total=70`, `all15=true`, `若隆景=12勝3敗0休`, `resultsLen=15`
- Pythonテスト:
  - `python scripts/update_sumo_data_torikumi_logic_test.py`: pass
- Typecheck:
  - `npm run typecheck`: pass
- 対象UIテスト:
  - `npm test -- --run app/page.test.tsx app/banzuke/page.test.tsx`: pass（2 files / 8 tests）
- 全体テスト:
  - `npm test -- --run`: fail（既存の `app/torikumi/page.test.tsx` が「休場者:」固定期待で失敗）
  - 失敗内容は今回変更範囲外（schedule hub の休場表示期待値と現データの乖離）

## PR/ブランチ/更新停止の整理 Todo（2026-05-25）

### Plan
- [x] 不要workflow（`copilot-setup-steps.yml`）を削除する
- [x] `daily-data-update.yml` / `realtime-torikumi-update.yml` を `workflow_dispatch` のみに変更する
- [x] README / DEVELOPMENT / API policy の更新運用を「2026-07-01 JST まで手動実行のみ」へ同期する
- [x] Open PRを除外した安全条件で remote/local ブランチを整理する
- [x] workflow / 文言 / ブランチ状態を検証して結果を記録する

### Progress
- `.github/workflows/copilot-setup-steps.yml` を削除。
- `.github/workflows/daily-data-update.yml` と `.github/workflows/realtime-torikumi-update.yml` の `schedule` を削除し、`workflow_dispatch` のみへ変更。
- `README.md` / `README_en.md` / `DEVELOPMENT.md` / `DEVELOPMENT_en.md` / `docs/api/policy.md` / `docs/api/policy.en.md` を「自動実行停止（2026-07-01 JST まで）・手動実行のみ」へ同期。
- `gh pr list --state open` を事前確認し、Open PRブランチ4本を保持したまま、対象remote 16本を削除。
- local mergedブランチ4本（`codex/official-absence-fusen`, `codex/rikishi-202605-mit-license`, `copilot-renovate`, `docs/bilingual-doc-refresh`）を削除。

### Review
- workflow確認:
  - `Get-ChildItem .github/workflows -File | Select-Object -ExpandProperty Name`
  - 結果: `daily-data-update.yml`, `realtime-torikumi-update.yml`, `test.yml`（`copilot-setup-steps.yml` 不在）
  - `rg -n "^\\s*schedule:" .github/workflows/daily-data-update.yml .github/workflows/realtime-torikumi-update.yml`
  - 結果: 該当なし（exit 1）
- ドキュメント確認:
  - `rg -n "copilot-setup-steps\\.yml|JST 15:30|JST 14:00, 14:30, 15:00|自動実行します|runs both the daily refresh|Schedule: JST 15:30 and 20:00|schedule: during basho days" README.md README_en.md DEVELOPMENT.md DEVELOPMENT_en.md docs/api/policy.md docs/api/policy.en.md -S`
  - 結果: 該当なし（exit 1）
- ブランチ確認:
  - `gh pr list --state open --limit 200 --json number,headRefName,title`
  - 結果: Open PR 4本（`codex/fix-changes-not-reflecting-after-merging-pr83*`）は保持。
  - `git branch --format "%(refname:short)"`
  - 結果: `codex/rikishi-profile-pages`, `main`
  - `git branch -r --format "%(refname:short)"`
  - 結果: `origin/main` と保持対象remoteのみ残存。

# GitHub Mobile + Copilot Cloud Agent 運用整備 Todo（2026-05-19）

## Plan
- [x] `.github/copilot-instructions.md` を追加し、Cloud agent の実行ルールと必須コマンドを固定化する
- [x] `.github/workflows/copilot-setup-steps.yml` を追加し、Node/Python依存の事前セットアップ手順を定義する
- [x] `README.md` に GitHub Mobile 運用フロー（Issue→Agent→PR→merge）を追記する
- [x] `npm run typecheck` / `npm test -- --run` / `npm run build` で変更影響を検証して Review に記録する

## Progress
- `.github/copilot-instructions.md` を新規追加し、必須チェック（`npm ci` / `typecheck` / `test` / `build`）とデータ更新コマンド、生成物レビュー対象、`main` 直push回避を明記。
- `.github/workflows/copilot-setup-steps.yml` を新規追加し、`workflow_dispatch` を含む `copilot-setup-steps` job で `setup-node` / `setup-python` / `npm ci` を実行する構成を追加。
- `README.md` に `## GitHub Mobile + Copilot 運用` セクションを追加し、iPhone での週末運用手順を短く固定化。

## Review
- `python`（PyYAML）で `.github/workflows/copilot-setup-steps.yml` の構文を確認: pass
- `npm run typecheck`: pass
- `npm test -- --run`: pass（14 files / 62 tests）
- `npm run build`: pass（既存の chunk size 警告のみ）

# 八日目（中日）結果未更新の修正 Todo（2026-05-18）

## Plan
- [x] `origin/main` 生成物 / GitHub Actions 実行状況 / 本番API の3点で、八日目未更新が配信か生成かを切り分ける
- [x] 相撲協会APIの取得失敗原因を特定し、`scripts/update_sumo_data.py` の `torikumiAjax` リクエストを修正する
- [x] 回帰テストを追加し、五月場所データを再生成して八日目結果と番付星取を更新する
- [x] 既存のUIテストを実データ固定依存から外し、検証結果を Review に記録する

## Progress
- `public/api/v1/torikumi.json` と `https://osada.us/api/v1/torikumi.json?ts=...` の双方で、修正前は八日目(`20260517`)が `pending / 結果未更新` のまま止まっていることを確認。
- `gh run list --workflow "Realtime Torikumi Update"` と `gh run view --log` で、workflow 自体は成功している一方、`torikumiAjax` が全日 403 で落ちていたことを確認。
- 相撲協会 `torikumi` ページのHTMLに `document.cookie = "mischeief=OK"` が含まれ、`torikumiAjax` POST へ `Cookie: mischeief=OK` を付けると 200 + 正常JSONを返すことを確認。
- `scripts/update_sumo_data.py` の `post_json()` で `torikumiAjax` に対し `Referer` と `Cookie: mischeief=OK` を付与するよう修正。
- `scripts/update_sumo_data_parser_test.py` に `torikumiAjax` の Cookie 付与回帰テストを追加。
- `python scripts/update_sumo_data.py --torikumi-scope result --skip-rikishi-fetch` を実行し、八日目結果と番付星取を再生成。
- `app/components/TorikumiDayPage.test.tsx` の「八日目が pending」という固定前提をやめ、合成データで schedule fallback を検証する形へ修正。

## Review
- 再生成後の `public/api/v1/torikumi.json`:
  - `resultUpdatedAt`: `2026-05-18T10:00:08+09:00`
  - 八日目(`20260517`) `status=published`
  - 八日目の取組件数: `幕内19 / 十両14`
- 回帰テスト:
  - `python -m unittest scripts.update_sumo_data_parser_test.PostJsonRequestHeadersTest.test_torikumi_ajax_request_sets_mischeief_cookie`: pass
- アプリ検証:
  - `npm run typecheck`: pass
  - `npm test -- --run`: pass
  - `npm run build`: pass（既存の chunk size 警告のみ）
  - `git diff --check`: pass
- push後フォロー:
  - `app/components/TorikumiDayPage.test.tsx` の `ArchiveRouteConfig` mock に `monthKey` を追加し、`npm run typecheck` と `npm test -- --run app/components/TorikumiDayPage.test.tsx` の再通過を確認。

# Realtime更新欠落の是正（監視追加 + ドキュメント同期）Todo（2026-05-15）

## Plan
- [x] `realtime-torikumi-update.yml` に JST 19:00 / 20:00 枠を正式化し、JST 20:30 の監視ジョブを追加する
- [x] Realtime/Daily workflow ログに `event.schedule`・JST 時刻・`resultUpdatedAt`/`scheduleUpdatedAt` を出力する
- [x] 日次/結果更新の責務分離と切り分け手順を README/DEVELOPMENT/APIポリシーへ同期する
- [x] YAML 構文・`typecheck`・`build` で検証し、レビューを記録する

## Progress
- `realtime-torikumi-update.yml`:
  - schedule に `30 20 * * *`（JST 20:30 監視）を追加。
  - `update-torikumi` ジョブを `20:30` では実行しない条件へ変更。
  - `monitor-result-freshness` ジョブを追加し、`https://osada.us/api/v1/torikumi.json` の `resultUpdatedAt` 当日性を判定して warning 出力。
  - `event.schedule` / JST 現在時刻 / `updatedAt` 系をログ出力する step を追加。
- `daily-data-update.yml`:
  - `event.schedule` / JST 現在時刻 / `updatedAt` 系のログ出力 step を追加。
- ドキュメント同期:
  - `README.md`, `README_en.md`, `DEVELOPMENT.md`, `DEVELOPMENT_en.md`, `docs/api/policy.md`, `docs/api/policy.en.md` を更新。
  - 更新時刻、責務分離（Daily=予定のみ / Realtime=結果+予定+番付）、20:30監視、切り分け順（run履歴→runログ→供給元 judge）を明記。

## Review
- `python`（PyYAML）で workflow 構文を確認:
  - `ok: .github/workflows/realtime-torikumi-update.yml`
  - `ok: .github/workflows/daily-data-update.yml`
- `npm run typecheck`: pass
- `npm run build`: pass（既存の chunk size 警告のみ）
- `git diff --check`: pass

---

# 六日目取組予定反映（2026-05-14） Todo

## Plan
- [x] 六日目取組の公開有無を相撲協会APIで確認する
- [x] 六日目データを`torikumi.json`へ反映する
- [x] 六日目未公開部門で全員休場が出ないよう休場算出を修正する
- [x] `typecheck`と`build`で検証する

## Review
- 六日目(`20260515`)は`status=published`、`makuuchiMatches=19`、`juryoMatches=0`へ更新。
- 六日目十両は未公開のため`juryoAbsentees=0`（全員休場表示なし）を確認。
- 五日目結果(`20260514`)は`published`を維持。
- `npm run typecheck` / `npm run build` はともに成功。

---
# 五月場所 五日目結果未更新・六日目以降休場化 修正 Todo

## Plan
- [x] `public/api/v1/torikumi.json`で五日目結果と六日目以降の休場化を再確認する
- [x] `scripts/update_sumo_data.py`の当日判定と休場算出ロジックを修正する
- [x] 既存データを正規化して`app/lib/torikumi-data.ts`と`public/api/v1/torikumi.json`へ反映する
- [x] 自動更新ワークフローを`result`限定から`all`更新へ変更する
- [x] 番付の星取ステータス整合性を機械検証する
- [x] `npm run typecheck`と`npm run build`で検証する

## Progress
- 五日目(`20260514`)の`resultDays`は取組33件が存在するのに`pending/結果未更新`だった。
- 六日目以降(`20260515`〜`20260524`)は`matches: []`なのに`absentees`が幕内42/十両28で全員休場化していた。
- `derive_absentees()`にガードを追加し、当日アクティブIDが空の日は休場配列を空にするよう修正。
- `effective_today_day`算出を、決まり手確定日だけでなく「取組件数がある最新日」も考慮するよう修正。
- 既存`torikumi.json`を正規化して、取組がある`resultDays`を`published`へ補正し再出力。
- `.github/workflows/realtime-torikumi-update.yml`の実行コマンドを`--torikumi-scope all`へ変更。
- 番付星取は70力士すべて整合（不正レコード0件）を確認。

## Review
- `20260514`の`resultDays`は`published`となり、`statusMessage: null`へ修正済み。
- `20260515`以降は`matches: []`かつ`absentees: []`で、全員休場表示は解消。
- 番付星取の検証結果: `invalidRecords=0`、`wins+losses+draws`分布は`3:24名 / 4:46名`。
- `npm run typecheck`: pass
- `npm run build`: pass（既存chunk size警告のみ）

---
# 三月場所取組データ修正 Todo

## Plan
- [x] `main`を`origin/main`へfast-forward同期する
- [x] 同期後の三月場所`resultDays`と`scheduleDays`を確認する
- [x] 三月場所アーカイブの日付混入を検出する回帰テストを追加する
- [x] `app/lib/march2026-torikumi-data.ts`の`scheduleDays`を三月場所データへ修正する
- [x] `npm run typecheck`、`npm test -- --run`、`npm run build`で検証する
- [x] 差分を確認し、レビュー結果を記録する

## Progress
- `git pull --ff-only origin main`はfast-forwardで完了。
- 同期後も`MARCH2026_TORIKUMI_DATA.scheduleDays`は`20260510`から`20260524`のpendingデータで、三月場所予定として不整合。
- 回帰テスト追加後、対象テストは`20260510`混入を検出して失敗することを確認。
- `scheduleDays`を`resultDays`から生成し、全日`20260308`から`20260322`、`published`、`statusMessage: null`へ修正。
- 対象テスト`npm test -- --run app/lib/torikumi-routes.test.ts app/torikumi/page.test.tsx`は16件通過。
- `npm run typecheck`はexit 0。
- `npm test -- --run`は13ファイル53件通過。
- `npm run build`はexit 0。既存のchunk size警告のみ。

## Review
- `MARCH2026_TORIKUMI_DATA.resultDays`は15日分、`20260308`から`20260322`、全件`published`、winner欠落0件。
- `MARCH2026_TORIKUMI_DATA.scheduleDays`は15日分、`20260308`から`20260322`、全件`published`、`statusMessage: null`。
- 予定データは508取組で、全取組`kimarite: "未定"`、`winner: null`。
- `app/lib/march2026-torikumi-data.ts`内に`202605`、`取組予定未更新`、`"status": "pending"`の残存はなし。

---

# 力士プロフィール出身地回帰 Todo

## Plan
- [x] `出身地`表示がどこで壊れているかを、UI・JSON・生成スクリプトで切り分ける
- [x] 回帰を再現するテストを追加する
- [x] `scripts/update_sumo_data.py`のプロフィールHTMLパーサーを修正する
- [x] `public/api/v1/rikishi*.json`を再生成して不正データを置き換える
- [x] テストとビルドで回帰が消えたことを確認する

## Progress
- 表示側ではなく、`public/api/v1/rikishi/*.json`の`shusshin`に番付文字列が混入していることを確認。
- 原因は`ProfileParser.handle_data()`が`出身地`だけでなく`熊本県出身の他の力士`のような関連見出しにも部分一致で反応し、後続の番付文字列で`shusshin`を上書きしていたこと。
- `app/lib/rikishi-profile-data.test.ts`で、保存済みプロフィールJSONに番付文字列が入っていないことを検証する回帰テストを追加。
- `scripts/update_sumo_data_parser_test.py`で、`出身地`取得後に「出身の他の力士」セクションが続いても上書きされないことを検証する回帰テストを追加。
- `scripts/update_sumo_data.py --rikishi-only`で70件のプロフィールJSONを再生成。

## Review
- `python scripts/update_sumo_data_parser_test.py`: pass
- `npm test -- --run app/lib/rikishi-profile-data.test.ts app/rikishi/page.test.tsx`: 5件 pass
- `npm test -- --run`: 14ファイル54件 pass
- `npm run build`: exit 0。既存のchunk size警告のみ
- `rankLikeShusshin`チェックで、番付文字列に化けた`shusshin`は0件

---

# 力士辞書追加とMITライセンス切替 Todo

## Plan
- [x] `origin/main`から`codex/rikishi-202605-mit-license`を作成する
- [x] `rikishi-202605.txt`をルートに追加し、LF固定を設定する
- [x] README/README_enに辞書ダウンロードリンクと登録方法リンクを追加する
- [x] package metadata、LICENSE、画像READMEのライセンス表記をMITへ統一する
- [x] 辞書形式、ライセンス表記、型チェック、テスト、ビルド、差分チェックで検証する
- [x] コミットしてfeature branchをpushする

## Progress
- `origin/main`起点で`codex/rikishi-202605-mit-license`を作成。
- `C:/2026/04/rikishi_2026_05_draft_Version3.txt`の内容を正本として`rikishi-202605.txt`を追加。
- `.gitattributes`に`rikishi-202605.txt text eol=lf`を追加。
- `README.md`と`README_en.md`に辞書リンクと登録方法リンクを追加。
- `package.json`、`package-lock.json`、`LICENSE`、`public/images/rikishi/README.md`をMIT表記へ更新。
- 辞書形式は146行、全行3カラム、CRなし。
- `npm run typecheck`はexit 0。
- `npm test -- --run`は14ファイル54件通過。
- `npm run build`はexit 0。既存のchunk size警告のみ。
- `git diff --check`はexit 0。
- コミットを作成し、feature branchをpushする。

## Review
- `README.md`と`README_en.md`は辞書ファイルへの相対リンク`./rikishi-202605.txt`と登録方法X記事リンクを含む。
- ルートpackage metadataは`package.json`、`package-lock.json`ともに`MIT`。
- `public/images/rikishi/README.md`の日本語・英語ライセンス表記はMITへ更新済み。
- `.gitattributes`で`rikishi-202605.txt`はLF固定。

---

# 配信フロー切り分け基盤整備 Todo

## Plan
- [x] `scripts/verify_delivery_flow.ps1`を追加し、`origin/main`生成物・本番API・配信URLヘッダを同時検証できるようにする
- [x] `package.json`へ`verify:delivery-flow`を追加し、再実行手順を固定化する
- [x] `tasks/reports/delivery-flow-<timestamp>.md`へ`DATA_SYNC`/`ROUTING_BEHAVIOR`判定を出力する
- [x] `tasks/lessons.md`を新規作成し、UI起因と配信起因を先に分離する運用ルールを記録する
- [x] `pwsh ./scripts/verify_delivery_flow.ps1`と`npm run verify:delivery-flow`を実行する
- [x] `npm run typecheck`と対象テストを実行し、既存状態の影響をレビューに記録する

## Progress
- `scripts/verify_delivery_flow.ps1`を追加。`origin/main:public/api/v1/torikumi.json`と`https://osada.us/api/v1/torikumi.json`の`updatedAt`系および`20260512`結果件数を比較する実装を追加。
- 同スクリプトで`/archives`、`/202605-torikumi`、`/20260512-torikumi`（各末尾スラッシュ有無）をヘッダ検証し、`308 -> /`を検出したら`ROUTING_BEHAVIOR=ISSUE`と判定する実装を追加。
- `npm run verify:delivery-flow`を`package.json`へ追加。
- レポートを`tasks/reports/delivery-flow-20260513-105844.md`へ出力。
- `tasks/lessons.md`を新規作成し、再発防止ルールを記録。

## Review
- `pwsh ./scripts/verify_delivery_flow.ps1`: pass  
  - `DATA_SYNC=OK`
  - `ROUTING_BEHAVIOR=ISSUE`
  - `REPORT_PATH=tasks/reports/delivery-flow-20260513-105835.md`
- `npm run verify:delivery-flow`: pass  
  - `DATA_SYNC=OK`
  - `ROUTING_BEHAVIOR=ISSUE`
  - `REPORT_PATH=tasks/reports/delivery-flow-20260513-105844.md`
- `npm run typecheck`: fail（既存の未解決競合マーカー起因）  
  - `app/lib/torikumi-routes.ts`に`TS1185: Merge conflict marker encountered`
- `npm test -- --run app/lib/torikumi-routes.test.ts app/torikumi/page.test.tsx`: fail（同上）  
  - `app/lib/torikumi-routes.ts`の`Unexpected "<<"`でtransform失敗
- 判定:
  - 三日目結果（`20260512`）は`origin/main`と本番APIで一致（結果欠損ではない）
  - 末尾スラッシュなしURLは本番で`308 -> /`となり、配信ルーティング課題として独立管理すべき

---

# 五月場所更新導線・更新ロジック修正 Todo（3月場所不変更）

## Plan
- [x] `app/lib/torikumi-routes.ts` の未解決マージコンフリクトを解消し、更新時刻メッセージを新仕様へ更新する
- [x] `getHubPath` / `getHubPathForDateKey` / `getDayPath` を末尾スラッシュ付き正規URL返却へ統一する
- [x] 主要導線（ホーム・番付・取組一覧・日別・力士プロフィール）を末尾スラッシュ付きリンクへ統一する
- [x] `public/_redirects` に末尾スラッシュ有無両方のSPA fallbackを追加する
- [x] `global.may2026UpdateNotice` を補間テンプレート化し、公開済み`scheduleDays`最終日から `n日目` を自動算出する
- [x] workflow を更新し、結果＋番付更新時刻と予定更新時刻を要件どおりに再編する
- [x] `scripts/update_sumo_data.py` に `--skip-rikishi-fetch` を追加し、結果更新時に番付同時更新しつつプロフィール再取得を回避する
- [x] ルーティング/導線/バナー関連テストを更新し、回帰テストを追加する
- [x] `npm run typecheck` / `npm test -- --run` / `npm run build` / `npm run verify:delivery-flow` で検証する

## Progress
- `app/lib/torikumi-routes.ts` の競合マーカーを除去し、`getArchiveUpdateMessage()` を新更新間隔（結果: 14:00/14:30/15:00/15:30/16:00/16:30 + 17:00-18:00 5分間隔、予定: 09:00/18:00）へ更新。
- ルートヘルパーに末尾スラッシュ正規化を導入し、`parseTopLevelSlug()` と `getArchiveRouteConfigForPathname()` はスラッシュ有無両対応化。
- `app/main.tsx` で静的ルートの正規URL（末尾スラッシュ）を追加し、未正規URLからの遷移も受ける形へ更新。
- `app/main.tsx` のバナー文言を `getMay2026NoticeParams()` 経由でデータ駆動化し、`scheduleDays` の公開済み最終日を `day/dayLabel` で注入。
- `src/locales/ja/common.json` と `src/locales/en/common.json` の `global.may2026UpdateNotice` を補間付きテンプレートへ更新。
- `public/_redirects` を拡張し、`/archives`/`/rikishi`/`*-banduke`/`*-torikumi`/`*-yotei`/`*-o-sumo` の末尾スラッシュ有無を双方fallback対象に設定。
- workflow再編:
  - `realtime-torikumi-update.yml`: `0,30 14-16`, `*/5 17`, `0 18`（JST）に変更。
  - 同workflowの生成コマンドを `python scripts/update_sumo_data.py --torikumi-scope result --skip-rikishi-fetch` へ変更（結果＋番付同時更新）。
  - `daily-data-update.yml`: `0 9,18`（JST）へ変更し、予定更新は `--torikumi-only --torikumi-scope schedule` に限定。
- `scripts/update_sumo_data.py` に `--skip-rikishi-fetch` を追加。
- テスト更新と追加:
  - 既存ルーティング/導線テストの期待URLを末尾スラッシュ付きに更新。
  - `app/lib/may2026-notice.ts` と `app/lib/may2026-notice.test.ts` を追加し、バナー表示用の最新公開予定日算出を検証。

## Review
- `npm run typecheck`: pass
- `npm test -- --run app/lib/torikumi-routes.test.ts app/torikumi/page.test.tsx app/components/TorikumiDayPage.test.tsx app/lib/may2026-notice.test.ts app/page.test.tsx app/banzuke/page.test.tsx app/rikishi/page.test.tsx`: pass（7 files / 38 tests）
- `npm test -- --run`: pass（15 files / 62 tests）
- `npm run build`: pass（既存のchunk size警告のみ）
- `npm run verify:delivery-flow`: pass実行（`DATA_SYNC=OK`, `ROUTING_BEHAVIOR=ISSUE`）
  - 補足: `ROUTING_BEHAVIOR=ISSUE` は本番配信側の現状値に依存する判定。ローカル実装変更後も、本番反映前の検証では継続して `ISSUE` が出る。

---

# 五月場所バナー日次と結果/予定不整合の是正 Todo（2026-05-13）

## Plan
- [x] バナー算出を `dayLabel` 依存から `day` 数値依存へ固定し、`effectiveScheduleDay = min(schedulePublishedLatest, resultPublishedLatest + 1)` を適用する
- [x] `scripts/update_sumo_data.py` の fallback 参照を結果系/予定系で分離し、相互混線を防止する
- [x] 結果公開上限（当日まで）と予定公開上限（当日+1まで）を日次判定へ実装する
- [x] 五月場所データを再生成し、`resultDays=3日目 published`、`scheduleDays=4日目 published` を確認する
- [x] バナー算出テストと生成ロジックテストを追加する
- [x] `npm run typecheck` / `npm test -- --run` / `npm run build` / `npm run verify:delivery-flow` を実行する

## Progress
- `app/lib/may2026-notice.ts` を更新し、`dayLabel` を廃止して `day` 数値のみ返すように変更。
- `app/main.tsx` と `src/locales/ja/common.json` を更新し、バナーを常に `{{day}}日目` 形式で表示するよう統一。
- `scripts/update_sumo_data.py` の `pick_existing_division_day` を `source_key` 必須化し、`resultDays` と `scheduleDays` の cross fallback を停止。
- `determine_archive_statuses` と公開上限制御を導入し、結果/予定の判定を独立させた。
- `python scripts/update_sumo_data.py --torikumi-only --torikumi-scope all` を実行し、`public/api/v1/torikumi.json` を再生成。
- `app/components/TorikumiDayPage.test.tsx` と `app/banzuke/page.test.tsx` の更新日表示テストを固定日時依存から `formatUpdatedAt(...)` 依存へ変更。

## Review
- 生成結果確認（`public/api/v1/torikumi.json`）:
  - `resultDays` の published 最終日: `20260512`（三日目）
  - `scheduleDays` の published 最終日: `20260513`（四日目）
- `python scripts/update_sumo_data_torikumi_logic_test.py`: pass
- `npm run typecheck`: pass
- `npm test -- --run`: pass（15 files / 63 tests）
- `npm run build`: pass（既存のchunk size警告のみ）
- `npm run verify:delivery-flow`: pass実行（`DATA_SYNC=OK`, `ROUTING_BEHAVIOR=ISSUE`）

---

# 五月場所 番付星取表未更新の是正 Todo（2026-05-13）

## Plan
- [x] 番付APIと表示用データの更新時刻・星取件数を確認し、未更新の根因を特定する
- [x] 番付を含む再生成モードで五月場所データを再生成する（3月場所は不変更）
- [x] 星取表が一日目固定でないことを確認し、テストを再実行する

## Progress
- `public/api/v1/banzuke.json` の `updatedAt` が `2026-05-10T20:01:55+09:00` で止まり、`torikumi` 側のみ新しい状態を確認。
- 原因は `--torikumi-only` 実行で番付生成（`app/lib/sumo-data.ts`, `public/api/v1/banzuke.json`）がスキップされる運用差分。
- `python scripts/update_sumo_data.py --torikumi-scope result --skip-rikishi-fetch` を実行し、番付と結果を同時更新。

## Review
- `public/api/v1/banzuke.json.updatedAt`: `2026-05-13T12:50:44+09:00`
- 星取表サンプル（豊昇龍）: `wins=0`, `losses=2`, `draws=2`, `results_len=4`（一日目固定ではない）
- `public/api/v1/torikumi.json`: 結果公開3日目、予定公開4日目を維持
- `npm test -- --run`: pass（15 files / 63 tests）

---

# 十両筆頭の特例幕内出場で休場誤判定される不具合修正 Todo（2026-05-13）

## Plan
- [x] `public/api/v1/torikumi.json` で「取組に出場しているのに十両休場者へ載る」再現ケース（大青山）を確認する
- [x] `scripts/update_sumo_data.py` の休場者算出ロジックを、当日全取組（幕内+十両）での出場有無を考慮する形に修正する
- [x] `scripts/update_sumo_data_torikumi_logic_test.py` に特例出場ケースの回帰テストを追加する
- [x] 生成ロジックテストを実行して回帰が消えることを確認する
- [x] `tasks/todo.md` の Progress/Review を更新する

## Progress
- `public/api/v1/torikumi.json` を解析し、`resultDays day=4` と `scheduleDays day=4` で `id=4116（大青山）` が「幕内取組に出場中」かつ「十両休場者」に同時出現していることを再現確認。
- 原因は `derive_absentees()` が「その部門（十両）内の取組出場ID」だけで休場判定していた点。幕内特例出場した十両力士を非出場扱いしていた。
- `scripts/update_sumo_data.py` に `collect_active_ids_from_day()` を追加し、休場判定時に同日全取組（幕内+十両）の出場IDを参照するよう修正。
- `scripts/update_sumo_data_torikumi_logic_test.py` に、十両力士が幕内に特例出場した場合は休場リストに入らない回帰テストを追加。
- `python scripts/update_sumo_data.py --torikumi-only --torikumi-scope all` を実行し、`public/api/v1/torikumi.json` と `app/lib/torikumi-data.ts` を再生成。

## Review
- `python scripts/update_sumo_data_torikumi_logic_test.py`: pass
- `python -m pytest -q scripts/update_sumo_data_torikumi_logic_test.py`: fail（`No module named pytest`。環境未導入）
- 再生成後の整合性確認:
  - 同日出場IDと休場IDの衝突件数: `0`
  - `day=4` の十両休場者に `id=4116（大青山）` は含まれない

---

# 五月場所 更新時刻・バナー再整備 Todo（2026-05-18）

## Plan
- [x] `main` を `origin/main` に fast-forward 同期し、現状実装を確認する
- [x] `daily-data-update.yml` と `realtime-torikumi-update.yml` を五月場所の新 cadence に合わせて更新する
- [x] 固定バナー文言へ切り替え、不要な `may2026-notice` ヘルパーとテストを整理する
- [x] `app/lib/torikumi-routes.ts` の更新案内文言を新 cadence に同期する
- [x] README / DEVELOPMENT / API policy の時刻説明と workflow の責務を同期する
- [x] workflow 構文確認、`typecheck`、対象テスト、`build` を実行して Review を記録する

## Progress
- `git pull --ff-only origin main` を実行し、`197a8b8 -> b964fdf` の fast-forward 同期を完了。
- 日次更新 workflow は `15:30` / `20:00` の予定更新専用へ変更。
- realtime workflow は `14:00-16:30` 30分ごと + `17:00-18:00` 10分ごとの結果更新専用へ変更し、`--torikumi-scope result --skip-rikishi-fetch` を使用する形へ変更。
- トップバナーは固定文言化し、`app/main.tsx` から `getMay2026NoticeParams(...)` 依存を除去。
- `app/lib/may2026-notice.ts` と `app/lib/may2026-notice.test.ts` を削除。
- `app/lib/torikumi-routes.ts` の案内文言を `17:00-18:00 は10分ごと`、予定 `15:30 / 20:00` に更新。
- README / DEVELOPMENT / API policy の JP/EN 文書を workflow の新責務に合わせて更新。
- `app/test/setup.ts` の `localStorage` fallback が `undefined` ケースでも動くよう、optional chaining でガードを補強。

## Review
- workflow YAML 構文確認: pass
  - `ok: .github/workflows/daily-data-update.yml`
  - `ok: .github/workflows/realtime-torikumi-update.yml`
- `npm run typecheck`: pass
- `npm test -- --run app/lib/torikumi-routes.test.ts app/page.test.tsx app/components/TorikumiDayPage.test.tsx app/banzuke/page.test.tsx`: pass（4 files / 25 tests）
- `npm test -- --run`: pass（14 files / 62 tests）
- `npm run build`: pass（既存の chunk size 警告のみ）
- `git diff --check`: pass
- 受け入れ条件確認:
  - `daily-data-update.yml` に `09:00` / `18:00` は残存なし
  - `realtime-torikumi-update.yml` に `17:30` / `19:00` / `20:00` / `20:30` は残存なし
  - `realtime-torikumi-update.yml` は `--torikumi-scope result --skip-rikishi-fetch` を使用
  - `src/locales/ja/common.json` に固定バナー文言を反映
  - `app/lib/torikumi-routes.ts` は `17:00-18:00は10分ごとに更新` と `取組予定はJST 15:30と20:00に更新` を反映

---

# GitHub Actions 開催直前最終調整 Todo（2026-07-08）

## Plan
- [x] 最新 `origin/main` から fresh worktree / branch を作成する
- [x] News 更新で取得結果が同じ場合に `updatedAt` だけで書き換えない回帰テストを追加する
- [x] `scripts/update_news_feed.py` に no-op write と `--force-write` を実装する
- [x] 取組予定 / 結果 / News の workflow を分離し、すべて `automation/data-updates` PR に積む
- [x] README / DEVELOPMENT / API policy を新しい workflow 運用に同期する
- [x] workflow YAML / Python unit / Node checks / build / diff を検証する
- [x] 開催前の取組予定 / 結果 fetch 挙動を非破壊で確認する
- [x] トップページに「現在の取組、速報中！」ミニセクションを追加し、時刻に近い取組 anchor へ誘導する

## Progress
- `C:\Users\dai\.codex\worktrees\actions-final-tuning\o-sumo` を `origin/main` から `codex/actions-final-tuning` として作成。
- `scripts/update_news_feed_test.py` を追加し、同じ `items` / `sources` なら `news.json` を書き換えないこと、`--force-write` 相当では書き換えること、片方の source が失敗しても surviving source を残すことをテスト化。
- `scripts/update_news_feed.py` は `items` / `sources` を比較し、差分がない場合は output を変更しない。`--force-write` で timestamp だけでも再出力できる。
- `daily-data-update.yml` は JST 13:00 / 19:00 の取組予定専用へ変更。
- `realtime-torikumi-update.yml` は JST 13:00-18:00 の10分おき結果更新専用へ変更。
- `news-feed-update.yml` を追加し、JST 09:00-19:00 の2時間おき news polling に分離。
- `test.yml` は `automation/data-updates` push も検証対象に変更。
- README / README_en / DEVELOPMENT / DEVELOPMENT_en / docs/api/policy.md / docs/api/policy.en.md を新しい workflow 責務と時刻に同期。
- 公式 fetch テストで、開催前は `current_day=0` のため schedule scope でも day 1 を取得しに行かない穴を確認。
- `schedule` scope の開催前だけ `fetch_days={1}` にし、day 1 の幕内 / 十両を未公開想定で fetch できるように修正。`result` scope は開催前 fetch なしを維持。
- 古い main checkout 側に入れた bolder CSS は取り消し、News 実装がある `actions-final-tuning` worktree 側へ作業対象を戻した。
- トップページの hero 直後 / News 前に `現在の取組、速報中！` ミニセクションを追加。
- 速報 CTA は `today` があれば当日結果、`tomorrow` があれば予定へリンクし、JST 13:00-18:00 は十両 / 幕内の時間帯に近い `bout-*` anchor を付与する。

## Review
- `python -m unittest scripts.update_news_feed_test`: pass
- `python -m unittest scripts.update_sumo_data_parser_test.PostJsonRequestHeadersTest scripts.update_sumo_data_parser_test.OfficialBashoScheduleTest scripts.update_news_feed_test`: pass
- `python scripts/update_sumo_data_torikumi_logic_test.py`: pass
- `npm test -- --run app/page.test.tsx app/components/TorikumiDayPage.test.tsx`: pass（2 files / 17 tests）
- 非破壊 fetch テスト:
  - `load_banzuke_context()`: `basho_id=636`
  - `load_official_basho_start_date("令和八年", "七月場所")`: `2026-07-12`
  - `determine_current_basho_day(..., 2026-07-08)`: `0`
  - `torikumiAjax` day 1 幕内 / 十両: `Result=1`, `TorikumiData=0`, `FinalMuch=0`
  - `load_torikumi_day(...)`: 幕内 / 十両とも `取組データ未公開` として扱う
  - 開催前 schedule dataset は day 1 幕内 / 十両だけ `expected_unpublished=True` で fetch 対象
- workflow YAML parse:
  - `.github/workflows/daily-data-update.yml`: pass
  - `.github/workflows/realtime-torikumi-update.yml`: pass
  - `.github/workflows/news-feed-update.yml`: pass
  - `.github/workflows/test.yml`: pass
- `npm ci`: pass（既存の audit / deprecated warnings あり）
- `npm run typecheck`: pass
- `npm test -- --run`: pass（18 files / 93 tests、既存の localStorage ExperimentalWarning あり）
- `npm run build`: pass（既存の chunk size warning のみ）
- `git diff --check`: pass
- 追加修正（2026-07-08）:
  - 再現: `npm test -- --run` が `Home page > shows a live torikumi shortcut before the news section` で fail
  - 原因: `Home` が実行時点の JST 現在時刻から anchor を決める一方、テスト期待値が固定時刻前提だった
  - 修正: 該当テストで `vi.useFakeTimers()` / `vi.setSystemTime(...)` により 2026-07-12 15:30 JST へ固定
  - `npm test -- --run app/page.test.tsx`: pass（1 file / 8 tests）
  - `npm run typecheck`: pass
  - `npm test -- --run`: pass（18 files / 93 tests、既存の localStorage ExperimentalWarning あり）
  - `git diff --check`: pass


