# o-sumo 読みもの: approved design

Status: Approved for implementation on branch `blog-section`.

## Purpose and boundaries

`blog.osada.us` に、日本語Markdownベースの静的ブログ「o-sumo 読みもの」を新設する。同じ `dai/o-sumo` repository から既存main siteとは別のCloudflare Pages projectを配信する。`osada.us`のホームでは、ヘッダーの直後かつ現在のヒーローより前に最新記事を最大9件表示する。

初回の範囲には検索、タグ、カテゴリ、関連記事、記事画像、管理画面、日英翻訳を含めない。訪問者コメントは、blog.osada.us記事ページ末尾にgiscus (GitHub Discussions連携) として読み込み専用で表示する (o-sumo本体には表示しない)。記事は日本語のみ、公開著者名は常に`dai`とする。ブログ更新のPRにはMarkdownと生成済み`blog.json`を同時に含める。

## Content source and validation

実装時に`gray-matter`、`markdown-it`、`tsx`をdevelopment dependenciesとして追加する。この承認済み設計記録を作成する作業では、依存関係やproduction codeを追加しない。

記事は`blog/posts/YYYY-MM-DD-<slug>.md`で管理する。frontmatterは次の4項目だけを許可する。

```yaml
title: o-sumo 読みものを始めます
description: o-sumoに、相撲をより深く楽しむための読みものを新設します。
publishedAt: 2026-09-01
draft: false
```

ファイル名の日付と`publishedAt`の不一致、不正日付、重複slug、必須項目の欠落、未来日付はbuild errorとする。未来日付のdate-only比較は`Asia/Tokyo`で行う。`markdown-it`は`html: false`で実行し、記事本文の生HTMLを無効化する。

`draft: true`の記事はブログ一覧・記事ページ、RSS、sitemap、JSONのすべてから除外する。公開記事は`publishedAt`の降順で扱う。

## Build outputs and feed contract

`scripts/build_blog.ts`を生成器として実装し、`npm run blog:generate`でブログ配信物とトップ連携用JSONを生成する。`npm run blog:build`はブログ配信用のbuild commandとする。ブログ配信物は既存main siteの`dist`とは独立した`dist-blog/`にのみ出力する。

`dist-blog/`には次を生成する。

- `/index.html`
- `/posts/<slug>/index.html`
- `/feed.xml`
- `/sitemap.xml`
- `/robots.txt`
- `/404.html`
- `/assets/blog.css`
- `/og-default.jpg`

ブログのSEO、404、robots、sitemap、CSS assetsは`dist-blog`へ直接生成し、既存main-siteの`public`配下にあるSEOファイルとは混在させない。記事のcanonical URLは`https://blog.osada.us/posts/<slug>/`とする。description、OG、Twitter metadataも`https://blog.osada.us`を正規originとして生成する。

`/feed.xml`はRSS 2.0で、最新20件の公開記事を含める。sitemapには公開記事だけを含める。

トップ連携用に、コミット対象の`public/api/v1/blog.json`を生成する。main siteはこのファイルを`news-data.ts`と同じ型付き静的import方式で読む。JSONの契約は次のとおりとする。

```ts
interface BlogFeedItem {
  slug: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  author: 'dai';
}

interface BlogFeed {
  updatedAt: string;
  items: BlogFeedItem[];
}
```

`items`はすべての公開記事を公開日降順で持つ。公開記事が0件の場合、`updatedAt`は空文字列（`''`）とする。これは実装上必須の`string`型と一致する。公開記事がある場合、`updatedAt`は最新公開記事の`publishedAt`であり、build時刻を使用しない。CIは再生成後に`git diff --exit-code -- public/api/v1/blog.json`を実行し、同期漏れを検出する。

## Blog experience and visual design

デザインモードはReadとする。既存のDigital Washi、Shippori Mincho、Source Serif 4、墨・朱・金の配色を継承する。ブログ体験にはクライアントJavaScriptを追加しない。角はsharp cornersとし、丸角や独自テーマ切替を追加しない。light/darkは`prefers-color-scheme`で切り替える。

一覧には公開日、タイトル、descriptionを表示する。記事ページにはタイトル、公開日、著者`dai`、本文、`osada.usへ戻る`を表示する。

## Main-site Greeting section

`MonomosuSection` の内部に、h3として`GreetingSection`をネストする。`blogFeed.items[0]` (公開記事の最新1件) を editor's note カードとして表示するセクション。見出しは日本語UIで「編集者より」、英語UIで"From the Editor"とする。記事リンクと「すべての記事」は同じタブで`blog.osada.us`へ遷移する。

