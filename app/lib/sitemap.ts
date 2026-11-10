import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getBanzukeDataByMonthKey } from './archive-basho-data';
import { getAllArchiveRouteConfigs, getDayPath, type ArchiveRouteConfig } from './torikumi-routes';
import { rikishiProfilePath } from './rikishi-profile';
import { isOfficialRankCode, officialProfilePath, type OfficialKind } from './official-profile';
import { normalizeCanonicalPath, toCanonicalUrl } from './site-url';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export interface SitemapLastmodContext {
  /** W3C date used for pages that have no content timestamp. */
  buildDate?: string;
  /** Directory that contains `api/v1` profile JSON. Defaults to `public` under cwd. */
  publicDir?: string;
}

export interface RikishiSitemapItem {
  id: number;
}

export interface OfficialSitemapItem {
  id: number;
}

const FIXED_SITEMAP_PATHS = ['/', '/archives/', '/rikishi/', '/gyoji/', '/yobidashi/', '/kimarite/', '/analytics/', '/about/', '/privacy/', '/terms/'] as const;

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

const W3C_DATE = /^\d{4}-\d{2}-\d{2}$/;
const W3C_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function toSitemapLastmod(value: string): string | null {
  if (W3C_DATE.test(value) || W3C_DATETIME.test(value)) return value;
  return null;
}

function sitemapBuildDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function resolveLastmodContext(context: SitemapLastmodContext = {}): { buildDate: string; publicDir: string } {
  const requested = context.buildDate ? toSitemapLastmod(context.buildDate) : null;
  return {
    buildDate: requested ?? sitemapBuildDate(),
    publicDir: context.publicDir ?? join(process.cwd(), 'public'),
  };
}

function readTimestamp(filePath: string, keys: readonly string[]): string | null {
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string') {
        const lastmod = toSitemapLastmod(value);
        if (lastmod) return lastmod;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function banzukeLastmod(config: ArchiveRouteConfig, buildDate: string): string {
  try {
    return toSitemapLastmod(getBanzukeDataByMonthKey(config.monthKey).updatedAt)
      ?? toSitemapLastmod(config.archive.updatedAt)
      ?? buildDate;
  } catch {
    return toSitemapLastmod(config.archive.updatedAt) ?? buildDate;
  }
}

function modeLastmod(config: ArchiveRouteConfig, mode: 'result' | 'schedule', buildDate: string): string {
  const raw = mode === 'result' ? config.archive.resultUpdatedAt : config.archive.scheduleUpdatedAt;
  return toSitemapLastmod(raw) ?? toSitemapLastmod(config.archive.updatedAt) ?? buildDate;
}

function rikishiLastmod(id: number, publicDir: string, buildDate: string): string {
  return readTimestamp(join(publicDir, 'api/v1/rikishi', `${id}.json`), ['updatedAt']) ?? buildDate;
}

function officialLastmod(kind: OfficialKind, id: number, publicDir: string, buildDate: string): string {
  return readTimestamp(join(publicDir, 'api/v1', kind, `${id}.json`), ['retrievedAt', 'updatedAt']) ?? buildDate;
}

export function getSitemapEntries(
  routeConfigs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
  rikishiItems: unknown = [],
  gyojiItems: unknown = [],
  yobidashiItems: unknown = [],
  context?: SitemapLastmodContext,
): SitemapEntry[] {
  const { buildDate, publicDir } = resolveLastmodContext(context);
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  const appendEntry = (path: string, lastmod: string) => {
    const normalized = normalizeCanonicalPath(path);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    entries.push({ loc: normalized, lastmod });
  };

  for (const path of FIXED_SITEMAP_PATHS) {
    appendEntry(path, buildDate);
  }

  for (const config of routeConfigs) {
    appendEntry(config.banzukePath, banzukeLastmod(config, buildDate));
    appendEntry(config.resultPath, modeLastmod(config, 'result', buildDate));
    appendEntry(config.schedulePath, modeLastmod(config, 'schedule', buildDate));

    for (const day of config.archive.resultDays ?? []) {
      if (day.status === 'published') {
        appendEntry(getDayPath(day, 'result'), modeLastmod(config, 'result', buildDate));
      }
    }

    for (const day of config.archive.scheduleDays ?? []) {
      if (day.status === 'published') {
        appendEntry(getDayPath(day, 'schedule'), modeLastmod(config, 'schedule', buildDate));
      }
    }
  }

  for (const rikishi of validateRikishiSitemapItems(rikishiItems)) {
    appendEntry(rikishiProfilePath(rikishi.id), rikishiLastmod(rikishi.id, publicDir, buildDate));
  }

  const appendOfficials = (kind: OfficialKind, items: unknown) => {
    for (const { id } of validateOfficialSitemapItems(kind, items)) {
      appendEntry(officialProfilePath(kind, id), officialLastmod(kind, id, publicDir, buildDate));
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
  context?: SitemapLastmodContext,
): string {
  const urls = getSitemapEntries(routeConfigs, rikishiItems, gyojiItems, yobidashiItems, context)
    .map((entry) => `  <url>\n    <loc>${escapeXml(toCanonicalUrl(entry.loc))}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
