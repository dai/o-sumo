# 5月場所向けスモークテスト記録

- 実施日: 2026-03-31
- 対象ブランチ: `copilot-renovate`

## 自動テスト（Vitest）

- 番付・星取表示: PASS
- 取組結果/取組予定表示: PASS
- PWA設定（prompt / API NetworkFirst / manifestリンク）: PASS

## 手動確認（ブラウザ実機）

- 番付・星取・取組予定/結果の表示確認: 未実施（実機ブラウザ確認待ち）
- PWAインストール可能確認: 未実施（実機ブラウザ確認待ち）
- オフライン時の最低限表示確認: 未実施（実機ブラウザ確認待ち）
- SW更新挙動（prompt）確認: 未実施（実機ブラウザ確認待ち）

## 補足

- CLI環境で `vite build` により `dist/manifest.webmanifest` / `dist/sw.js` 生成を確認済み。
