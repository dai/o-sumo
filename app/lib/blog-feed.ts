import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

export interface BlogFeedItem {
  slug: string
  title: string
  description: string
  url: string
  publishedAt: string
  author: 'dai'
}

export interface BlogFeed {
  updatedAt: string
  items: BlogFeedItem[]
}

export interface BlogPost extends BlogFeedItem {
  draft: boolean
  body: string
  bodyHtml: string
}

export interface BlogFeedOptions {
  todayJst?: string
}

const BLOG_ORIGIN = 'https://blog.osada.us'
const POST_FILENAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const FRONTMATTER_KEYS = new Set(['title', 'description', 'publishedAt', 'draft'])
const markdown = new MarkdownIt({ html: false })

function dateFromParts(value: string, label: string): string {
  const match = DATE_ONLY.exec(value)
  if (!match) throw new Error(`Invalid ${label} date: ${value}`)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Invalid ${label} date: ${value}`)
  }
  return value
}

function todayInJst(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = new Map(parts.map((part) => [part.type, part.value]))
  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`
}

function extractPublishedAtToken(rawMatter: string): string {
  const line = rawMatter.split(/\r?\n/).find((candidate) => /^publishedAt\s*:/.test(candidate))
  if (!line) throw new Error('Missing frontmatter key: publishedAt')
  const token = line.slice(line.indexOf(':') + 1).trim()
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    return token.slice(1, -1)
  }
  return token
}

function validatePost(filePath: string, options: BlogFeedOptions): BlogPost {
  const filename = filePath.split(/[\\/]/).pop() ?? ''
  const filenameMatch = POST_FILENAME.exec(filename)
  if (!filenameMatch) throw new Error(`Invalid post filename or slug: ${filename}`)
  const [, filenameDate, slug] = filenameMatch
  const source = readFileSync(filePath, 'utf8')
  const parsed = matter(source)
  const keys = Object.keys(parsed.data)
  if (keys.some((key) => !FRONTMATTER_KEYS.has(key)) || keys.length !== FRONTMATTER_KEYS.size) {
    throw new Error(`Invalid frontmatter keys in ${filename}`)
  }
  if (typeof parsed.data.title !== 'string' || parsed.data.title.trim() === '') throw new Error(`Invalid frontmatter title in ${filename}`)
  if (typeof parsed.data.description !== 'string' || parsed.data.description.trim() === '') throw new Error(`Invalid frontmatter description in ${filename}`)
  if (typeof parsed.data.draft !== 'boolean') throw new Error(`Invalid frontmatter draft in ${filename}`)

  const publishedAt = dateFromParts(extractPublishedAtToken(parsed.matter), 'publishedAt')
  if (filenameDate !== publishedAt) throw new Error(`Filename date does not match publishedAt in ${filename}`)
  const today = dateFromParts(options.todayJst ?? todayInJst(), 'today')
  if (publishedAt > today) throw new Error(`Future publishedAt date in ${filename}`)

  return {
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    url: `${BLOG_ORIGIN}/posts/${slug}/`,
    publishedAt,
    author: 'dai',
    draft: parsed.data.draft,
    body: parsed.content.trim(),
    bodyHtml: markdown.render(parsed.content),
  }
}

export function loadBlogPosts(postsDirectory: string, options: BlogFeedOptions = {}): BlogPost[] {
  const posts = readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => validatePost(join(postsDirectory, entry.name), options))
  const slugs = new Set<string>()
  for (const post of posts) {
    if (slugs.has(post.slug)) throw new Error(`Duplicate slug: ${post.slug}`)
    slugs.add(post.slug)
  }
  return posts
}

export function buildBlogFeed(postsDirectory: string, options: BlogFeedOptions = {}): BlogFeed {
  const publicPosts = loadBlogPosts(postsDirectory, options)
    .filter((post) => !post.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
  return {
    updatedAt: publicPosts[0]?.publishedAt ?? '',
    items: publicPosts.map(({ draft: _draft, body: _body, bodyHtml: _bodyHtml, ...item }) => item),
  }
}

export function writeBlogFeedJson(feed: BlogFeed, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8')
}
