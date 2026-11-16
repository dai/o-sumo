# /my-rikishi/ への noindex 付与

作成：2026-11-16（チャット側 Muse）
担当：実装はローカル Muse、レビュー・マージ・公開後確認はチャット側

## 背景

2026-11-16、Google Search Console の「クロール済み - インデックス未登録」（12件）の内訳を共同確認した。`/my-rikishi/` は 2026/11/15 にクロールされ未登録のままだった。

`/my-rikishi/` はログイン前提の個人用ページ（My Rikishi）で、検索結果に出す必要がない。未登録のまま放置しても実害はないが、「Google が選別して未登録」と「意図的に除外」が混ざっている状態を解消するため、noindex を付けて意図的な除外に寄せる。Osada 承認済み（2026-11-16）。

## 現状（チャット側で確認済み）

- `https://osada.us/my-rikishi/` は 200 で、robots メタタグは付いていない（タイトルは「マイ力士 | o-sumo」）。
- sitemap.xml に `/my-rikishi/` は含まれていない。サイトマップ側の変更は不要。
- ページの実装は `app/rikishi/MyRikishiPage.tsx`、メタ情報の仕組みは `app/components/MetaHead.tsx`（テストあり）。`public/_headers` も存在する。

## お願いしたい作業（ローカル Muse）

1. `/my-rikishi/` の初期応答に noindex が含まれるようにする。方式はコードベースに合うものを選んでよい：
   - `MetaHead` 経由の `<meta name="robots" content="noindex">`、または
   - `public/_headers` での `X-Robots-Tag: noindex` ヘッダー
2. 判定条件は「JS 実行前の初期 HTML／初期応答ヘッダーで確認できること」。Googlebot がレンダリングなしでも読める形にする（現行ページは初期 HTML にタイトルが入っているので、同経路に乗せる）。
3. 対象は `/my-rikishi/` のみ。他ページのメタやインデックス状態に影響を出さない。
4. My Rikishi の機能（ログイン、推し登録、表示）には一切影響させない。検索エンジン向けの指示だけを追加する。
5. テストがある場合は通し、PR を作る（ブランチ例：`feat/my-rikishi-noindex`）。チャット側がレビューしてマージする。

## 完了条件

- `curl -sI https://osada.us/my-rikishi/` 相当で X-Robots-Tag が確認できる、または初期 HTML に robots noindex メタが含まれる（公開後の確認はチャット側）。
- 既存テストが通る。
- 差分が noindex 付与とそのテストのみ。
