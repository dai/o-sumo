# API 運用ポリシー

## 提供方針

o-sumo API は個人運用のベストエフォート提供です。商用 SLA はありません。

## 更新スケジュール

現在の更新フロー:

- 日次更新（取組予定のみ）: `daily-data-update.yml` は九月場所の番付公式公開まで `workflow_dispatch` のみ
- 高頻度更新（取組結果のみ）: `realtime-torikumi-direct-update.yml` は九月場所の番付公式公開まで `workflow_dispatch` のみ
- ニュース更新: `news-feed-update.yml` を JST 09:00-19:00 に2時間おきで実行
- 変更がある場合は `automation/data-updates` PR を作成または更新する
- ニュースは取得結果に差分がない場合、`updatedAt` だけでは `news.json` を書き換えない

七月場所は確定済みです。九月場所の番付が公式公開されるまでは、`banzuke.json` と `torikumi.json` の current data を七月場所 (`202607`) のまま維持します。次のPRで公式データを検証してから、scheduleの復元、終了告知の解除、現行データの切替を行います。

詳細は GitHub Actions workflow を参照してください。

結果未更新時の切り分け順:

1. run履歴（Realtime実行漏れの有无）
3. 供給元 API の `judge` 値（勝敗確定有無）

## 更新日時の責務分離

`updatedAt` を一律化せず、コンテンツの更新单位ごとに責務を分けます。画面・Markdown・CI のすべてで同じ値を読みます。

- 番付 (`banzuke.json`): 結果更新と同一の `updatedAt`（= `torikumi.json.resultUpdatedAt`）。予定のみの更新では進まない
- 結果 (`torikumi.json.resultDays` / 取組結果 hub・day): `resultUpdatedAt`
- 予定 (`torikumi.json.scheduleDays` / 取組予定 hub・day): `scheduleUpdatedAt`
- 過去場所 (`/202603/`, `/202605/`, `/202607/`): 月別 snapshot 内の `BanzukeData.updatedAt` / `TorikumiData.updatedAt`
- 力士 index / detail: 各 JSON の `updatedAt`（detail にあれば detail を優先）
- 行司・呼出 index / detail: 各 JSON の `retrievedAt`
- ニュース記事: 各記事の `publishedAt`（feed 自体の `updatedAt` は画面表示しない）

CI では次の值契約を検証します。

- `torikumi.updatedAt === max(resultUpdatedAt, scheduleUpdatedAt)`
- `banzuke.updatedAt === torikumi.resultUpdatedAt`

更新日時を持たない静的ページ（Archives 一覧、Kimarite 一覧など）には、無関係な日時を流用しません。

## 互換性ポリシー

- `/api/v1/*` は後方互換を優先
- 必須キー削除・型変更などの破壊的変更は `/api/v2/*` として公開
- `v1` は廃止時に事前告知を行う

## 廃止ポリシー

1. README / changelog / Issue で廃止予定を告知
2. 可能な限り移行猶予を設ける
3. 廃止後は対象バージョンを削除、または固定レスポンス化

## 障害・告知

- 一時障害やデータ欠損は GitHub Issues で告知
- 重大変更は `docs/api/changelog.md` に記録
