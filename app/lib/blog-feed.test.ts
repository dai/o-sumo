import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildBlogFeed, loadBlogPosts, writeBlogFeedJson } from './blog-feed'

const tempDirectories: string[] = []

function postsDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'o-sumo-blog-'))
  tempDirectories.push(directory)
  return directory
}

function writePost(directory: string, filename: string, frontmatter: string, body = '本文です。'): void {
  writeFileSync(join(directory, filename), `---\n${frontmatter}\n---\n\n${body}\n`, 'utf8')
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('blog feed metadata', () => {
  it('parses a valid post into the exact public feed shape', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-first-reading.md', 'title: 最初の読みもの\ndescription: 相撲の背景を紹介します。\npublishedAt: 2026-09-01\ndraft: false')

    expect(buildBlogFeed(directory, { todayJst: '2026-09-01' })).toEqual({
      updatedAt: '2026-09-01',
      items: [{ slug: 'first-reading', title: '最初の読みもの', description: '相撲の背景を紹介します。', url: 'https://blog.osada.us/posts/first-reading/', publishedAt: '2026-09-01', author: 'dai' }],
    })
  })

  it.each([
    ['missing title', 'description: 説明\npublishedAt: 2026-09-01\ndraft: false', /frontmatter/i],
    ['unknown key', 'title: 題名\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false\nextra: no', /frontmatter/i],
    ['wrong title type', 'title: 42\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false', /frontmatter/i],
    ['blank title', 'title: ""\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false', /frontmatter/i],
    ['blank description', 'title: 題名\ndescription: ""\npublishedAt: 2026-09-01\ndraft: false', /frontmatter/i],
    ['wrong description type', 'title: 題名\ndescription: 42\npublishedAt: 2026-09-01\ndraft: false', /frontmatter/i],
    ['wrong draft type', 'title: 題名\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: yes', /frontmatter/i],
    ['wrong publishedAt type', 'title: 題名\ndescription: 説明\npublishedAt: 42\ndraft: false', /date/i],
  ])('rejects %s frontmatter', (_name, frontmatter, expectedError) => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-invalid.md', frontmatter)
    expect(() => loadBlogPosts(directory, { todayJst: '2026-09-01' })).toThrow(expectedError)
  })

  it('rejects invalid dates and filename/publishedAt mismatches', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-invalid-date.md', 'title: 題名\ndescription: 説明\npublishedAt: 2026-02-30\ndraft: false')
    expect(() => loadBlogPosts(directory, { todayJst: '2026-09-01' })).toThrow(/date/i)

    const mismatch = postsDirectory()
    writePost(mismatch, '2026-09-01-mismatch.md', 'title: 題名\ndescription: 説明\npublishedAt: 2026-09-02\ndraft: false')
    expect(() => loadBlogPosts(mismatch, { todayJst: '2026-09-02' })).toThrow(/match/i)
  })

  it('rejects duplicate and invalid slugs', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-same-slug.md', 'title: 一\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')
    writePost(directory, '2026-09-02-same-slug.md', 'title: 二\ndescription: 説明\npublishedAt: 2026-09-02\ndraft: false')
    expect(() => loadBlogPosts(directory, { todayJst: '2026-09-02' })).toThrow(/duplicate/i)

    const invalid = postsDirectory()
    writePost(invalid, '2026-09-01-Bad_Slug.md', 'title: 題名\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')
    expect(() => loadBlogPosts(invalid, { todayJst: '2026-09-01' })).toThrow(/slug/i)
  })

  it('rejects a post after the injected JST today boundary', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-02-future.md', 'title: 未来\ndescription: 説明\npublishedAt: 2026-09-02\ndraft: false')
    expect(() => loadBlogPosts(directory, { todayJst: '2026-09-01' })).toThrow(/future/i)
  })

  it('excludes drafts and sorts public posts by date then slug', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-zeta.md', 'title: Z\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')
    writePost(directory, '2026-09-01-alpha.md', 'title: A\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: false')
    writePost(directory, '2026-09-02-hidden.md', 'title: 下書き\ndescription: 説明\npublishedAt: 2026-09-02\ndraft: true')
    writePost(directory, '2026-08-31-old.md', 'title: 古い\ndescription: 説明\npublishedAt: 2026-08-31\ndraft: false')

    expect(buildBlogFeed(directory, { todayJst: '2026-09-02' }).items.map((item) => item.slug)).toEqual(['alpha', 'zeta', 'old'])
  })

  it('returns an empty public feed when every real post is a draft', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-09-01-hidden.md', 'title: 下書き\ndescription: 説明\npublishedAt: 2026-09-01\ndraft: true')

    expect(buildBlogFeed(directory, { todayJst: '2026-09-01' })).toEqual({ updatedAt: '', items: [] })
  })

  it('writes deterministic JSON and derives updatedAt from content, not the clock', () => {
    const directory = postsDirectory()
    writePost(directory, '2026-08-31-only.md', 'title: 旧記事\ndescription: 説明\npublishedAt: 2026-08-31\ndraft: false')
    const output = join(directory, 'nested', 'blog.json')
    const feed = buildBlogFeed(directory, { todayJst: '2026-09-01' })
    writeBlogFeedJson(feed, output)

    expect(readFileSync(output, 'utf8')).toBe(`${JSON.stringify(feed, null, 2)}\n`)
    expect(feed.updatedAt).toBe('2026-08-31')
  })
})
