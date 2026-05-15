# API 運用ポリシー

## 提供方針

o-sumo API は個人運用のベストエフォート提供です。商用 SLA はありません。

## 更新スケジュール

現在の自動更新フロー:

- 日次更新（取組予定のみ）: JST 09:00, 18:00
- 高頻度更新（取組結果 + 取組予定 + 番付）: 場所期間中は毎日 JST 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 19:00, 20:00
- 監視更新（結果時刻監視）: JST 20:30（`resultUpdatedAt` が当日でなければ warning）

2026年4月27日の五月場所番付発表後は、手動更新で `banzuke.json` と `torikumi.json` を五月場所に同期します。

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
