# o-sumo 読みもの: approved design

Status: Approved for implementation on branch `blog-section`.

## Purpose and boundaries

`blog.osada.us` に、日本語Markdownベースの静的ブログ「o-sumo 読みもの」を新設する。同じ `dai/o-sumo` repository から既存main siteとは別のCloudflare Pages projectを配信する。`osada.us`のホームでは、ヘッダーの直後かつ現在のヒーローより前に最新記事を最大9件表示する。

初回の範囲には検索、タグ、カテゴリ、コメント、関連記事、記事画像、管理画面、日英翻訳を含めない。記事は日本語のみ、公開著者名は常に`dai`とする。ブログ更新のPRにはMarkdownと生成済み`blog.json`を同時に含める。

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

## Main-site updates section

`BlogUpdatesSection`をホームヘッダー直後かつ現在のヒーローより前に置く。見出しは日本語UIで「読みもの」、英語UIで「Stories」とする。

各項目は公開日と日本語タイトルだけを表示し、タイトルに`lang="ja"`を付ける。記事リンクと「すべての記事」は同じタブで`blog.osada.us`へ遷移する。公開日降順で1件から9件まで表示し、0件の場合はセクション全体を描画しない。

レイアウトはPCで3列x最大3行、タブレットで2列、モバイルで1列とする。現在の九月場所ヒーローと「今日の見どころ」の内部構造は変更しない。

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
