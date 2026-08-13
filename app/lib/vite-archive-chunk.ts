export const JULY2026_ARCHIVE_CHUNK = 'july2026-archive-data';

export function archiveDataManualChunks(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/');

  if (
    normalizedId.endsWith('/app/lib/july2026-data.ts')
    || normalizedId.endsWith('/app/lib/july2026-banzuke-data.ts')
  ) {
    return JULY2026_ARCHIVE_CHUNK;
  }

  return undefined;
}
