import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getAllArchiveRouteConfigs, getDayPath, type ArchiveRouteConfig } from './torikumi-routes';
import { rikishiProfilePath } from './rikishi-profile';
import { isOfficialRankCode, officialProfilePath, type OfficialKind } from './official-profile';
import { normalizeCanonicalPath, toCanonicalUrl } from './site-url';

export interface SitemapEntry {
  loc: string;
}

export interface RikishiSitemapItem {
  id: number;
}

export interface OfficialSitemapItem {
  id: number;
}

const FIXED_SITEMAP_PATHS = ['/', '/archives/', '/rikishi/', '/gyoji/', '/yobidashi/', '/kimarite/', '/analytics/', '/about/'] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function validateSitemapIdItems(label: string, items: unknown): Array<{ id: number }> {
  if (!Array.isArray(items)) {
    throw new Error(`${label} sitemap items must be an array`);
  }

  const seenIds = new Set<number>();
  return items.map((item, index) => {
    const id = typeof item === 'object' && item !== null
      ? (item as { id?: unknown }).id
      : undefined;

    if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
      throw new Error(`${label} sitemap item at index ${index} must have a positive safe integer id`);
    }
    if (seenIds.has(id)) {
      throw new Error(`${label} sitemap contains duplicate id: ${id}`);
    }

    seenIds.add(id);
    return { id };
  });
}

export function validateRikishiSitemapItems(rikishiItems: unknown): RikishiSitemapItem[] {
  return validateSitemapIdItems('Rikishi', rikishiItems);
}

export function validateOfficialSitemapItems(kind: OfficialKind, items: unknown): OfficialSitemapItem[] {
  return validateSitemapIdItems(kind, items);
}

export function loadOfficialSitemapItems(kind: OfficialKind, indexPath: string): OfficialSitemapItem[] {
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { officials?: unknown };
  const items = validateOfficialSitemapItems(kind, index.officials);
  const indexRecords = index.officials as Array<{ rankCode?: unknown }>;
  const profileDirectory = join(dirname(indexPath), kind);

  for (const [itemIndex, item] of items.entries()) {
    if (!isOfficialRankCode(indexRecords[itemIndex].rankCode)) {
      throw new Error(`${kind} index item at index ${itemIndex} has invalid rankCode`);
    }
    const profilePath = join(profileDirectory, `${item.id}.json`);
    if (!existsSync(profilePath)) {
      throw new Error(`Missing ${kind} profile JSON for id ${item.id}`);
    }
    const profile = JSON.parse(readFileSync(profilePath, 'utf8')) as { id?: unknown; kind?: unknown; rankCode?: unknown };
    if (profile.id !== item.id) {
      throw new Error(`${kind} profile JSON id mismatch for ${item.id}`);
    }
    if (profile.kind !== kind) {
      throw new Error(`${kind} profile JSON kind mismatch for id ${item.id}`);
    }
    if (!isOfficialRankCode(profile.rankCode)) {
      throw new Error(`${kind} profile ${item.id} has invalid rankCode`);
    }
  }

  return items;
}

export function getSitemapEntries(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
  rikishiItems: unknown = [],
  gyojiItems: unknown = [],
  yobidashiItems: unknown = [],
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

  const appendOfficials = (kind: OfficialKind, items: unknown) => {
    for (const { id } of validateOfficialSitemapItems(kind, items)) {
      appendEntry(officialProfilePath(kind, id));
    }
  };
  appendOfficials('gyoji', gyojiItems);
  appendOfficials('yobidashi', yobidashiItems);

  return entries;
}

export function renderSitemapXml(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
  rikishiItems: unknown = [],
  gyojiItems: unknown = [],
  yobidashiItems: unknown = [],
): string {
  const urls = getSitemapEntries(routeConfigs, rikishiItems, gyojiItems, yobidashiItems)
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
