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