PR #625 で追加された`BlogUpdatesSection` (ホームの「読みもの」リスト) は撤去する。MonomosuSection の sr-only h2 を visible h2 に格上げし (バステキストを `monomosuBadge` "物申す" / "VOICE" に再利用)、GreetingSection はその h2 の直下 h3 として描画する。見出し階層は `h1 (page title) > h2 物申す / VOICE > h3 編集者より / From the Editor > h4 (記事タイトル)` を維持する。カードがない (公開記事 0 件) 場合は `null` を返却して MonomosuSection 自体は常に出力する。

記事タイトルとdescriptionのみをカードに表示し、リスト形式は使わない。公開日降順の最新 1 件を切り出すロジックは `blogFeed.items[0]` (build時に降順ソート済契約) を `getLatestBlogPost()` helper で参照する。レイアウトはMonomosuSectionの下、textarea drawerの前に配置する。

## Visitor Comments (giscus)

`blog.osada.us` の記事ページ末尾に giscus (https://giscus.app) クライアントスクリプトを読み込み、訪問者がGitHub Discussions (`dai/o-sumo`) の "Announcements" カテゴリにコメントを投稿できるようにする。o-sumo本体 (`osada.us`) には表示せず、`blog.osada.us` のみがComments widget を読み込む。

- repository: `dai/o-sumo` (Discussions 有効化が前提)
- category: "Announcements"
- thread mapping: pathname
- theme: `preferred_color_scheme` (light/dark 連動)
- strict: `0` (匿名書き込みを許可しつつ、GitHub アカウント認証を必須化)
- reactions: `1`、metadata: `0`、input position: `bottom`、lang: `ja`

`app/lib/blog-build.ts` の `renderArticle` 関数で `<div id="giscus-comments"></div>` を return link の前に追加し、`documentHtml` の `</body>` 直前に `<script src="https://giscus.app/client.js">` を静的埋め込みする。`data-repo-id` と `data-category-id` は giscus.app で取得した値を blog-build.ts の定数として運用する。本 PR 時点で実 ID を採用済 (`GISCUS_REPO_ID = 'R_kgDORaEFlg'`, `GISCUS_CATEGORY_ID = 'DIC_kwDORaEFls4DFyWu'`)。将来カテゴリを作り直した場合は同定数を差し替える。

スパム対策は GitHub Discussions のネイティブ moderation (ピン留め / lock / 削除) に委譲する。Paid プラン移行や高頻度ポーリング (`codex-instruction.md` 絶対制約 #2, #3) とは独立した静的埋め込み実装とし、`functions/` および Cloudflare Workers には一切触らない。

## Initial article

`blog/posts/2026-09-01-osumo-yomimono-start.md`を初回公開する。本文は次の3段落で構成する。

1. o-sumoに「読みもの」を新設し、番付や取組の数字だけでは伝わりにくい背景を紹介する。
2. 場所ごとの見どころ、力士、決まり手、相撲文化、サイトのデータから気づいたことを扱う。
3. o-sumoは日本相撲協会の公式サイトではない独立したファンサイトであり、正式情報は公式発表を確認するよう案内する。

## Verification requirements

生成器はfrontmatter、日付一致、重複slug、未来日、draft除外、公開順、生HTML無効化、canonical、RSS、sitemapを検証する。トップUIは0件非表示、1件表示、9件上限、公開順、日付、`lang="ja"`、一覧リンクを検証する。

全体では`npm test`、`npm run typecheck`、`npm run build`、`npm run blog:build`、`git diff --check`を実行する。Wranglerで`dist`と`dist-blog`を別々に配信し、トップ、一覧、記事、RSS、sitemap、404を確認する。ブラウザでは1280pxで3列x3行、タブレットで2列、390pxで1列かつ横スクロール0、light/dark、可視focus、見出し階層、記事遷移を確認する。

## Cloudflare release design

Cloudflare Pages project名は`o-sumo-blog`とする。repositoryは`dai/o-sumo`、production branchは`main`、root directoryはrepository root、build commandは`npm ci && npm run blog:build`、output directoryは`dist-blog`、environmentは`NODE_VERSION=22`とする。

最初のPreviewを検証してから、Pages Custom domainsから`blog.osada.us`を関連付ける。DNSだけを先に手動追加しない。ProductionではHTTPS、canonical、OG、RSS、sitemap、トップからの記事遷移を確認する。

`blog.osada.us`がactiveになった後に限り、productionの`o-sumo-blog.pages.dev`をaccount-level Cloudflare Bulk Redirectで`blog.osada.us`へ301転送する。このredirectはpathとqueryを保持する。検証結果、Pages URL、custom domain状態を`tasks/todo.md`のReviewへ記録してからcommit、push、PRを作成する。
