# 調査・復旧記録：二日目結果ページの更新停止（2026-11-10）

指示書: `tasks/plans/2026-11-10-day2-results-stall.md`

## 結論

- データ生成・取得・GitHub Actions はすべて正常だった。main の `public/api/v1/torikumi.json` は 17:57 JST（6898dbf）の時点で二日目の全 35 番（幕内 21／十両 14）の結果を持っていた。
- 本番が古くなった原因は Cloudflare Pages の本番デプロイの順序逆転。16:47 JST の PR #727 マージコミット 348f47e の本番ビルドが約 3 時間遅れて 19:41 JST に作成され、19:14 JST の最新ビルド（c8b9ad1）より後に完成したため、本番エイリアスが 348f47e のビルドを指した。348f47e の時点のデータは 16:43 JST（幕内 8 番まで）なので、本番が巻き戻って見えた。
- main に空コミットを push して新しい本番ビルドを作らせ、復旧した。

## 確認した事実

| 対象 | 確認内容 |
| --- | --- |
| `osada.us/api/v1/torikumi.json`（復旧前） | `updatedAt` 2026-11-09T16:43:25+09:00、二日目幕内の結果 8/21 |
| `o-sumo.pages.dev`（本番エイリアス、復旧前） | 同上 |
| `osada.us/terms/`（復旧前） | 200。16:43 のビルド（62557ce3）には存在しないので、本番は 348f47e 以降のビルド |
| `wrangler pages deployment list --environment production` | 最新の本番デプロイが a922f9c2（348f47e）。その下に 80285289（c8b9ad1）、2ef0ae05（6898dbf）… と続く |
| 348f47e の Cloudflare チェック | check suite 作成は 07:47Z（16:47 JST）だが、`Cloudflare Pages: o-sumo` の check run は 10:42Z（19:42 JST）に初めて作成された。o-sumo-blog も 10:41Z〜10:42Z |
| 2ef0ae05（6898dbf）/ 80285289（c8b9ad1）の配信内容 | `torikumi.json` の `updatedAt` 17:57:42、二日目幕内 21/21、三日目の幕内取組 21 番を含む |
| GitHub Actions（Realtime Torikumi Direct Update / Test） | 16:43 以降もすべて success |

17:57 以降に結果公開コミットが止まったのは、二日目の全番が埋まり差分がなくなったためで、異常ではない（18:14〜19:02 の Realtime 実行は成功・コミットなし）。

## 未確定の点

- 348f47e のビルドが約 3 時間遅れた理由は特定できていない。Cloudflare 側のデプロイのトリガー種別（GitHub push か、ダッシュボードからの再実行か）は API で確認していない。
  - 仮説 A: Cloudflare Pages のビルドキュー（同時ビルド数の上限）で滞留し、遅れて処理された。o-sumo と o-sumo-blog の 2 プロジェクトが push ごとにビルドされるため、結果公開が 7 分間隔で続く時間帯は詰まりやすい。
  - 仮説 B: GitHub からの webhook が遅延・再送された、または誰かがチェックを再実行した。
- どちらの場合でも「古いコミットのビルドが後から完成すると本番を奪う」という Cloudflare Pages の挙動は同じで、再発しうる。

## 検知できなかった理由

- `scripts/ci/check_data_delivery.py` は push したコミットの `Cloudflare Pages: o-sumo` チェックが success になることだけを見ており、本番 URL が実際にそのコミットの内容を返しているかは確認していない。今回は 6898dbf のチェックも success だったため、検証は通過していた。

## 対処

1. 2026-11-10 11:00 JST、main に空コミット a6bcf0d1（`chore: redeploy production after stale Cloudflare Pages deployment`）を push した。
2. 11:01 JST に本番デプロイ 5eb16806（a6bcf0d）が作成され、本番エイリアスがこのビルドに切り替わった。

## 復旧後の検証（2026-11-10 11:03 JST）

- `osada.us/api/v1/torikumi.json` と `o-sumo.pages.dev/api/v1/torikumi.json`: `updatedAt` / `resultUpdatedAt` が 2026-11-09T17:57:42+09:00、二日目は幕内 21/21・十両 14/14。三日目の取組予定（幕内 21・十両 13）も含む。
- 外部報道との照合: 大の里―藤凌駕は寄り切りで大の里（1勝1敗）、朝乃山―豊昇龍は寄り倒しで豊昇龍（2勝0敗）、霧島 2勝0敗。`banzuke.json` の星も一致。
- ブラウザーで `osada.us/20261109-torikumi/` を表示し、「更新日: 2026.11.09 17:57 JST」と結び（寄り倒し・豊昇龍 2勝0敗）までの決まり手を確認した。
- `osada.us/20261110-torikumi/` は 200。

## 三日目に向けた点検

- データ経路（Realtime Torikumi Direct Update → main への push → Cloudflare Pages ビルド）自体は正常で、新しい push があれば最新ビルドが本番になる。
- 再発条件は「古いコミットのビルドが新しいビルドより後に完成すること」。十両開始（14:15 頃）以降は、結果公開のたびに `osada.us/api/v1/torikumi.json` の `resultUpdatedAt` が main の値に追従しているかを確認する。

## 再発防止の候補（未着手）

- 案 1: 配信検証で本番 URL の `torikumi.json` の `updatedAt` を main のファイル値と比較し、一致しなければ失敗にする。メリット: 今回の巻き戻りを直接検知できる。デメリット: CDN キャッシュ（`max-age=60`）分の待ちが必要。
- 案 2: 定期ワークフローで本番の `updatedAt` と main を比較し、ずれが一定時間続いたら空コミットで再デプロイする。メリット: 自動復旧。デメリット: main の履歴が増え、原因が残ったまま隠れる。
- 案 3: Cloudflare Pages の Git 連携による自動ビルドをやめ、Actions から `wrangler pages deploy` で順序を管理する。メリット: デプロイ順序を自前で保証できる。デメリット: 移行範囲が大きく、Functions やブログ側の構成も見直しが必要。
