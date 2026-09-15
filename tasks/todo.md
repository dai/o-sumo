# JSA 15:00 発表待ち + 免責文 + Actions 安全設計

プラン: `C:\Users\dai\.claude\plans\plan-1-jsa-15-00-2-purring-eclipse.md`
作業ブランチ: `codex/home-section-swap-and-tab-investigation`

## コミット履歴

| PR | コミット | 内容 |
|---|---|---|
| PR1 | `186aab5` | i18n 文言追加 |
| PR2 | `e8fb4fb` | UI コンポーネント + 既存文言修正 |
| PR3 | `46ea3eb` | Python + Workflow 変更 |

## 実装チェックリスト

### PR1: i18n 文言追加
- [x] `src/locales/ja/common.json` に disclaimer / statusAwaitingJsa を追加
- [x] `src/locales/en/common.json` に英語版を追加
- [x] `npm run typecheck` で i18n 型検証（パス）
- [x] `npm test` 全 537 テストパス

### PR2: UI コンポーネント + 既存文言修正
- [x] `app/components/TorikumiDisclaimerBanner.tsx`（新規）
- [x] `app/components/TorikumiDayPage.tsx` にバナー2か所挿入
- [x] `app/torikumi/page.tsx` に上部バナー挿入
- [x] `app/lib/torikumi-routes.ts` に `getJstTomorrowIsoDate` / `isAfterFirstUpdateWindow` 追加
- [x] `app/lib/torikumi-routes.ts:202-206` の `getArchiveUpdateMessage` を実 cron に揃える
- [x] `app/components/DailyHighlightsSection.tsx` の pending バッジを翌日判定で出し分け
- [x] `app/components/TorikumiDisclaimerBanner.test.tsx`（新規）
- [x] 既存テストへ `torikumi-routes` / `DailyHighlightsSection` のケース追加
- [x] `npm run typecheck` / `npm test -- --run`（540 tests pass）

### PR3: Python スクリプト + Workflow
- [x] `scripts/update_sumo_data.py` に `--first-run-of-day` フラグと `is_first_run_of_day` ヘルパ
- [x] `build_archive_day` の statusMessage 拡張（15:00 + tomorrow + schedule + first-run で「発表待ち」）
- [x] `build_torikumi_dataset` のシグネチャ拡張
- [x] `main()` からフラグを伝搬
- [x] `scripts/update_sumo_data_torikumi_logic_test.py` にテスト追加
- [x] `.github/workflows/realtime-torikumi-direct-update.yml` の concurrency group を `osumo-torikumi-realtime` に
- [x] `.github/workflows/daily-data-update.yml` の concurrency group を `osumo-torikumi-schedule` に + JST 15:00 run で `--first-run-of-day` を付与
- [x] `.github/workflows/schedule-update-main.yml`（新規、JST 15:00 専用、固定ブランチ）
- [x] `.github/workflows/test.yml` の branches に `automation/schedule-updates-main` 追加
- [x] `scripts/ci/run_torikumi_generator.sh`（既存実装で全フラグ転送済み、変更不要）
- [x] Python / bash テスト合格

### End-to-end 検証
- [x] ローカル: `npm run typecheck` ✓ / `npm test -- --run`（540 tests pass）✓
- [x] Python: 97 tests pass（`workflow_config_test` + 新規 `test_schedule_update_main_workflow_runs_at_jst_15_with_fixed_branch` 含む）
- [x] bash: `push_realtime_update_test.sh` パス
- [x] CLI: `python scripts/update_sumo_data.py --help` で `--first-run-of-day` フラグ登録確認
- [x] `npm run build`: 成功（3.86s, 162 modules transformed, PWA 119 entries precache）
- [ ] Python dry-run 4 ケース: API アクセスのため未実施。`build_archive_day` 単独ユニットテストで代替検証済み
- [ ] Actions dry-run: ユーザー判断

## レビュー

### 完了内容
- **PR1 (`186aab5`)**: i18next に `torikumi.shared.disclaimer`（"結果速報情報は日本相撲協会から発表された公式情報であり、遅延することがあります。"）+ `torikumi.hub.statusAwaitingJsa`（"ただいま協会の発表待ちです"）+ `torikumi.day.statusAwaitingJsa`（"ただいま協会の発表待ちです。公式発表後に反映されます。"）の 3 キーを日英追加。
- **PR2 (`e8fb4fb`)**: `TorikumiDisclaimerBanner` 新規作成。日別ページ上部/データ表直下、ハブページ上部に配置。`getJstTomorrowIsoDate` / `isAfterFirstUpdateWindow` ヘルパを `torikumi-routes.ts` に追加し、`DailyHighlightsSection` の pending バッジが翌日 page × JST 15:00 過ぎで新文言に切替。`getArchiveUpdateMessage` を実 cron スケジュール（結果: 13:00-18:50 10分毎 / 予定: 13:00/15:00/17:00/19:00）に更新。
- **PR3 (`46ea3eb`)**: `--first-run-of-day` CLI フラグ + `build_archive_day` の statusMessage 拡張（翌日かつ first-run の schedule pending day で「ただいま協会の発表待ちです」）。3 workflow の concurrency group 分離（`osumo-torikumi-realtime` / `osumo-torikumi-schedule` / `osumo-torikumi-schedule-main`）。新規 `schedule-update-main.yml`（JST 15:00 専用、固定ブランチ `automation/schedule-updates-main`）と既存 `daily-data-update.yml` の JST 15:00 run で `--first-run-of-day` を二重に担保。

### 既知の未対応（PR3 範囲外）
- `scripts/update_sumo_data_torikumi_logic_test.py` の既存 `test_has_substantive_torikumi_diff_ignores_timestamp_only_change` が `has_substantive_torikumi_diff()` の新シグネチャ（`year_jp`, `basho_name`）未対応で TypeError。test.yml でも実行対象外のため PR3 範囲外。別タスクで修正推奨。

### ロールバック手順（プラン記載通り）
- PR1: i18n キー追加のみ。revert で完全復旧。
- PR2: 新規コンポーネント + 既存コンポーネント修正。revert で完全復旧。
- PR3: Python 側 `--first-run-of-day` 未付与の補完 run は既存挙動と同じ。新規 workflow 削除のみで部分ロールバック可能。

### 推奨フォローアップ
1. Python dry-run の実 API 検証（場所のあるタイミング）。
2. `update_sumo_data_torikumi_logic_test.py` 既存 TypeError 修正（別 PR）。
3. `schedule-update-main.yml` と `daily-data-update.yml` の JST 15:00 同時起動による二重 PR を許容するか、後者で 15:00 を外すかを決定。
