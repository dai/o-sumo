# Plan: 十一月場所（202611）への切替準備

対象リポジトリ: dai/o-sumo（ローカル: C:\dai\GitHub\o-sumo）
前提: 2026年十一月場所（九州場所）の新番付は 2026-10-26 朝に公式発表済み。
開催日程: 2026-11-08（日）初日 〜 2026-11-22（日）千秋楽、福岡国際センター。
現行データは九月場所（202609）。切替先の月キーは `202611`。

## 分担

- コア実装・データ生成・テスト実行: ローカル Muse（本書の手順で実施）
- 計画・進捗確認・PRレビュー・公開後検証: Muse（チャット側、GitHub経由）

## Phase 0: 切替可否の判定

1. `python scripts/preflight_current_basho.py` を実行（読み取り専用）。
   - 公式年間日程と公式番付API（幕内42名・十両28名）を照合する。
   - READY にならない場合は生成系を実行せず、FAIL のゲート名と内容を報告して止まる。
2. 「現行場所 = 202609」を参照している箇所を棚卸しする。
   対象は preflight の SOURCE_FILES と同範囲:
   `app/lib/archives-data.ts`、`app/lib/archive-basho-data.ts`、
   `app/lib/torikumi-routes.ts`、`public/_redirects`、`app/lib/sitemap.ts`、
   `vite.config.ts`、および自動更新ワークフロー2本
   （`.github/workflows/daily-data-update.yml`、
   `.github/workflows/realtime-torikumi-direct-update.yml`）。

## Phase 1: 九月場所の凍結（単独PR）

七月場所の前例（`app/lib/july2026-data.ts` / `app/lib/july2026-banzuke-data.ts`）と
同パターンで、九月場所を不変スナップショット化する。

1. `app/lib/september2026-data.ts`（取組）と
   `app/lib/september2026-banzuke-data.ts`（番付）を作成する。
2. `app/lib/archive-basho-data.ts` と `app/lib/archives-data.ts` に登録し、
   `/archives` と過去場所ルート（`/202609-banzuke/` 等）が
   スナップショットから表示されるようにする。
3. アーカイブ用テストを七月分（`app/lib/july2026-archive.test.ts`）と
   同パターンで追加する。
4. 検証: `npm test` / `npm run typecheck` / `npm run build` が全て通ること。
   ここまでを単独PRでマージする（切替と混ぜない）。

## Phase 2: 十一月場所への切替（1PRで同時検証）

1. `python scripts/update_sumo_data.py` で公式番付からデータを再生成し、
   `banzuke.json` / `torikumi.json` を 202611 に切り替える。
2. 力士プロフィールは `docs/rikishi-profile-refresh-runbook.md` の手順で更新
   （`--rikishi-only` 系）。新規関取の取り込みを確認する:
   新入幕の出羽ノ龍・嵐富士・旭海雄、再入幕の玉鷲、新十両の旭富士など。
3. 月キー由来ルートの生成を確認:
   `/202611-banzuke/`、`/202611-torikumi`、`/202611-yotei`、日別ルート。
   固定ルートを増やさず、生成データ由来の解決（`torikumi-routes.ts`）を使う。
4. sitemap・archives の現行表記を 202611 に更新する。
5. `basho-status` が 202611 を upcoming と判定すること、
   ホームが「公式取組発表待ち」の中立表示（力士名・合口などを出さない）
   になることを確認する。

## Phase 3: 検証

1. `npm ci` → `npm run typecheck` → `npm test`（全件）→ `npm run build`。
2. 公開JSON（`/api/v1/banzuke.json`、`/api/v1/torikumi.json` 等）が
   202611 を指すこと、Markdown ビューの生成が壊れていないことを確認する。
3. ローカル確認（DEVELOPMENT.md の確認先）:
   `/`、`/archives`、`/202609-banzuke/`（凍結側）、`/202611-banzuke/`（現行側）、
   `/rikishi`、代表的な力士プロフィール。
4. スモークテスト記録を十一月場所版として `docs/` に残す
   （前例: `docs/smoke-test-2026-05.md`）。

## Phase 4: 公開と初日への備え

1. PR → CI（test.yml）→ マージ → Cloudflare Pages 本番反映。
   本番 https://osada.us/202611-banzuke/ が開けることを確認する。
2. 初日の取組予定は前日 2026-11-07 に公式発表される想定。
   自動更新ワークフロー（daily-data-update / realtime-torikumi）が
   202611 の予定・結果を取り込むことを、11/7〜11/8 の実行ログで確認する。

## 注意点

- 取組日程データは公式側の公開が先になるため、Phase 2 の完了判定は
  「番付切替まで」に区切る。予定データの取り込みは Phase 4-2 で別途確認する。
- 新規力士のプロフィール画像（MiniMax 加工、`scripts/style_transfer_rikishi.py`）は
  別工程として切り分け、データ切替のブロッカーにしない。
- デザイン制約（DESIGN.md: 0px角・No-Line・Ink & Gold）と
  既存URL構造・trailing slash 正規化を壊さないこと。
- すべての新規テキストは `src/locales/ja/common.json` /
  `src/locales/en/common.json` のキー経由にする。
