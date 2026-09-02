import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildBlogSite } from './blog-build'

const temporaryDirectories: string[] = []

interface Fixture {
  root: string
  posts: string
  output: string
  feedJson: string
  mainOutput: string
  image: string
}

function fixture(): Fixture {
  const root = mkdtempSync(join(tmpdir(), 'o-sumo-blog-build-'))
  temporaryDirectories.push(root)
  const posts = join(root, 'posts')
  const output = join(root, 'dist-blog')
  const feedJson = join(root, 'public', 'api', 'v1', 'blog.json')
  const mainOutput = join(root, 'dist')
  const image = join(root, 'og-default.jpg')
  mkdirSync(posts)
  mkdirSync(output)
  mkdirSync(mainOutput)
  writeFileSync(image, 'blog-og-image', 'utf8')
  writeFileSync(join(root, 'placeholder'), '', 'utf8')
  return { root, posts, output, feedJson, mainOutput, image }
}

function writePost(directory: string, filename: string, frontmatter: string, body = '本文です。'): void {
  writeFileSync(join(directory, filename), `---\n${frontmatter}\n---\n\n${body}\n`, 'utf8')
}

function outputTree(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? outputTree(join(directory, entry.name)).map((path) => `${entry.name}/${path}`) : [entry.name])
    .sort()
}

