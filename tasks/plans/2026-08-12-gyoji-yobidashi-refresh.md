# 行司・呼出名鑑 公式データ再実装計画

## Goal

日本相撲協会の現行HTMLを唯一の入力として、現役行司・呼出の一覧と個別プロフィールを写真なしで生成し、数値プロフィールIDを使う一覧・詳細画面、JSON API、日英表示、メタデータ、sitemapを提供する。

## Global Constraints

- 取得元は `https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/`、`https://www.sumo.or.jp/IrohaKyokaiMember/yobidashi/` と、そこからリンクされる公式個別プロフィールだけにする。
- 写真URL、写真ファイル、画像由来データは出力しない。
- 人物IDは公式個別プロフィールURL末尾の数値IDを使い、名跡・呼出名ベースのslugは使わない。
- 一覧と詳細の氏名、読み、階級、IDが一致しない場合や、一覧の人物に対応する詳細取得が欠けた場合は生成を失敗させる。
- 公式HTML取得時に全出力を一度検証してから書き込み、部分更新を残さない。
- `updatedAt` は公式更新日を装わない。取得時刻を `retrievedAt` としてUTC ISO 8601で記録する。
- 既存の行司・呼出APIは `main` 未反映なので互換シムは作らず、型・呼び出し元・テストを直接更新する。
- 日本語画面は公式階級名、英語画面はコード化した階級から英語ラベルを表示する。固有名は公式表記を維持する。
- 写真はUIにも表示しない。

## Task 1: 公式HTMLパーサーと全件JSON生成

- `scripts/update_official_profiles.py` を追加する。
- 標準ライブラリだけで一覧表と個別プロフィール表を解析できるようにし、HTTP取得はテストで差し替え可能にする。
- 一覧から数値ID、氏名、読み、本名、階級、所属部屋、個別URLを取得する。
- 個別から本名、生年月日、出身地、所属部屋、採用年月、行司名履歴を取得する。
- 生年月日は年齢表示を除き、年月日はISO日付へ正規化する。採用年月はISO年月へ正規化する。
- `rankCode` を種類別に決定し、日本語の `rank` も保持する。
- `public/api/v1/gyoji.json`、`public/api/v1/yobidashi.json` と数値ID名の個別JSONを生成する。
- 現行スナップショットは行司42名、呼出45名であることを手動照合する。将来の更新を妨げる固定件数判定を生成ロジックには入れない。
- 古い文字列slugの個別JSONを除去する。
- fixtureベースのPythonテストを先に追加し、REDを確認してから実装する。

## Task 2: API型、画面、日英表示、メタデータ、sitemapの接続

- `OfficialIndexItem` と `OfficialProfile` を数値ID、`retrievedAt`、`rankCode`、`adoptedAt`、任意の `nameHistory` に更新する。
- `/gyoji/`、`/gyoji/{id}/`、`/yobidashi/`、`/yobidashi/{id}/` と末尾スラッシュ正規化を維持する。
- 一覧と詳細で日本語・英語の階級ラベル、公式出典リンク、取得日、写真不使用説明を表示する。
- 無効IDや存在しないJSONはnot-found表示にする。
- 一覧・詳細のメタデータとcanonicalを維持し、可能な範囲で人物名をページタイトルへ反映する。
- sitemapへ両一覧と全数値ID詳細URLを含め、入力を厳格に検証する。
- `public/_redirects` に両一覧と数値ID詳細の末尾スラッシュ301およびSPA 200規則を追加する。
- build時にindex掲載IDの個別JSON存在、kind、ID一致を検証し、欠落詳細を含むsitemapを生成しない。
- UI、API helper、metadata、sitemapのテストを先にREDにし、その後最小実装でGREENにする。

## Task 3: 更新手順と総合検証

- `docs/official-profile-refresh-runbook.md` を追加し、生成、差分確認、検証、写真不使用、公式数値ID方針を記載する。
- `tasks/todo.md` の進捗とReviewを更新する。
- focused Python tests、focused Vitest、`npm run typecheck`、`npm test`、`npm run build`、`git diff --check` を実行する。
- 生成後のJSONで行司42名、呼出45名、個別JSON件数一致、写真フィールド不在、代表値一致を確認する。
- build後のsitemapに全87詳細URLと両一覧URLが含まれることを確認する。
- ローカル配信で一覧・代表詳細・JSON API・末尾スラッシュのHTTPと表示を確認する。
- `wrangler pages dev dist` で一覧・詳細の200、末尾スラッシュ301とLocationを実測する。
- 最終レビュー後にコミット、push、PR作成まで行う。
