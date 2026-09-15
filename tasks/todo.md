# JSA 15:00 発表待ち + 免責文 + Actions 安全設計

プラン: `C:\Users\dai\.claude\plans\plan-1-jsa-15-00-2-purring-eclipse.md`
作業ブラス: `codex/home-section-swap-and-tab-investigation`

## 実装チェックリスト

### PR1: i18n 文言追加
- [x] `src/locales/ja/common.json` に disclaimer / statusAwaitingJsa を追加
- [x] `src/locales/en/common.json` に英語版を追加
- [x] `npm run typecheck` で i18n 型検証（パス）
- [x] `npm test` 全 537 テストパス

### PR2: UI コンポーネント + 既存文言修正
- [ ] `app/components/TorikumiDisclaimerBanner.tsx`（新規）
- [ ] `app/components/TorikumiDayPage.tsx` にバナー2か所挿入
- [ ] `app/torikumi/page.tsx` に上部バナー挿入
- [ ] `app/lib/torikumi-routes.ts` に `getJstTomorrowIsoDate` / `isAfterFirstUpdateWindow` 追加
- [ ] `app/lib/torikumi-routes.ts:202-206` の `getArchiveUpdateMessage` を実cronに揃える
- [ ] `app/components/DailyHighlightsSection.tsx` の pending バッジを翌日判定で出し分け
- [ ] `app/components/TorikumiDisclaimerBanner.test.tsx`（新規）
- [ ] 既存テストへ `TorikumiDayPage` / `torikumi-routes` のケース追加
- [ ] `npm run typecheck` / `npm test -- --run ...` / `npm run build`

### PR3: Python スクリプト + Workflow
- [ ] `scripts/update_sumo_data.py` に `--first-run-of-day` フラグと `is_first_run_of_day` ヘルパ
- [ ] `build_archive_day` の statusMessage 拡張（15:00 + tomorrow + schedule + first-run で「発表待ち」）
- [ ] `build_torikumi_dataset` のシグネチャ拡張
- [ ] `main()` からフラグを伝搬
- [ ] `scripts/update_sumo_data_torikumi_logic_test.py` にテスト追加
- [ ] `.github/workflows/realtime-torikumi-direct-update.yml` の concurrency group を `osumo-torikumi-realtime` に
- [ ] `.github/workflows/daily-data-update.yml` の concurrency group を `osumo-torikumi-schedule` に + JST 15:00 run で `--first-run-of-day` を付与
- [ ] `.github/workflows/schedule-update-main.yml`（新規、JST 15:00 専用、固定ブランチ）
- [ ] `.github/workflows/test.yml` の branches に `automation/schedule-updates-main` / `automation/news-updates-*` 追加
- [ ] `scripts/ci/run_torikumi_generator.sh` で `--first-run-of-day` を透過
- [ ] Python / bash テスト

### End-to-end 検証
- [ ] ローカル: `npm run typecheck` / `npm test` / `npm run build`
- [ ] Python dry-run: `--first-run-of-day` あり / なし / 取得失敗 / result scope の 4 ケース
- [ ] Actions dry-run: `gh workflow run` で 3 workflow を起動
- [ ] 想定テストケース 9 件を確認

## レビュー

（実装完了後に記入）