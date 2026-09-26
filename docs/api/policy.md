# API 運用ポリシー

## 提供方針

o-sumo API は個人運用のベストエフォート提供です。商用 SLA はありません。

## AIによる利用

認証・登録・APIキーなしの公開読み取りを提供します。検索と回答生成時の参照は許可（`search=yes, ai-input=yes`）、学習・微調整は不許可（`ai-train=no`）です。出典URLと更新時刻を示してください。方針は `public/robots.txt` で管理し、配信後の確認は [agent-ready.md](../agent-ready.md) を参照してください。

## 更新スケジュール

現在の更新フロー:

- 日次更新（取組予定のみ）: `daily-data-update.yml` は JST 13:00・15:00・17:00・19:00 に起動（手動実行も可能）
- 高頻度更新（取組結果のみ）: `realtime-torikumi-direct-update.yml` は UTC 06:00–09:59 / JST 15:00–18:59 に3分おきで起動（手動実行も可能）
- ニュース更新: `news-feed-update.yml` を JST 09:05-19:05 に2時間おきで実行
- 更新は `data-update.yml` と `scripts/ci/run_data_update.py` で直列化します。
- ニュースの取得状態は `automation/news-state` に保持し、`scripts/ci/news_state.py` の判定で選んだ検証済みスナップショットを `main` に公開します。公開時刻・再試行の詳細は実装を参照してください。

現在のJSON APIは2026年九月場所を返します。七月場所は不変アーカイブです。GitHub Actionsの起動は遅れることがあるため、データの更新日時と掲載状況で鮮度を判断してください。

詳細は GitHub Actions workflow を参照してください。

結果未更新時の切り分け順:

1. run履歴（Realtime実行漏れの有無）
2. runログ（JST時刻、`resultUpdatedAt`、`scheduleUpdatedAt`）
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
