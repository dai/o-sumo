export const JULY2026_ARCHIVE_CHUNK = 'july2026-archive-data';
export const HISTORICAL_ARCHIVE_CHUNK = 'historical-archive-data';

/**
 * Keeps large published datasets out of the entry module. The route registry
 * can still synchronously resolve paths, while Rollup emits each archive as a
 * separately cacheable payload instead of inflating the app shell.
 */
export function archiveDataManualChunks(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/');

  if (
    normalizedId.endsWith('/app/lib/july2026-data.ts')
    || normalizedId.endsWith('/app/lib/july2026-banzuke-data.ts')
  ) {
    return JULY2026_ARCHIVE_CHUNK;
  }

  if (
    normalizedId.endsWith('/app/lib/march2026-torikumi-data.ts')
    || normalizedId.endsWith('/app/lib/march2026-banzuke-data.ts')
    || normalizedId.endsWith('/app/lib/may2026-data.ts')
    || normalizedId.endsWith('/app/lib/may2026-banzuke-data.ts')
  ) {
    return HISTORICAL_ARCHIVE_CHUNK;
  }

  return undefined;
}
