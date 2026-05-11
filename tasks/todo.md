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

# 2026-05-11 同期 Todo

## Plan
- [x] 現在のbranchとupstream設定を確認する
- [x] remoteをfetchして現在branchをfast-forward同期する
- [x] 同期後のHEADとworking tree状態を確認して記録する

## Progress
- `git fetch origin --prune`は成功。削除済みremote branch群が整理された。
- 作業開始時のcurrent branchは`codex/rikishi-202605-mit-license`で、upstream `origin/codex/rikishi-202605-mit-license` は `[gone]`。
- `HEAD`は`origin/main`の祖先で追加コミットはなく、feature branchはmainへ取り込み済みだった。
- `tasks/todo.md`を一時stashして`main`へ切り替え、`git pull --ff-only origin main`で`b785ff2`から`f487a77`へfast-forward。
- stashを戻した後のworking tree変更は`tasks/todo.md`のみ。

## Review
- 現在branchは`main`。
- `git rev-parse --short HEAD` = `f487a77`
- `git rev-parse --short origin/main` = `f487a77`
- `git status --short --branch`は`## main...origin/main`と`M tasks/todo.md`を表示。repo本体はremoteと同期済みで、未コミット変更は今回の記録ファイルのみ。

---

# 五月場所公式休場者と不戦勝反映 Todo

## Plan
- [x] 作業ブランチを切り、既存の未コミット変更を保持したまま実装する
- [x] 公式休場ページHTML解析・開始日解釈・ID解決・不戦勝反映のPython回帰テストを先に追加する
- [x] `scripts/update_sumo_data.py`で公式休場ページを正本にした休場者取得へ置き換える
- [x] schedule正規化と予定ページ表示で不戦取組の`kimarite`/`winner`を保持・表示する
- [x] React/Vitest側で公式休場者表示、非休場者混入防止、予定ページの不戦勝表示を検証する
- [x] 生成データを更新し、Pythonテスト・対象Vitest・型チェック・全体テスト・ビルドで検証する

## Progress
- `codex/official-absence-fusen`ブランチを作成。
- 公式休場ページ`/ResultData/absence/`の「幕内・十両」セクションを、同一見出し配下の複数更新日テーブルまで解析するようにした。
- `alt`かな、番付表示、星取表由来の`shikona_kana`を使い、公式休場者を`rikishi_id`付きで解決するようにした。
- `derive_absentees()`は番付差分推定をやめ、公式休場ページ由来のリストと開始日だけを参照する方式へ変更。
- 休場者が取組に残っている場合、相手側を`winner`にし、`kimarite: "不戦"`を保持するようにした。
- 未公開未来日の取組は既存JSONの古い予定を再利用せず、公式API未公開ならpendingプレースホルダーに戻すようにした。
- 予定ページでは不戦取組だけ`不戦（勝者名）`を表示するようにした。結果ページの休場者非表示は維持。
- `app/lib/may2026-data.ts`は手書き重複データをやめ、生成済み`torikumiArchive`を参照する薄いエクスポートにした。
- 公式番付メタデータの`day`が遅れている場合でも、JST日付と開催初日から`today`/`tomorrow`を補正するようにした。
- `python scripts/update_sumo_data.py --torikumi-only`で生成データを更新。公式休場ページは`2026-05-11 10:46:07`更新、公式休場者3名を解決。
- 2日目の豊昇龍対藤ノ川は`kimarite: "不戦"`、`winner: "west"`として反映。

## Review
- 正本は日本相撲協会公式`https://www.sumo.or.jp/ResultData/absence/`に固定。外部ニュースは生成データに使わない。
- 公式リストから消えた力士は次回生成で`absentees`から自然に消える。
- `python scripts/update_sumo_data_parser_test.py`: 6件 pass
- `npm test -- --run app/components/TorikumiDayPage.test.tsx app/torikumi/page.test.tsx app/lib/may2026-data.test.ts`: 3ファイル22件 pass
- `npm run typecheck`: exit 0
- `npm test -- --run`: 14ファイル61件 pass
- `npm run build`: exit 0。既存のchunk size警告のみ
- `git diff --check`: exit 0

---

# 2026-05-11 14:00-18:00 5分更新 + 実質差分コミット化 Todo

## Plan
- [x] `realtime-torikumi-update.yml`のscheduleをJST 14:00-18:00の5分運用へ変更する
- [x] `scripts/update_sumo_data.py`に`updatedAt`系を除外した実質差分判定ロジックを追加する
- [x] 実質差分なし時は既存timestampを維持する処理を組み込む
- [x] `absentees`順序を安定化し、比較ブレを減らす
- [x] Python回帰テストを追加し、timestamp-only変更が差分なしになることを検証する
- [x] 既存検証（parser test / typecheck / vitest / build）を実行する

## Progress
- workflow cronを`*/5 14-17 * * *`と`0 18 * * *`に変更。`concurrency`設定は維持。
- `scripts/update_sumo_data.py`へ比較用正規化関数群を追加し、`updatedAt`/`resultUpdatedAt`/`scheduleUpdatedAt`を比較対象から除外。
- `preserve_torikumi_timestamps_if_unchanged()`をmainフローへ組み込み、実質差分なし時は既存timestampを保持するようにした。
- `derive_absentees()`の戻り値を`id`昇順へ固定し、出力安定性を強化。
- `scripts/update_sumo_data_parser_test.py`へ実質差分判定のテストクラスを追加（timestamp-only無視、winner/kimarite/absentees/schedule不戦変更検知、timestamp維持）。
- `app/lib/torikumi-routes.ts`の更新文言を5分運用に合わせて更新し、対応テストを更新。
- `app/lib/may2026-data.test.ts`の公開日固定前提を外し、live更新中でも壊れにくい状態判定に修正。

## Review
- `python scripts/update_sumo_data_parser_test.py`: 11件 pass
- `npm run typecheck`: exit 0
- `npm test -- --run`: 14ファイル61件 pass
- `npm run build`: exit 0（既存のchunk size warningのみ）
- 生成データファイル（`app/lib/torikumi-data.ts`、`public/api/v1/torikumi.json`）は今回要件の対象外のため差分から除外。
