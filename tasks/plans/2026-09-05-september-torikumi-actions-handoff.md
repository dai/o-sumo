# Handoff: 令和八年九月場所 取組データ更新とGitHub Actions再開

更新日: 2026-09-05 JST

## 実装進捗（sep-scheduling）

- 作業先: `C:/dai/GitHub/o-sumo/.superpowers/worktrees/sep-scheduling`
- 起点: `origin/main` の `4e64639`。元の `pi-gemini38-renovation` の未コミット変更はそのまま保持。
- `0254e32` / `5373976`: 予定完全性ゲートとvalidatorを実装。部分取得・通信/解析失敗は全出力前に失敗し、実際の未公開とは区別する。
- 例外条件を具体化: 不戦敗と休場の重複は、その力士の唯一の出場が当該不戦敗である場合だけ許可。優勝決定戦の再登場は公式 `FinalMuch` 由来の `isPlayoff` がある千秋楽だけ許可。通常の千秋楽取組の重複は拒否する。
- `app/lib/torikumi-data.ts` はoptional型の追加のみ。試合データ・公開JSON・過去場所は変更しない。
- 独立レビューの3指摘を修正済み。parser 63件、validator 5件、単独torikumi logic、typecheck成功。
- 残作業: cron/summary/push競合対策、日英運用説明、全体検証・レビュー。
- push・PR作成・main merge・本番反映・9月12日当日運用は未実施。以下の現状分析は実装前の9月5日時点の記録として読むこと。

この文書は、2026年9月12日の初日取組発表への対応と、9月13日から27日までの本場所中データ更新を、別のエージェントがゼロコンテキストから引き継ぐための資料です。現状分析、当日運用、必要なworkflow修正、安全性改善、検証条件を一つにまとめています。

---

## 1. 目的

次の二つを確実に実現すること。

1. 9月12日の公式発表後、9月13日初日の幕内・十両取組予定を当日中に本番へ反映する。
2. 九月場所開催中、翌日の取組予定と当日の結果を自動更新し、失敗・部分取得・未mergeを検知できる運用へ戻す。

対象外:

- 番付、力士プロフィール、ニュースフィードの仕様変更
- 七月場所以前のarchiveデータ変更
- UIやデザインの変更

---

## 2. 作業開始時の注意

- 現在のcheckoutは `pi-gemini38-renovation` ブランチで、`tasks/todo.md` に既存の未コミット変更がある。上書き、stash、破棄をしない。
- 実装は最新の `origin/main` から新しいworktreeと専用ブランチを作る。
- 最初に `git fetch origin main`、`git worktree list --porcelain`、`git status --short --branch` を実行し、対象worktreeが最新mainから始まっていることを確認する。
- workflowや生成データを変更する前に、この文書に記載したlive状態を再確認する。GitHub上の設定は9月5日以降に変わる可能性がある。

推奨ブランチ名:

```text
sep-scheduling
```

---

## 3. 2026年9月5日時点の状態

### 本番データ

`https://osada.us/api/v1/torikumi.json` はHTTP 200で、次の状態だった。

- `bashoId`: `637`
- 場所: 九月場所
- 初日: `20260913`
- `resultDays` の公開済み日数: 0
- `scheduleDays` の公開済み日数: 0
- 初日の状態: `pending`
- 初日の幕内・十両取組: 0番
- `updatedAt` / `resultUpdatedAt` / `scheduleUpdatedAt`: `2026-08-31T07:40:29+09:00`

### Actions

次の二つのworkflowはGitHub上でactiveだが、どちらも `workflow_dispatch` のみで、自動cronは存在しない。

| Workflow | 現在の対象 | 配信方法 |
| --- | --- | --- |
| `.github/workflows/daily-data-update.yml` | 取組予定、`--torikumi-scope schedule` | PR作成、必須check後にauto-merge |
| `.github/workflows/realtime-torikumi-direct-update.yml` | 取組結果、`--torikumi-scope result` | `main`へ直接commit/push |

自動cronは2026年7月27日のcommit `125d12996acae2f2116c29e32a2ecef8fe2eb809` で削除された。両workflowの最後の実行は7月26日である。

