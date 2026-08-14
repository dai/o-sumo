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

1. run履歴（Realtime実行漏れの有無）
2. runログ（`event.schedule`, JST時刻, `resultUpdatedAt`, `scheduleUpdatedAt`）
3. 供給元 API の `judge` 値（勝敗確定有無）

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
