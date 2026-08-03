import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { buildMarkdownPages } from './build_markdown_views';

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