`README.md` と `DEVELOPMENT.md` には「九月場所番付公開後の次PRでscheduleを復元する」とあるが、九月場所番付は8月31日に切り替わった一方、cronは復元されていない。

---

## 4. 9月12日の当日運用

### 使用するworkflow

初日予定の取り込みには `Daily Sumo Data Update` だけを使う。`Realtime Torikumi Direct Update` は結果専用であり、初日予定の取得には使わない。

公式発表を確認した後、mainに対して手動実行する。

```powershell
gh workflow run daily-data-update.yml -R dai/o-sumo --ref main
```

最新runを取得して完了まで監視する。

```powershell
gh run list -R dai/o-sumo --workflow daily-data-update.yml --limit 5
gh run watch <run-id> -R dai/o-sumo --exit-status
```

生成されたPRを確認する。

```powershell
gh pr list -R dai/o-sumo --state all --search '"chore: automated torikumi schedule updates" in:title' --limit 10
gh pr view <pr-number> -R dai/o-sumo --json state,mergeStateStatus,statusCheckRollup,url
```

### 成功条件

Actionsの `success` だけでは完了としない。次をすべて確認する。

- `Daily Sumo Data Update` のgenerate、validate、PR作成が成功している。
- 生成されたPRの必須 `test` とPages関連checkが成功している。
- PRが `MERGED` になっている。
- main上の `public/api/v1/torikumi.json` で、初日 `20260913` のscheduleが `published` になっている。
- 幕内と十両の両方に公式発表と一致する取組があり、片方だけの部分取得になっていない。
- 本番 `https://osada.us/api/v1/torikumi.json` でも同じ内容と新しい `scheduleUpdatedAt` を確認できる。
- 初日結果は発表前なので `resultDays[0].status == "pending"` を維持している。

### 発表前に実行した場合

開催前のschedule scopeは初日だけを取得する。公式側がまだ未公開なら、差分なし・PRなしでworkflowが成功終了する可能性がある。この場合は成功扱いにせず、発表後に再実行する。

共通runnerはgeneratorを最大2回、10秒間隔で再試行するが、発表待ちを継続監視する仕組みではない。

---

## 5. 取込ロジックの確認結果

`scripts/update_sumo_data.py` は初日前日の取り込みに対応している。

- 公式初日より前は `current_day = 0` になる。
- `--torikumi-only --torikumi-scope schedule` は、開催前には `fetch_days = {1}` として初日を取得する。
- 幕内・十両のどちらかに取組があれば `observed_any_match_day = 1` となり、初日scheduleを `published` にする。
- schedule scopeでは同じ月の既存result配列を維持し、schedule側だけを更新する。
- 実質差分がない場合は既存タイムスタンプを維持する。

関連する `scripts.update_sumo_data_parser_test` 55件は9月5日に成功している。実装前後に再実行すること。

```powershell
python -m unittest scripts.update_sumo_data_parser_test
```

---

## 6. 現在判明している欠陥とリスク

### P0: 9月12日に自動起動しない

予定・結果workflowにcronがなく、手動dispatchしない限り何も起きない。

### P0: scheduleの部分取得を公開できてしまう

予定workflowには `--strict-torikumi-fetch` がない。片方のdivisionだけ取得できた場合でも、日全体が `published` になる可能性がある。

現在の `scripts/ci/validate_torikumi.py` は次だけを検査している。

- 必須キー
- 非空タイムスタンプ
- 正の `bashoId`
- result / schedule各15日分

幕内・十両の両方が取得済みか、公式の取組数・参加者が揃っているかは検査していない。

### P1: Actionsの予定時刻は即時性を保証しない

七月場所ではcron定義に対して大きな遅延と間引きがあった。GitHub scheduled workflowを10分以内の更新保証として扱わない。

### P1: Daily workflowのsuccessは本番反映を保証しない

DailyはPR経由である。workflowがsuccessでも、check失敗や競合でPRがmergeされない場合がある。

### P1: Realtimeはテスト前にmainへ入る

Realtimeはvalidate後にmainへ直接pushする。mainのTest workflowはpush後に始まるため、テストは事前ゲートではない。

### P2: ドキュメントと実装がずれている

一部ドキュメントはRealtimeもPR経由のように説明しているが、実装はdirect pushである。cron復元時に日本語・英語ドキュメントを同期する。

