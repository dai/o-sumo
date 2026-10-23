export const JULY2026_ARCHIVE_CHUNK = 'july2026-archive-data';
export const HISTORICAL_ARCHIVE_CHUNK = 'historical-archive-data';

/**
 * Keeps large published datasets out of the entry module. The route registry
 * can still synchronously resolve paths, while Rolldown emits each archive as a
 * separately cacheable payload instead of inflating the app shell.
 */
export function archiveDataManualChunks(id: string): string | undefined {
  // Rolldown reports transformed module ids with a `.js` extension.
  const slashNormalized = id.replace(/\\/g, '/');
  const queryIndex = slashNormalized.indexOf('?');
  const withoutQuery = queryIndex === -1 ? slashNormalized : slashNormalized.slice(0, queryIndex);
  const normalizedId = withoutQuery.endsWith('.js')
    ? `${withoutQuery.slice(0, -3)}.ts`
    : withoutQuery;

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

/** Module filter for a Rolldown `codeSplitting` group of one archive chunk. */
export function archiveChunkGroupTest(chunkName: string): (id: string) => boolean {
  return (id: string) => archiveDataManualChunks(id) === chunkName;
}
