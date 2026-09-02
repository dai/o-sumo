import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildBlogFeed, loadBlogPosts, writeBlogFeedJson, type BlogFeed, type BlogFeedOptions, type BlogPost } from './blog-feed'

const BLOG_ORIGIN = 'https://blog.osada.us'
const BLOG_TITLE = 'o-sumo 読みもの'
const DEFAULT_IMAGE_URL = `${BLOG_ORIGIN}/og-default.jpg`

export interface BlogBuildOptions extends BlogFeedOptions {
  postsDirectory: string
  outputDirectory: string
  feedJsonPath: string
  ogImagePath: string
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}

function escapeXml(value: string): string {
  return escapeHtml(value)
}

function publicPosts(postsDirectory: string, options: BlogFeedOptions): BlogPost[] {
  return loadBlogPosts(postsDirectory, options)
    .filter((post) => !post.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug))
}

function documentHtml(title: string, description: string, canonical: string, stylesheetHref: string, content: string, type: 'article' | 'website' = 'website'): string {
  const fullTitle = title === BLOG_TITLE ? BLOG_TITLE : `${title} | ${BLOG_TITLE}`
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${DEFAULT_IMAGE_URL}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${BLOG_TITLE}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${DEFAULT_IMAGE_URL}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${stylesheetHref}">
</head>
<body>
  <header class="site-header"><div class="shell"><a class="site-title" href="/">${BLOG_TITLE}</a></div></header>
  <main class="shell">${content}</main>
</body>
</html>
`
}

function renderIndex(feed: BlogFeed): string {
  const posts = feed.items.map((post) => `
    <li class="post-list-item"><time datetime="${post.publishedAt}">${post.publishedAt}</time><h2><a href="/posts/${post.slug}/">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p></li>`).join('')
  return documentHtml(BLOG_TITLE, '相撲をより深く楽しむための読みもの。', `${BLOG_ORIGIN}/`, '/assets/blog.css', `
    <section class="intro"><h1>${BLOG_TITLE}</h1><p>相撲をより深く楽しむための読みもの。</p></section>
    <ol class="post-list">${posts}\n    </ol>`, 'website')
}

function renderArticle(post: BlogPost): string {
  return documentHtml(post.title, post.description, post.url, '../../assets/blog.css', `
    <article class="post">
      <header><time datetime="${post.publishedAt}">${post.publishedAt}</time><h1>${escapeHtml(post.title)}</h1><p class="author">dai</p></header>
      <div class="post-body">${post.bodyHtml}</div>
      <p class="return-link"><a href="https://osada.us/">osada.usへ戻る</a></p>
    </article>`, 'article')
}

function renderFeedXml(posts: BlogPost[]): string {
  const items = posts.slice(0, 20).map((post) => `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(post.url)}</link>
    <guid isPermaLink="true">${escapeXml(post.url)}</guid>
    <description>${escapeXml(post.description)}</description>
    <dc:creator>dai</dc:creator>
    <pubDate>${new Date(`${post.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate>
  </item>`).join('\n')
  const lastBuildDate = posts[0] ? new Date(`${posts[0].publishedAt}T00:00:00+09:00`).toUTCString() : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${BLOG_TITLE}</title>
  <link>${BLOG_ORIGIN}/</link>
  <description>相撲をより深く楽しむための読みもの。</description>
  <language>ja</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
</channel>
</rss>
`
}

function renderSitemapXml(posts: BlogPost[]): string {
  const urls = [`${BLOG_ORIGIN}/`, ...posts.map((post) => post.url)]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>
`
}

