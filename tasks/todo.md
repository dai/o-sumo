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
