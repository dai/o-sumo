import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JULY2026_ARCHIVE_CHUNK, archiveDataManualChunks } from './vite-archive-chunk';

describe('Vite archive chunking', () => {
  it('places the immutable July snapshots in their own chunk across path separators', () => {
    expect(archiveDataManualChunks('/workspace/app/lib/july2026-data.ts')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('C:\\workspace\\app\\lib\\july2026-banzuke-data.ts')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('/workspace/app/lib/torikumi-data.ts')).toBeUndefined();
  });

  it('connects the archive chunk function to the Rollup build configuration', () => {
    const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');

    expect(viteConfig).toContain("import { archiveDataManualChunks } from './app/lib/vite-archive-chunk'");
    expect(viteConfig).toContain('manualChunks: archiveDataManualChunks');
  });
});
