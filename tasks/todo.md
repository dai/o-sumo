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
