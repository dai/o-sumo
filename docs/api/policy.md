# API 運用ポリシー

## 提供方針

o-sumo API は個人運用のベストエフォート提供です。商用 SLA はありません。

## 更新スケジュール

現在の更新フロー:

- 日次更新（取組予定のみ）: `daily-data-update.yml` を JST 13:00 / 19:00 に実行
- 高頻度更新（取組結果のみ）: `realtime-torikumi-update.yml` を JST 13:00-18:00 に10分おきで実行
- ニュース更新: `news-feed-update.yml` を JST 09:00-19:00 に2時間おきで実行
- 変更がある場合は `automation/data-updates` PR を作成または更新する
- ニュースは取得結果に差分がない場合、`updatedAt` だけでは `news.json` を書き換えない

2026年6月29日の七月場所番付発表後は、手動更新で `banzuke.json` を七月場所へ同期します。`torikumi.json` は current basho の `scheduleDays` を七月場所へ切り替えつつ、`resultDays` は五月場所 (`202605`) を維持します。

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
