# AI Search 公開エンドポイント＋サイト内検索スニペット導入 指示書

作成：2026-11-26（チャット側 Muse）
更新：2026-11-28（着手ゲート通過と公開エンドポイント確定を反映）
対象リポジトリ：dai/o-sumo

## 目的

Cloudflare AI Search（Search for Agents で作成済みのインスタンス）の公開エンドポイントを使い、o-sumo のサイト内に公式スニペットによる検索 UI（検索バー／検索モーダル）を設置する。訪問者がサイト内検索を使えるようにするのが目的。エージェント向け導線（`/.well-known/search` と自前 MCP）は既存のままで、本件の対象外。

## 実施条件（着手ゲート）— 通過済み

- ~~Search for Agents の索引から `https://osada.us/my-rikishi/` が除外されたことをチャット側が確認するまで着手しない。~~
  - **2026-11-27、3経路すべて（Search for Agents 本体・公開エンドポイント・ask.osada.us）で除外を確認済み。ゲート通過。**
  - 効いた除外ルールは `**/my-rikishi*`（当初の `**/my-rikishi/*` は /my-rikishi/ 本体にマッチせず不発だった）。
  - sitemap.xml に /my-rikishi/ は元々含まれていない（Discover がリンク経由で拾っていた）。

## 手順1（Osada・Cloudflare ダッシュボード）— 完了済み

インスタンス設定 URL：
https://dash.cloudflare.com/2edea25c8638f85f44d5c0108bdcd85f/ai/ai-search/namespace/default/instance/search-for-agents-4191b35bbb860d6b1dc705a6a88eba7e/settings

1. ~~Settings → Public Endpoint → **Enable Public Endpoint** をオンにする。~~ 有効化済み。
2. Public Endpoint URL（確定）：
   **https://bbcb1321-df13-4e2c-a1a5-1c9caf7cee91.search.ai.cloudflare.com/**
3. Authorized hosts：`https://osada.us` が登録済みであることを、2026-11-28 にチャット側が CORS プリフライト（Origin: https://osada.us に対して Access-Control-Allow-Origin が返ること）で確認済み。ローカルで動作確認する場合は開発用オリジン（例 `http://localhost:3000`）の追加が別途必要。
4. ~~Public Endpoint URL を実装側へ渡す。~~ 本書に記載済みのため追加作業なし。

## 手順2（ローカル Muse・実装）

- 方式は公式ドキュメントに従う：
  - "Add search to your website" https://developers.cloudflare.com/ai-search/how-to/add-search-to-your-website/
  - "UI snippets" https://developers.cloudflare.com/ai-search/configuration/retrieval/public-endpoint/embed-search-snippets/
- ライブラリ `@cloudflare/ai-search-snippet`（Web Components）を使う。React へ組み込む場合は型宣言ファイル（`*.d.ts`）の追加が必要な点に注意。
- コンポーネントは当面 `<search-modal-snippet>`（Cmd/Ctrl+K で開くモーダル）と `<search-bar-snippet>` を候補とし、既存レイアウトを崩さない配置にする。配置案はプレビューで目視確認できる形で出すこと。
- `api-url` には **https://bbcb1321-df13-4e2c-a1a5-1c9caf7cee91.search.ai.cloudflare.com/** を使う（チャットバブル PR #772 の ask.osada.us とは別インスタンスなので取り違えないこと）。値は定数1箇所に集約し、複数ファイルへ散らさない。
- プレビュー環境（*.pages.dev）から動作確認する場合は、そのオリジンを Authorized hosts へ追加する必要がある（Osada・ダッシュボード）。本番オリジンは登録済み。
- 見た目は CSS カスタムプロパティ（`--search-snippet-*`）で o-sumo のデザインに合わせる。ライト／ダーク両方で崩れないことを確認する。

## 検証（実装側＋チャット側）

- 本番で検索 UI から「大の里」を検索し、力士プロフィール（/rikishi/4227/）が結果の先頭に返ること。
- **検索結果に /my-rikishi/ が出ないこと**（最重要）。
- モバイル表示でレイアウトが崩れないこと。
- PR マージ後、チャット側が本番で再確認して完了とする。

## 分担

- ダッシュボード操作（手順1）：Osada（完了済み）
- 実装（手順2）：ローカル Muse
- PR レビュー・公開後検証：チャット側 Muse
