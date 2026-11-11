# /mcp HTMLランディング — Wonder向け指示書ドラフト

作成: 2026-11-11（チャット側 Muse による下書き。未承認・未push）
元依頼: Osada「/mcp にアクセスすると今はjsonコードが見えるけどhtmlでも表示できるようにする」（2026-11-11）
関連: Parallel MCP の活用ケース紹介（2026-11-11 14:27 JST 済み）のうち No.1。No.2〜5（追加手順ページの同梱は本件に含む／ツール結果のUI／リソース・プロンプト／フィードバックツール）は本件の対象外。

## 現状（2026-11-11 15:21 JST にライブ確認済み）

- ブラウザで `https://osada.us/mcp` を GET すると、JSON が1行だけ表示される:
  `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Method not allowed."},"id":null}`
- つまり人間が開いても何のサーバーか、どう繋ぐかが分からない。MCP クライアントからの POST は従来どおり動作している（custom.osumo で5ツール動作確認済み）。
- 公開ツール5点: `search_rikishi` / `get_rikishi_profile` / `get_banzuke` / `get_torikumi` / `list_basho`（認証なし）

## やること

GET の `Accept` ヘッダーで出し分ける:

- `Accept: text/html` のブラウザアクセス → 人間向け HTML ランディングを返す
- それ以外（MCP クライアントの POST、JSON 期待の GET）→ 現状どおり JSON-RPC 応答を返す（挙動を変えない）

## HTML に載せる内容

1. サーバー概要: o-sumo の公開 MCP サーバー、番付・取組・力士名鑑を返す、認証なし、読み取り専用
2. ツール一覧（5点、上記）: 名前・1行説明・引数の例（例: `get_torikumi` は `YYYYMMDD` 指定）
3. 接続 URL のコピペ欄: `https://osada.us/mcp`（コピーボタン付き）
4. 追加手順: Claude / ChatGPT / Cursor / Muse への追加方法を短く（各クライアント名＋設定例またはリンク）
5. 関連リンク: o-sumo トップ（https://osada.us/）、利用規約（https://osada.us/terms/）、公式 MCP レジストリ掲載 `us.osada/o-sumo`（公開後にリンク追加。未公開の間は載せない）

## 先に調べること（実装上の不確実点）

- `/mcp` は Cloudflare の WebMCP オプションで有効化されている（2026-11-02）。Accept による出し分けが WebMCP の設定で可能か、Worker 側のルートで受ける必要があるかを確認すること。
- どちらにせよ MCP の POST 応答と5ツールの動作を壊さないこと。HTML 追加だけが目的で、エンドポイントの URL・認証・ツール仕様は変えない。

## 受け入れ条件

- ブラウザで `/mcp` を開くと HTML ランディングが表示され、スマホでも読める
- `curl https://osada.us/mcp`（Accept なし）は従来どおり JSON-RPC のエラーを返す
- MCP クライアント（custom.osumo）から5ツールが従来どおり使える
- 既存デザインルールの範囲で、o-sumo の見た目に合わせる

## 進め方（分担どおり）

- 実装: ローカル Muse（Wonder）。ブランチ名の提案: `docs/mcp-html-landing`
- チャット側: 実装 PR のレビューと公開後検証（ブラウザ GET で HTML 表示、MCP 5ツール動作確認）
