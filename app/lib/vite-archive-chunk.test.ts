import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JULY2026_ARCHIVE_CHUNK, archiveChunkGroupTest, archiveDataManualChunks } from './vite-archive-chunk';

describe('Vite archive chunking', () => {
  it('places the immutable July snapshots in their own chunk across path separators', () => {
    expect(archiveDataManualChunks('/workspace/app/lib/july2026-data.ts')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('/workspace/app/lib/july2026-data.js')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('/workspace/app/lib/july2026-data.js?v=1')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('C:\\workspace\\app\\lib\\july2026-banzuke-data.ts')).toBe(JULY2026_ARCHIVE_CHUNK);
    expect(archiveDataManualChunks('/workspace/app/lib/torikumi-data.ts')).toBeUndefined();
  });

  it('connects the archive chunk function to the Rolldown build configuration', () => {
    const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');

    expect(viteConfig).toContain('archiveChunkGroupTest');
    expect(viteConfig).toContain('codeSplitting:');
    expect(viteConfig).toContain('test: archiveChunkGroupTest(JULY2026_ARCHIVE_CHUNK)');
    expect(viteConfig).toContain('test: archiveChunkGroupTest(HISTORICAL_ARCHIVE_CHUNK)');
  });

  it('keeps each archive group limited to the modules the chunk function names', () => {
    const july = archiveChunkGroupTest(JULY2026_ARCHIVE_CHUNK);
    expect(july('/workspace/app/lib/july2026-data.ts')).toBe(true);
    expect(july('/workspace/app/lib/may2026-data.ts')).toBe(false);
  });
});
