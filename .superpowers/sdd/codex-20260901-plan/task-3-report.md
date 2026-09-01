# Task 3: Standalone static blog build report

## Scope

Implemented only the standalone static blog build on `blog-section`. The main React UI and existing main-site public SEO/routing files were not changed. No Pages redirect was added.

## TDD evidence

### RED

Before production builder code, added `app/lib/blog-build.test.ts`. It creates real `mkdtempSync` directories and specifies the complete isolated output tree, draft exclusion, metadata, escaping, RSS ordering/limit, sitemap/robots, 404, and repeat-build determinism.

`npm test -- app/lib/blog-build.test.ts` exited 1 as expected because Vite could not resolve the missing `./blog-build` module. This was the intended missing-feature failure.

A later focused metadata RED asserted the index title. It failed with the observed duplicate `<title>o-sumo 読みもの | o-sumo 読みもの</title>`, then the minimal title rule made the standalone index title exact.

### GREEN

Added the minimal `buildBlogSite` implementation, its `scripts/build_blog.ts` entry point, and both package scripts. The first GREEN execution exposed a real build-runtime defect in the existing feed loader: `gray-matter` did not expose `parsed.matter`, so `rawMatter.split` failed. A direct `tsx` diagnostic showed the parsed object only had `content`, `data`, `isEmpty`, and `excerpt`; the correction validates `publishedAt` from the original source string instead.

`npm test -- app/lib/blog-build.test.ts app/lib/blog-feed.test.ts` passed: 2 files, 23 tests.

## Delivered behavior

- `npm run blog:generate` and `npm run blog:build` both invoke `scripts/build_blog.ts`.
- The builder cleans only its configured output directory, writes the standalone outputs, copies the existing `public/og-default.jpg`, and writes tracked `public/api/v1/blog.json` deterministically.
- HTML templates escape frontmatter, RSS/sitemap XML escape values, Markdown is supplied by the existing `html: false` parser, and unsafe JavaScript links are not rendered by Markdown-it.
- The CSS is standalone Digital Washi reading UI: Shippori Mincho and Source Serif 4 stacks, ink/vermilion/gold palette, square corners, focus treatment, readable 72ch maximum measure, and automatic dark mode.
- CI now regenerates the blog via `npm run blog:generate` and fails on `public/api/v1/blog.json` drift. `dist-blog/` is ignored.

## Generated output tree

```text
dist-blog/
  404.html
  assets/blog.css
  feed.xml
  index.html
  og-default.jpg
  posts/osumo-yomimono-start/index.html
  robots.txt
  sitemap.xml
```

## Verification

- `npm run blog:generate` — exit 0
- `git diff --exit-code -- public/api/v1/blog.json` — exit 0
- `npm run blog:build` — exit 0
- `npm run typecheck` — exit 0
- `npm test` — exit 0 (the repository's pre-existing React `act(...)` warnings remain on stderr)
- `git diff --check` — exit 0

## Review and concerns

The build generates no app JavaScript and does not write the sibling main `dist` output. The generated feed JSON was already current, so no content-only JSON diff was introduced. The report does not claim a Pages deployment or browser deployment verification; those are outside Task 3's local build scope.

## Fix Round 1: review findings

### RED

Command: `npm test -- app/lib/blog-build.test.ts`

Result: exit 1; 10 tests, 2 failed as expected.

- `loads the established bilingual font stack in generated CSS` failed because the generated CSS had neither the established Google Fonts import nor the complete Source Serif 4-first stack for headings.
- `uses Dublin Core creator metadata instead of invalid RSS author text` failed because the generated feed used `<rss version="2.0">` and `<author>dai</author>` rather than a Dublin Core creator declaration.

### GREEN

Applied only the requested corrections: the generated CSS now imports the same Shippori Mincho and Source Serif 4 URL as `app/globals.css`, and body plus headings use the Source Serif 4-first stack with the established Japanese fallbacks. RSS now declares `xmlns:dc="http://purl.org/dc/elements/1.1/"` and emits `<dc:creator>dai</dc:creator>`.

- `npm test -- app/lib/blog-build.test.ts` — exit 0, 10 tests passed.
- `npm run blog:build` — exit 0.
- `npm run typecheck` — exit 0.
- `git diff --check` — exit 0.
