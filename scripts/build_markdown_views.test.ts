import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildMarkdownPages,
  MARKDOWN_ROUTES,
  markdownRouteAlternateUrl,
  markdownRoutePublicPath,
} from './build_markdown_views';

describe('buildMarkdownPages', () => {
  const publicDir = resolve(process.cwd(), 'public');

  it('emits an entry for every fixed route plus the supported basho set', () => {
    const pages = buildMarkdownPages(publicDir, resolve(process.cwd(), 'dist'));

    const dirs = pages.map((page) => page.outDir);
    expect(dirs).toContain('');
    expect(dirs).toContain('archives/');
    expect(dirs).toContain('rikishi/');
    expect(dirs).toContain('kimarite/');
    expect(dirs).toContain('analytics/');
    expect(dirs).toContain('about/');
    for (const monthKey of ['202603', '202605', '202607']) {
      expect(dirs).toContain(`${monthKey}-banzuke/`);
      expect(dirs).toContain(`${monthKey}-torikumi/`);
      expect(dirs).toContain(`${monthKey}-yotei/`);
    }
  });

  it('prefixes every document with a YAML front matter block and canonical URL', () => {
    const pages = buildMarkdownPages(publicDir, resolve(process.cwd(), 'dist'));

    for (const page of pages) {
      expect(page.content.startsWith('---\n')).toBe(true);
      expect(page.content).toMatch(/^---[\s\S]*?^---\n/m);
      expect(page.content).toMatch(/canonical: "https:\/\/osada\.us/);
      expect(page.content).toMatch(/site: "https:\/\/osada\.us/);
    }
  });

  it('lists rikishi grouped by rank with a proper Markdown table', () => {
    const pages = buildMarkdownPages(publicDir, resolve(process.cwd(), 'dist'));
    const rikishi = pages.find((page) => page.outDir === 'rikishi/');
    expect(rikishi).toBeDefined();
    expect(rikishi!.content).toMatch(/^## 横綱$/m);
    expect(rikishi!.content).toMatch(/^\| 四股名 \| 読み \| ID \| 公式プロフィール \|$/m);
  });

  it('renders kimarite grouped by category with Japanese descriptions', () => {
    const pages = buildMarkdownPages(publicDir, resolve(process.cwd(), 'dist'));
    const kimarite = pages.find((page) => page.outDir === 'kimarite/');
    expect(kimarite).toBeDefined();
    expect(kimarite!.content).toMatch(/^## 基本$/m);
    expect(kimarite!.content).toMatch(/\*\*寄り切り\*\*/);
  });

  it('includes per-day torikumi links for the current basho', () => {
    const pages = buildMarkdownPages(publicDir, resolve(process.cwd(), 'dist'));
    const resultHub = pages.find((page) => page.outDir === '202607-torikumi/');
    expect(resultHub).toBeDefined();
    expect(resultHub!.content).toMatch(/- \[.*202607\d{2}-torikumi/);
  });
});

describe('Markdown for Agents advertising', () => {
  const SITE = 'https://osada.us';

  it('exposes a stable MARKDOWN_ROUTES list', () => {
    expect(MARKDOWN_ROUTES).toContain('');
    expect(MARKDOWN_ROUTES).toContain('archives/');
    expect(MARKDOWN_ROUTES).toContain('rikishi/');
    expect(MARKDOWN_ROUTES).toContain('kimarite/');
    expect(MARKDOWN_ROUTES).toContain('analytics/');
    for (const monthKey of ['202603', '202605', '202607']) {
      expect(MARKDOWN_ROUTES).toContain(`${monthKey}-banzuke/`);
      expect(MARKDOWN_ROUTES).toContain(`${monthKey}-torikumi/`);
      expect(MARKDOWN_ROUTES).toContain(`${monthKey}-yotei/`);
    }
  });

  it('derives the public URL from the outDir', () => {
    expect(markdownRoutePublicPath('')).toBe('/');
    expect(markdownRoutePublicPath('archives/')).toBe('/archives/');
    expect(markdownRoutePublicPath('202607-banzuke/')).toBe('/202607-banzuke/');
  });

  it('derives the alternate Markdown URL from the outDir', () => {
    expect(markdownRouteAlternateUrl('', SITE)).toBe('https://osada.us/index.md');
    expect(markdownRouteAlternateUrl('archives/', SITE)).toBe('https://osada.us/archives/index.md');
  });

  it('publishes a Link: rel="alternate" type="text/markdown" header for every Markdown route', () => {
    const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
    for (const outDir of MARKDOWN_ROUTES) {
      const href = markdownRoutePublicPath(outDir);
      const linkLine = `Link: <${href}index.md>; rel="alternate"; type="text/markdown"`;
      expect(headers, `outDir=${outDir} should be advertised in _headers`).toContain(linkLine);
    }
  });
});