---

## 7. 七月場所のActions実績

### 取組予定

当時のcron:

```yaml
- cron: '0 4,10 * * *'
```

これはJST 13:00、19:00の1日2回である。

7月12日から26日の実績:

- scheduled run: 30回
- Actions上のsuccess: 30回
- 実行時間中央値: 約42秒
- 13:00枠の起動遅延中央値: 約69分
- 19:00枠の起動遅延中央値: 約39分
- 実際の起動は概ね14:03〜14:20、19:33〜20:08
- PR作成: 29件
- merge: 27件
- mergeされずclose: 2件
- 差分なしでPRなし: 1件
- 通常はrun開始から約90秒でmainへmerge

例外:

- PR #172はテスト修正待ちで約14時間29分後にmerge。
- PR #182はcheck成功でもmergeされずclose。
- PR #305はTest failureでclose。

七月場所の初日取組は7月10日に当日反映されたが、最初の反映は定期Actionsではなく手動のPR #154だった。9月12日も手動fallbackを必須とする根拠である。

### 取組結果

当時のcron:

```yaml
- cron: '*/10 4-8 * * *'
- cron: '0 9 * * *'
```

実際の時刻はJST 13:00〜17:50の10分間隔と18:00である。古いworkflowコメントの「18:50まで」は誤りで、18:10〜18:50は定義されていなかった。

7月12日から26日の実績:

- scheduled run: 95回
- success: 94回
- failure: 1回
- 実行時間中央値: 約20秒
- 成功時のrun開始からcommitまで中央値約15秒
- 実際は1日6〜8回程度
- 同日内の実行間隔中央値: 約52.3分

唯一のfailureはrun `30077156430`。同時更新によるnon-fast-forwardだった。現在は明示refへのpush、fetch、rebase、最大3回のretryが追加済みである。

---

## 8. 実装計画

### Task 1: cronを復元する

`daily-data-update.yml` に次を設定する。

```yaml
schedule:
  # JST 13:00 / 15:00 / 17:00 / 19:00. GitHub Actions may start late.
  - cron: '0 4,6,8,10 * * *'
```

発表時刻が固定されず、GitHub側の開始遅延も大きいため、13時と19時だけでなく午後2時間おきに確認する。`workflow_dispatch` はfallbackとして残す。

`realtime-torikumi-direct-update.yml` に次を設定する。

```yaml
schedule:
  # JST 13:00-18:50, every 10 minutes. GitHub Actions may delay or coalesce runs.
  - cron: '*/10 4-9 * * *'
```

この式でJST 13:00〜18:50を10分間隔に統一する。`workflow_dispatch` は残す。10分以内の実行をSLAとして表現しない。

cronは9月12日までにmainへ反映する。9月27日の最終結果と翌日のデータ確認後、別PRで再び `workflow_dispatch` のみに戻す。

### Task 2: schedule完全性ゲートを追加する

日全体を `published` にする前に、幕内と十両の両方が取得できていることを必須にする。

- 一方が取得不能または取組0件なら、その日のscheduleを `pending` のまま維持する。
- 既存の正常なscheduleを、後続の一時的な部分取得で置換しない。
- 部門ごとの取組数は固定値だけで判定せず、公式レスポンスとの整合と非空を基本にする。幕内への十両上位出場など既存の部門統合規則を壊さない。
- 参加者IDと休場者IDが重複しないことを検査する。
- 部分取得時はworkflowを失敗させ、Discord通知とJob Summaryにdivisionとdayを出す。

validatorにも、公開済みscheduleについて次を追加する。

- 幕内・十両の両方にmatchesがある。
- matchの東西IDが有効である。
- 同一取組や同一力士の不正な重複がない。
- participantsとabsenteesが交差しない。

### Task 3: 配信完了を観測可能にする

- DailyのJob Summaryに、PR番号、PR URL、operation、生成後の公開日、部門別取組数を出す。
- Dailyのworkflow successとPR mergeを区別する。PRが作られた場合は、merge/check状況を追える情報を必ず残す。
- RealtimeのJob Summaryに、対象日、部門別の確定済み取組数、commit SHA、push結果を出す。
- 予定と結果のconcurrency groupは現在別である。両方が同じ生成ファイルを更新するため、同時実行時の競合テストを追加するか、共通groupへ統一する。推奨は共通group `osumo-torikumi-update` へ統一し、`cancel-in-progress: false` で直列化する。