const BLOG_CSS = `@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700;8..60,800&display=swap');

:root {
  color-scheme: light dark;
  --paper: #f7f1e3;
  --sunken: #efe7d4;
  --ink: #1d1a16;
  --ink-muted: #5a534a;
  --vermilion: #9e2b20;
  --gold: #9a6d1e;
  --rule: #a89272;
  font-family: "Source Serif 4", "Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif;
}

* { box-sizing: border-box; }
html { background: var(--paper); color: var(--ink); }
body { margin: 0; min-width: 320px; line-height: 1.85; line-break: strict; overflow-wrap: break-word; text-spacing-trim: space-first; }
a { color: inherit; text-decoration-color: var(--gold); text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
a:hover { color: var(--vermilion); }
a:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; }
::selection { background: var(--vermilion); color: var(--paper); }
::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-thumb { background: var(--gold); border: 3px solid var(--paper); }
.shell { width: min(100% - 2.5rem, 72ch); margin: 0 auto; }
.site-header { border-bottom: 1px solid var(--rule); padding: 1.25rem 0; }
.site-title { font-size: 1.2rem; font-weight: 700; text-decoration: none; }
.intro { padding: 4.5rem 0 2.25rem; border-bottom: 3px solid var(--vermilion); }
h1, h2 { font-family: "Source Serif 4", "Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif; line-height: 1.35; text-wrap: balance; font-feature-settings: "palt" 1; }
h1 { margin: 0; font-size: clamp(2.1rem, 7vw, 4.5rem); }
h2 { margin: 0.35rem 0; font-size: clamp(1.4rem, 4vw, 2rem); }
.post-list { margin: 0; padding: 0; list-style: none; }
.post-list-item { border-bottom: 1px solid var(--rule); padding: 2rem 0; }
.post-list-item p, .intro p { margin: 0; }
time, .author { color: var(--ink-muted); font-variant-numeric: tabular-nums; }
.post { padding: 4rem 0; }
.post header { border-bottom: 3px solid var(--vermilion); padding-bottom: 2rem; }
.author { margin: 0.5rem 0 0; }
.post-body { margin-top: 2.5rem; }
.post-body h2, .post-body h3, .post-body h4 { font-feature-settings: "palt" 1; line-height: 1.45; text-wrap: balance; }
.post-body h2 { margin: 3.5rem 0 0.75rem; }
.post-body h3 { margin: 2.75rem 0 0.5rem; font-size: clamp(1.25rem, 3vw, 1.55rem); }
.post-body h4 { margin: 2rem 0 0.35rem; font-size: 1.1rem; color: var(--ink-muted); }
.post-body > :first-child { margin-top: 0; }
.post-body h2 + p, .post-body h3 + p, .post-body h4 + p { margin-top: 0; }
.post-body ul, .post-body ol { padding-inline-start: 1.5rem; }
.post-body li + li { margin-top: 0.5rem; }
.post-body li::marker { color: var(--gold); }
.post-body blockquote { margin: 1.5rem 0; padding: 0 1.25rem; border-inline-start: 1px solid var(--gold); color: var(--ink-muted); }
.post-body strong { font-weight: 700; }
.post-body img { display: block; max-width: 100%; height: auto; margin: 2rem 0; }
.post-body hr { border: 0; margin: 3.5rem auto; width: 0.4rem; height: 0.4rem; background: var(--vermilion); }
.post-body table { width: 100%; margin: 2rem 0; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.post-body th { text-align: start; font-weight: 700; padding: 0.5rem 0.75rem; border-bottom: 2px solid var(--rule); }
.post-body td { padding: 0.5rem 0.75rem; vertical-align: baseline; }
.post-body code { color: var(--vermilion); font-size: 0.9em; }
.post-body pre { margin: 2rem 0; padding: 1.25rem; background: var(--sunken); overflow-x: auto; line-height: 1.7; }
.post-body pre code { color: inherit; font-size: 0.85em; }
.return-link { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); }

@media (prefers-contrast: more) {
  a:focus-visible { outline-width: 3px; }
}

@media (prefers-color-scheme: dark) {
  :root { --paper: #1d1a16; --sunken: #262119; --ink: #f7f1e3; --ink-muted: #a89b86; --vermilion: #ec897b; --gold: #e0bb67; --rule: #8a7757; }
}

@media print {
  :root { --paper: #ffffff; --sunken: #f2f2f2; --ink: #101010; --ink-muted: #4a4a4a; --vermilion: #101010; --gold: #101010; --rule: #999999; }
  .site-header, .return-link { display: none; }
  .intro, .post header { border-bottom-width: 1px; }
  .post, .intro { padding-top: 0; }
  .post-body pre, .post-body blockquote, .post-body table { break-inside: avoid; }
  h1, h2, h3, h4 { break-after: avoid; }
}
`

function writeText(path: string, value: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, value, 'utf8')
}

export function buildBlogSite(options: BlogBuildOptions): BlogFeed {
  const feed = buildBlogFeed(options.postsDirectory, options)
  const posts = publicPosts(options.postsDirectory, options)
  rmSync(options.outputDirectory, { recursive: true, force: true })
  mkdirSync(options.outputDirectory, { recursive: true })
  writeText(join(options.outputDirectory, 'index.html'), renderIndex(feed))
  for (const post of posts) writeText(join(options.outputDirectory, 'posts', post.slug, 'index.html'), renderArticle(post))
  writeText(join(options.outputDirectory, 'feed.xml'), renderFeedXml(posts))
  writeText(join(options.outputDirectory, 'sitemap.xml'), renderSitemapXml(posts))
  writeText(join(options.outputDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://blog.osada.us/sitemap.xml\n')
  writeText(join(options.outputDirectory, '404.html'), documentHtml('ページが見つかりません', '指定されたページは見つかりません。', `${BLOG_ORIGIN}/404.html`, '/assets/blog.css', '<section class="intro"><h1>ページが見つかりません</h1><p><a href="/">読みものの一覧へ戻る</a></p></section>'))
  writeText(join(options.outputDirectory, 'assets', 'blog.css'), BLOG_CSS)
  copyFileSync(options.ogImagePath, join(options.outputDirectory, 'og-default.jpg'))
  writeBlogFeedJson(feed, options.feedJsonPath)
  return feed
}
