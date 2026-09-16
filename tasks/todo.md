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