### Task 4: ドキュメントを同期する

次を実装どおりに更新する。

- `README.md` / `README_en.md`
- `DEVELOPMENT.md` / `DEVELOPMENT_en.md`
- `scripts/ci/README.md`

明記する内容:

- DailyはPRとauto-merge経由。
- Realtimeはmainへのdirect push。
- 正確なJST予定時刻。
- GitHub Actionsには開始遅延・間引きがあり、即時性を保証しない。
- 9月12日と障害時の手動dispatch手順。
- 九月場所終了後にcronを停止する運用。

---

## 9. テスト計画

最低限、次の回帰ケースを追加する。

1. 開催前 `current_day = 0` で初日だけを取得する。
2. 初日の幕内・十両が両方揃うとscheduleが `published` になる。
3. 幕内だけ、または十両だけ取得できた場合は `pending` を維持し、検証が失敗する。
4. 発表前で両部門0件の場合は差分なしとなり、既存タイムスタンプを維持する。
5. 公開済みの完全なscheduleを一時的な部分取得で上書きしない。
6. result scopeがschedule配列と `scheduleUpdatedAt` を変更しない。
7. schedule scopeがresult配列と `resultUpdatedAt` を変更しない。
8. participantsとabsenteesが交差するpayloadをvalidatorが拒否する。
9. 幕内への十両上位出場を二重計上せず、休場にも誤分類しない。
10. workflow YAMLのcron式をUTCからJSTへ変換した期待値で固定する。

実行コマンド:

```powershell
python -m unittest scripts.update_sumo_data_parser_test
python scripts/ci/validate_torikumi.py
npm test
npm run typecheck
npm run build
git diff --check
```

生成処理を実データに対して試す場合は、既存の生成済みファイルを汚さない一時worktreeで行う。生成後は最低限、次を比較する。

- `app/lib/torikumi-data.ts`
- `public/api/v1/torikumi.json`
- `scheduleUpdatedAt` と `resultUpdatedAt`
- 初日scheduleのstatusと幕内・十両matches
- 七月以前のarchiveが不変であること

---

## 10. 受け入れ基準

- [ ] 9月12日の公式発表後、手動または自動Daily runが初日予定を取得できる。
- [ ] 初日の幕内・十両が両方揃った場合だけscheduleを `published` にする。
- [ ] DailyのPRが必須check成功後にmergeされ、本番JSONまで確認できる。
- [ ] 開催中のDaily cronがJST 13:00、15:00、17:00、19:00に設定されている。
- [ ] Realtime cronがJST 13:00〜18:50の10分間隔に設定されている。
- [ ] workflowとドキュメントのJST時刻が一致している。
- [ ] DailyのPR経由とRealtimeのdirect pushが正確に文書化されている。
- [ ] 部分取得、重複、participants/absentees交差を検証で拒否できる。
- [ ] Actions success、PR merge、main反映、本番反映を別々に確認できる。
- [ ] 全テスト、typecheck、build、`git diff --check` が成功する。
- [ ] 九月場所終了後にcronを停止するフォローアップが明記されている。

---

## 11. 参考リンク

- Actions: `https://github.com/dai/o-sumo/actions`
- Daily workflow: `https://github.com/dai/o-sumo/actions/workflows/daily-data-update.yml`
- Realtime workflow: `https://github.com/dai/o-sumo/actions/workflows/realtime-torikumi-direct-update.yml`
- 七月初日手動反映 PR #154: `https://github.com/dai/o-sumo/pull/154`
- 長時間merge待ち PR #172: `https://github.com/dai/o-sumo/pull/172`
- 未mergeclose PR #182: `https://github.com/dai/o-sumo/pull/182`
- check失敗 PR #305: `https://github.com/dai/o-sumo/pull/305`
- Realtime競合failure run: `https://github.com/dai/o-sumo/actions/runs/30077156430`
- 本番API: `https://osada.us/api/v1/torikumi.json`
