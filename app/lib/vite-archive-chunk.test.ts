import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAST_ARCHIVE_MONTH_KEYS } from './archive-months';
import { ARCHIVE_ROUTE_INDEX } from './archive-route-index.generated';

describe('archive JSON split', () => {
  it('emits one JSON file per past basho and a small generated route index', () => {
    expect(ARCHIVE_ROUTE_INDEX.map((entry) => entry.monthKey)).toEqual([...PAST_ARCHIVE_MONTH_KEYS]);
    for (const monthKey of PAST_ARCHIVE_MONTH_KEYS) {
      const path = resolve(process.cwd(), 'public/api/v1/archive', `${monthKey}.json`);
      expect(existsSync(path)).toBe(true);
      const document = JSON.parse(readFileSync(path, 'utf8')) as { monthKey: string; torikumi?: { resultDays?: unknown[] } };
      expect(document.monthKey).toBe(monthKey);
      expect((document.torikumi?.resultDays ?? []).length).toBeGreaterThan(0);
    }
    expect(ARCHIVE_ROUTE_INDEX[0]?.resultDays[0]).not.toHaveProperty('data');
  });

  it('writes archive JSON during the Vite build and keeps it out of the SW precache glob', () => {
    const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');

    expect(viteConfig).toContain('archiveJsonPlugin');
    expect(viteConfig).toContain('writeArchiveArtifacts');
    expect(viteConfig).toContain("'api/v1/archive/**'");
    expect(viteConfig).not.toContain('archiveChunkGroupTest');
    expect(viteConfig).not.toContain('codeSplitting:');
  });
});