function build(site: Fixture): void {
  buildBlogSite({
    postsDirectory: site.posts,
    outputDirectory: site.output,
    feedJsonPath: site.feedJson,
    ogImagePath: site.image,
    todayJst: '2026-09-30',
  })
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('standalone blog build', () => {
  it('writes the complete static output tree without touching a sibling main output directory', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-first.md', 'title: 最初の記事\ndescription: 説明です。\npublishedAt: 2026-09-01\ndraft: false')
    writeFileSync(join(site.mainOutput, 'keep.txt'), 'main output remains', { encoding: 'utf8', flag: 'w' })
    writeFileSync(join(site.output, 'stale.txt'), 'remove me', { encoding: 'utf8', flag: 'w' })

    build(site)

    expect(outputTree(site.output)).toEqual([
      '404.html',
      'assets/blog.css',
      'feed.xml',
      'index.html',
      'og-default.jpg',
      'posts/first/index.html',
      'robots.txt',
      'sitemap.xml',
    ])
    expect(existsSync(join(site.output, 'stale.txt'))).toBe(false)
    expect(readFileSync(join(site.mainOutput, 'keep.txt'), 'utf8')).toBe('main output remains')
    expect(readFileSync(join(site.output, 'og-default.jpg'), 'utf8')).toBe('blog-og-image')
  })

  it('loads the established bilingual font stack in generated CSS', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-fonts.md', 'title: 記事\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)

    const css = readFileSync(join(site.output, 'assets', 'blog.css'), 'utf8')
    expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700;8..60,800&display=swap');")
    expect(css).toContain('font-family: "Source Serif 4", "Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif;')
    expect(css).toContain('h1, h2 { font-family: "Source Serif 4", "Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif;')
  })

  it('excludes drafts from HTML, RSS, sitemap, and generated JSON', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-public.md', 'title: 公開\ndescription: 公開説明\npublishedAt: 2026-09-01\ndraft: false')
    writePost(site.posts, '2026-09-02-draft.md', 'title: 下書き\ndescription: 非公開説明\npublishedAt: 2026-09-02\ndraft: true')

    build(site)

    for (const path of ['index.html', 'feed.xml', 'sitemap.xml']) {
      expect(readFileSync(join(site.output, path), 'utf8')).not.toContain('draft')
      expect(readFileSync(join(site.output, path), 'utf8')).not.toContain('下書き')
    }
    expect(existsSync(join(site.output, 'posts', 'draft', 'index.html'))).toBe(false)
    expect(readFileSync(site.feedJson, 'utf8')).not.toContain('draft')
  })

  it('renders canonical and social metadata for the index and article pages', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-meta.md', 'title: 記事タイトル\ndescription: 記事説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)

    const index = readFileSync(join(site.output, 'index.html'), 'utf8')
    const article = readFileSync(join(site.output, 'posts', 'meta', 'index.html'), 'utf8')
    expect(index).toContain('<title>o-sumo 読みもの</title>')
    expect(index).toContain('<link rel="canonical" href="https://blog.osada.us/">')
    expect(index).toContain('<meta property="og:image" content="https://blog.osada.us/og-default.jpg">')
    expect(index).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(article).toContain('<title>記事タイトル | o-sumo 読みもの</title>')
    expect(article).toContain('<meta name="description" content="記事説明">')
    expect(article).toContain('<link rel="canonical" href="https://blog.osada.us/posts/meta/">')
    expect(article).toContain('<meta property="og:url" content="https://blog.osada.us/posts/meta/">')
  })

  it('escapes frontmatter and XML values while disabling raw HTML and unsafe links', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-safe.md', 'title: "題 & <危険>"\ndescription: "説明 & <危険>"\npublishedAt: 2026-09-01\ndraft: false', '<script>alert(1)</script>\n\n[jump](javascript:alert(1))')

    build(site)

    const article = readFileSync(join(site.output, 'posts', 'safe', 'index.html'), 'utf8')
    const feed = readFileSync(join(site.output, 'feed.xml'), 'utf8')
    expect(article).toContain('題 &amp; &lt;危険&gt;')
    expect(article).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(article).not.toContain('<script>alert(1)</script>')
    expect(article).not.toMatch(/href="javascript:/i)
    expect(feed).toContain('<title>題 &amp; &lt;危険&gt;</title>')
    expect(feed).toContain('<description>説明 &amp; &lt;危険&gt;</description>')
  })

  it('limits RSS to the newest twenty public posts in feed order', () => {
    const site = fixture()
    for (let day = 1; day <= 21; day += 1) {
      const date = `2026-09-${String(day).padStart(2, '0')}`
      writePost(site.posts, `${date}-post-${day}.md`, `title: 記事${day}\ndescription: 説明${day}\npublishedAt: ${date}\ndraft: false`)
    }

    build(site)

    const feed = readFileSync(join(site.output, 'feed.xml'), 'utf8')
    expect((feed.match(/<item>/g) ?? [])).toHaveLength(20)
    expect(feed.indexOf('記事21')).toBeLessThan(feed.indexOf('記事20'))
    expect(feed).not.toContain('記事1</title>')
  })

  it('uses Dublin Core creator metadata instead of invalid RSS author text', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-creator.md', 'title: 記事\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)

    const feed = readFileSync(join(site.output, 'feed.xml'), 'utf8')
    expect(feed).toContain('<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">')
    expect(feed).toContain('<dc:creator>dai</dc:creator>')
    expect(feed).not.toContain('<author>dai</author>')
  })

  it('uses the exact blog canonical origin in sitemap and robots', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-origin.md', 'title: 記事\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)

    expect(readFileSync(join(site.output, 'sitemap.xml'), 'utf8')).toBe(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://blog.osada.us/</loc></url>\n  <url><loc>https://blog.osada.us/posts/origin/</loc></url>\n</urlset>\n`)
    expect(readFileSync(join(site.output, 'robots.txt'), 'utf8')).toBe('User-agent: *\nAllow: /\nSitemap: https://blog.osada.us/sitemap.xml\n')
  })

  it('writes a 404 page with a link back to the blog root', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-01-not-found.md', 'title: 記事\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)

    expect(readFileSync(join(site.output, '404.html'), 'utf8')).toContain('<a href="/">読みものの一覧へ戻る</a>')
  })

  it('repeats builds with byte-identical text outputs and generated JSON', () => {
    const site = fixture()
    writePost(site.posts, '2026-09-02-new.md', 'title: 新しい記事\ndescription: 新しい説明\npublishedAt: 2026-09-02\ndraft: false')
    writePost(site.posts, '2026-09-01-old.md', 'title: 古い記事\ndescription: 古い説明\npublishedAt: 2026-09-01\ndraft: false')

    build(site)
    const first = new Map(outputTree(site.output).filter((path) => path.endsWith('.html') || path.endsWith('.xml') || path.endsWith('.txt') || path.endsWith('.css')).map((path) => [path, readFileSync(join(site.output, path), 'utf8')]))
    const firstJson = readFileSync(site.feedJson, 'utf8')
    build(site)

    expect(outputTree(site.output).filter((path) => path.endsWith('.html') || path.endsWith('.xml') || path.endsWith('.txt') || path.endsWith('.css')).map((path) => [path, readFileSync(join(site.output, path), 'utf8')])).toEqual([...first])
    expect(readFileSync(site.feedJson, 'utf8')).toBe(firstJson)
    expect(relative(site.root, site.output)).toBe('dist-blog')
  })
})
