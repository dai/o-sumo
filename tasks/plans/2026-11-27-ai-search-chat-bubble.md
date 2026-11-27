# AI Search チャットバブル導入 手順書

作成：2026-11-27（チャット側 Muse）
宛先：ローカル実装（Ember）
対象リポジトリ：dai/o-sumo

## 目的

o-sumo の全ページ右下に Cloudflare AI Search のチャットバブル（`<chat-bubble-snippet>`）を設置し、訪問者がサイトの内容について自然文で質問できるようにする。先行して計画していた検索バー／モーダルではなく、チャットバブルを先に導入する。

## 前提（チャット側で確認済み・2026-11-27）

- 公開エンドポイントはカスタムドメイン **https://ask.osada.us/** で稼働中。
  - `POST /search`：200、o-sumo の索引を返す
  - `POST /chat/completions`：200、「大の里はどんな力士ですか？」に索引ベースの回答が返ることを確認済み
  - `POST /mcp`：200
- 索引からの /my-rikishi/ 除外（`**/my-rikishi*`）は ask 側インスタンスにも反映済みで、検索結果に出ないことを確認済み。
- スニペット用スクリプトの配信元（`https://4d030f76-bec5-4530-b34b-1dc45ea8dc81.search.ai.cloudflare.com/assets/v0.0.25/search-snippet.es.js`）も 200 で応答する。
- 公式ドキュメント：
  - UI snippets https://developers.cloudflare.com/ai-search/configuration/retrieval/public-endpoint/embed-search-snippets/
  - スニペット playground（属性と CSS 変数の一覧・コード生成）https://search.ai.cloudflare.com/

## 事前作業（Osada・ダッシュボード）

- ask 側インスタンスの Settings → Public Endpoint → **Authorized hosts** に `https://osada.us` が入っていることを確認する。無ければ追加して保存する（CORS。これが無いと本番ページからエンドポイントを呼べない）。
- ローカル開発でも確認する場合は、開発用オリジン（例 `http://localhost:3000`）も一時的に追加する。本番投入時に残すのは `https://osada.us` のみでよい。

## 実装手順（Ember）

1. パッケージを入れる。
   ```
   npm install @cloudflare/ai-search-snippet
   ```
2. 全ページ共通のルートレイアウトで import し、バブルを配置する。
   ```tsx
   import "@cloudflare/ai-search-snippet";

   <chat-bubble-snippet
     api-url="https://ask.osada.us/"
     placeholder="力士や取組について聞いてみる"
     theme="auto"
   />
   ```
   - React／Next.js で型エラーになる場合は、公式ドキュメントの framework 手順に従い型宣言（`*.d.ts`）を追加する。
   - `api-url` は定数1箇所に集約する。
3. UI 文言は日本語にする。`placeholder` と `translations` 属性で、入力欄・ボタン類の文字列を日本語化する（最終文言はプレビューで目視確認できる形で出すこと）。
4. 見た目は CSS カスタムプロパティ（`--search-snippet-*`）で o-sumo の配色に寄せる。ライト／ダーク両対応（`theme="auto"` 前提）で崩れないこと。
5. 配置の干渉チェック：バブルが既存 UI（イマココメーター、「本日の取組」カード、フッター等）とモバイル表示で重なって操作を妨げないこと。必要ならオフセット用の CSS で逃がす。

## 注意

- 回答は AI Search の索引（同期サイクル24時間）に基づく。**当日の取組結果のような鮮度が要る情報は正確に答えられない前提**で、訪問者に「その日の結果は取組ページで」という誤解のない導線・文言にすること。
- 索引に無い情報をモデルが補って答える場合がある。プレビューで数問試し、明らかな捏造が出る質問パターンを把握しておくこと。
- /my-rikishi/ のようなログイン前提ページは索引から除外済み。回答の根拠に個人向けページが出ないことも確認対象に含める。

## 検証

- プレビュー／本番でバブルを開き、「大の里はどんな力士ですか？」に索引ベースの回答が返ること。
- 「お気に入りの力士はどこで管理しますか？」のような質問でも、/my-rikishi/ が根拠・リンクとして提示されないこと。
- モバイル幅でバブルとチャット画面が崩れず、既存 UI の操作を妨げないこと。
- 既存のテストとビルドが通ること。
- PR マージ後、チャット側 Muse が本番で再確認して完了とする。

## 分担

- Authorized hosts の確認・追加（ダッシュボード）：Osada
- 実装：Ember（ローカル）
- PR レビュー・公開後検証：チャット側 Muse
