import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const INITIAL_JS_GZIP_LIMIT = 250 * 1024;

describe('initial JS budget after archive split (post-build only)', () => {
  it('keeps index + vendor under 250KB gzip and out of the SW precache', () => {
    const dist = join(process.cwd(), 'dist');
    const assets = join(dist, 'assets');
    if (!existsSync(assets)) return;

    const html = readFileSync(join(dist, 'index.html'), 'utf8');
    const scriptHrefs = [...new Set([
      ...[...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/href="(\/assets\/[^"]+\.js)"/g)].map((match) => match[1]),
    ])];
    expect(scriptHrefs.length).toBeGreaterThan(0);

    const gzipTotal = scriptHrefs.reduce((sum, href) => {
      const bytes = readFileSync(join(dist, href.replace(/^\//, '')));
      return sum + gzipSync(bytes).length;
    }, 0);
    expect(gzipTotal).toBeLessThan(INITIAL_JS_GZIP_LIMIT);

    const swPath = join(dist, 'sw.js');
    if (!existsSync(swPath)) return;
    const sw = readFileSync(swPath, 'utf8');
    expect(sw).not.toContain('api/v1/archive/');
    expect(sw).not.toContain('historical-archive-data');
    expect(sw).not.toContain('july2026-archive-data');
  });
});
