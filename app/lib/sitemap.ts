import { getAllArchiveRouteConfigs, getDayPath, type ArchiveRouteConfig } from './torikumi-routes';
import { rikishiProfilePath } from './rikishi-profile';
import { normalizeCanonicalPath, toCanonicalUrl } from './site-url';

export interface SitemapEntry {
  loc: string;
}

export interface RikishiSitemapItem {
  id: number;
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

export function validateRikishiSitemapItems(rikishiItems: unknown): RikishiSitemapItem[] {
  if (!Array.isArray(rikishiItems)) {
    throw new Error('Rikishi sitemap items must be an array');
  }

  const seenIds = new Set<number>();

  return rikishiItems.map((item, index) => {
    const id = typeof item === 'object' && item !== null
      ? (item as { id?: unknown }).id
      : undefined;

    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new Error(`Rikishi sitemap item at index ${index} must have a positive integer id`);
    }
    if (seenIds.has(id)) {
      throw new Error(`Rikishi sitemap contains duplicate id: ${id}`);
    }

    seenIds.add(id);
    return { id };
  });
}

export function getSitemapEntries(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
  rikishiItems: unknown = [],
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

  for (const rikishi of validateRikishiSitemapItems(rikishiItems)) {
    appendEntry(rikishiProfilePath(rikishi.id));
  }

  return entries;
}

export function renderSitemapXml(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
  rikishiItems: unknown = [],
): string {
  const urls = getSitemapEntries(routeConfigs, rikishiItems)
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
