import { resolvePageMeta } from './page-meta';
import { resolveShareMetaOverride, type ShareMetaItem, type ShareMetaOverride } from './share-meta';
import { SITE_ORIGIN } from './site-url';

export type ShareCollection = 'rikishi' | 'gyoji' | 'yobidashi';

export function shareCollectionForPath(pathname: string): ShareCollection | null {
  if (pathname === '/compare/' || /^\/rikishi\/[1-9]\d*\/$/.test(pathname)) return 'rikishi';
  if (/^\/gyoji\/[1-9]\d*\/$/.test(pathname)) return 'gyoji';
  if (/^\/yobidashi\/[1-9]\d*\/$/.test(pathname)) return 'yobidashi';
  return null;
}

function shareItems(payload: unknown, collection: ShareCollection): ShareMetaItem[] {
  if (!payload || typeof payload !== 'object') return [];
  const field = collection === 'rikishi' ? 'rikishi' : 'officials';
  const candidate = (payload as Record<string, unknown>)[field];
  if (!Array.isArray(candidate)) return [];
  return candidate.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { id, name } = item as { id?: unknown; name?: unknown };
    return typeof id === 'number' && Number.isInteger(id) && typeof name === 'string'
      ? [{ id, name }]
      : [];
  });
}

function productionShareUrl(requestUrl: URL): URL {
  return new URL(`${requestUrl.pathname}${requestUrl.search}`, SITE_ORIGIN);
}

export function resolveShareMetadataForPayload(
  requestUrl: URL,
  collection: ShareCollection,
  payload: unknown,
): ShareMetaOverride {
  const metadataUrl = productionShareUrl(requestUrl);
  const items = shareItems(payload, collection);
  const resolved = resolveShareMetaOverride(metadataUrl, {
    rikishi: collection === 'rikishi' ? items : [],
    gyoji: collection === 'gyoji' ? items : [],
    yobidashi: collection === 'yobidashi' ? items : [],
  });
  if (resolved) return resolved;

  const fallback = resolvePageMeta(requestUrl.pathname);
  return {
    title: fallback.title,
    description: fallback.description,
    socialUrl: metadataUrl.toString(),
  };
}

function mergeVary(headers: Headers, value: string): void {
  const values = (headers.get('Vary') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!values.some((entry) => entry.toLowerCase() === value.toLowerCase())) values.push(value);
  headers.set('Vary', values.join(', '));
}

export function prepareShareMetadataHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.set('Cache-Control', 'public, max-age=60, must-revalidate');
  mergeVary(headers, 'Accept');
  headers.delete('ETag');
  headers.delete('Last-Modified');
  headers.delete('Content-Encoding');
  headers.delete('Content-Range');
  return headers;
}
