import { getAllArchiveRouteConfigs, getDayPath, type ArchiveRouteConfig } from './torikumi-routes';
import { normalizeCanonicalPath, toCanonicalUrl } from './site-url';

export interface SitemapEntry {
  loc: string;
}

const FIXED_SITEMAP_PATHS = ['/', '/archives/', '/rikishi/', '/kimarite/', '/analytics/'] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getSitemapEntries(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  const appendEntry = (path: string) => {
    const normalized = normalizeCanonicalPath(path);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    entries.push({ loc: normalized });
  };

  for (const path of FIXED_SITEMAP_PATHS) {
    appendEntry(path);
  }

  for (const config of routeConfigs) {
    appendEntry(config.banzukePath);
    appendEntry(config.resultPath);
    appendEntry(config.schedulePath);

    for (const day of config.archive.resultDays ?? []) {
      if (day.status === 'published') {
        appendEntry(getDayPath(day, 'result'));
      }
    }

    for (const day of config.archive.scheduleDays ?? []) {
      if (day.status === 'published') {
        appendEntry(getDayPath(day, 'schedule'));
      }
    }
  }

  return entries;
}

export function renderSitemapXml(): string {
  const urls = getSitemapEntries()
    .map((entry) => `  <url>\n    <loc>${escapeXml(toCanonicalUrl(entry.loc))}</loc>\n  </url>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
