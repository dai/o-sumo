import {
  banzukePath,
  torikumiMonthKey,
  type TorikumiArchiveDay,
  type TorikumiDataSet,
} from './torikumi-data';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';
import { JULY2026_TORIKUMI_DATA } from './july2026-data';
import { updatedAtDateKey } from './updated-at';
import { getJstIsoDate } from './relative-date';
import {
  CURRENT_BANZUKE_PATH,
  CURRENT_RESULT_PATH,
  CURRENT_SCHEDULE_PATH,
  getTorikumiArchiveByMonthKey,
} from './archive-basho-data';

export type TorikumiPageMode = 'result' | 'schedule';

export interface ParsedTorikumiSlug {
  dateKey: string;
  mode: TorikumiPageMode;
}

export interface ArchiveRouteConfig {
  monthKey: string;
  archive: TorikumiDataSet;
  resultPath: string;
  schedulePath: string;
  banzukePath: string;
}

export interface ArchiveHubRouteDefinition {
  path: string;
  canonicalPath: string;
  page: 'banzuke' | TorikumiPageMode;
}

function stripTrailingSlash(path: string): string {
  if (path === '/') {
    return path;
  }
  return path.replace(/\/+$/, '');
}

function withTrailingSlash(path: string): string {
  if (path === '/') {
    return path;
  }
  return path.endsWith('/') ? path : `${path}/`;
}

export function parseTopLevelSlug(slug: string): ParsedTorikumiSlug | null {
  const normalized = slug.replace(/\/+$/, '');
  const match = normalized.match(/^(\d{6,8})-(torikumi|yotei)$/);
  if (!match) {
    return null;
  }

  return {
    dateKey: match[1],
    mode: match[2] === 'torikumi' ? 'result' : 'schedule',
  };
}

export const SEPTEMBER2026_RESULT_PATH = '/202609-torikumi';
export const SEPTEMBER2026_SCHEDULE_PATH = '/202609-yotei';
export const SEPTEMBER2026_BANZUKE_PATH = '/202609-banzuke';

export const JULY2026_RESULT_PATH = '/202607-torikumi';
export const JULY2026_SCHEDULE_PATH = '/202607-yotei';
export const JULY2026_BANZUKE_PATH = '/202607-banzuke';

export const MAY2026_RESULT_PATH = '/202605-torikumi';
export const MAY2026_SCHEDULE_PATH = '/202605-yotei';
export const MAY2026_BANZUKE_PATH = '/202605-banzuke';

export const MARCH2026_RESULT_PATH = '/202603-torikumi';
export const MARCH2026_SCHEDULE_PATH = '/202603-yotei';
export const MARCH2026_BANZUKE_PATH = '/202603-banzuke';

function normalizeArchive(archive: TorikumiDataSet): TorikumiDataSet {
  return {
    ...archive,
    resultDays: archive.resultDays ?? [],
    scheduleDays: archive.scheduleDays ?? [],
  };
}

const ARCHIVE_ROUTE_CONFIGS: Record<string, ArchiveRouteConfig> = {
  '202603': {
    monthKey: '202603',
    archive: normalizeArchive(MARCH2026_TORIKUMI_DATA),
    resultPath: withTrailingSlash(MARCH2026_RESULT_PATH),
    schedulePath: withTrailingSlash(MARCH2026_SCHEDULE_PATH),
    banzukePath: withTrailingSlash(MARCH2026_BANZUKE_PATH),
  },
  '202605': {
    monthKey: '202605',
    archive: normalizeArchive(MAY2026_TORIKUMI_DATA),
    resultPath: withTrailingSlash(MAY2026_RESULT_PATH),
    schedulePath: withTrailingSlash(MAY2026_SCHEDULE_PATH),
    banzukePath: withTrailingSlash(MAY2026_BANZUKE_PATH),
  },
  '202607': {
    monthKey: '202607',
    archive: normalizeArchive(JULY2026_TORIKUMI_DATA),
    resultPath: withTrailingSlash(JULY2026_RESULT_PATH),
    schedulePath: withTrailingSlash(JULY2026_SCHEDULE_PATH),
    banzukePath: withTrailingSlash(JULY2026_BANZUKE_PATH),
  },
};

if (!ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey]) {
  ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey] = {
    monthKey: torikumiMonthKey,
    archive: normalizeArchive(getTorikumiArchiveByMonthKey(torikumiMonthKey)),
    resultPath: withTrailingSlash(CURRENT_RESULT_PATH),
    schedulePath: withTrailingSlash(CURRENT_SCHEDULE_PATH),
    banzukePath: withTrailingSlash(CURRENT_BANZUKE_PATH),
  };
}

function getDefaultArchiveRouteConfig(): ArchiveRouteConfig {
  return ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey] ?? ARCHIVE_ROUTE_CONFIGS['202603'];
}

export function getArchiveRouteConfigByMonthKey(monthKey: string): ArchiveRouteConfig | undefined {
  return ARCHIVE_ROUTE_CONFIGS[monthKey];
}

export function getAllArchiveRouteConfigs(): ArchiveRouteConfig[] {
  return Object.values(ARCHIVE_ROUTE_CONFIGS).sort((left, right) => left.monthKey.localeCompare(right.monthKey));
}

export function getArchiveHubRouteDefinitions(
  configs: ArchiveRouteConfig[] = getAllArchiveRouteConfigs(),
): ArchiveHubRouteDefinition[] {
  return configs.flatMap((config) => [
    { path: stripTrailingSlash(config.banzukePath), canonicalPath: withTrailingSlash(config.banzukePath), page: 'banzuke' },
    { path: stripTrailingSlash(config.resultPath), canonicalPath: withTrailingSlash(config.resultPath), page: 'result' },
    { path: stripTrailingSlash(config.schedulePath), canonicalPath: withTrailingSlash(config.schedulePath), page: 'schedule' },
  ]);
}

export function getArchiveRouteConfigForDateKey(dateKey: string): ArchiveRouteConfig | undefined {
  if (!/^\d{6,8}$/.test(dateKey)) {
    return undefined;
  }
  return getArchiveRouteConfigByMonthKey(dateKey.slice(0, 6));
}

export function getArchiveRouteConfigForPathname(pathname: string): ArchiveRouteConfig {
  const normalized = stripTrailingSlash(pathname);
  const match = normalized.match(/^\/(\d{6})(?:\d{2})?-(?:banzuke|torikumi|yotei)$/);
  if (match) {
    const config = getArchiveRouteConfigByMonthKey(match[1]);
    if (config) {
      return config;
    }
  }
  return getDefaultArchiveRouteConfig();
}

export function findArchiveDay(dateKey: string, mode: TorikumiPageMode): TorikumiArchiveDay | undefined {
  const config = getArchiveRouteConfigForDateKey(dateKey);
  if (!config) {
    return undefined;
  }

  const days = mode === 'result' ? config.archive.resultDays ?? [] : config.archive.scheduleDays ?? [];
  if (dateKey.length === 6) {
    return days[0];
  }
  return days.find((day) => day.pathDate === dateKey);
}

export function getHubPath(mode: TorikumiPageMode): string {
  const config = getDefaultArchiveRouteConfig();
  return withTrailingSlash(mode === 'result' ? config.resultPath : config.schedulePath);
}

export function getHubPathForMonthKey(monthKey: string, mode: TorikumiPageMode): string {
  const config = getArchiveRouteConfigByMonthKey(monthKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(mode === 'result' ? config.resultPath : config.schedulePath);
}

export function getHubPathForDateKey(dateKey: string, mode: TorikumiPageMode): string {
  const config = getArchiveRouteConfigForDateKey(dateKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(mode === 'result' ? config.resultPath : config.schedulePath);
}

export function getDayPath(day: TorikumiArchiveDay, mode: TorikumiPageMode): string {
  return withTrailingSlash(`/${day.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}`);
}

export function getArchiveUpdatedAt(mode: TorikumiPageMode): string {
  const archive = getDefaultArchiveRouteConfig().archive;
  return mode === 'result' ? archive.resultUpdatedAt : archive.scheduleUpdatedAt;
}

export function getArchiveUpdateMessage(mode: TorikumiPageMode): string {
  return mode === 'result'
    ? '場所期間中はJST 13:00から18:50まで10分ごとに更新'
    : '取組予定はJST 13:00, 15:00, 17:00, 19:00に更新';
}

/**
 * Returns the JST calendar date for the day after `now`, formatted as YYYY-MM-DD.
 * DST-free via Intl.DateTimeFormat with timeZone: 'Asia/Tokyo'.
 */
export function getJstTomorrowIsoDate(now: Date = new Date()): string {
  const today = getJstIsoDate(now);
  const [yearStr, monthStr, dayStr] = today.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const tomorrowUtc = Date.UTC(year, month - 1, day + 1);
  return getJstIsoDate(new Date(tomorrowUtc));
}

/**
 * Returns true when the current JST hour is at or after 15:00, the day's
 * first torikumi schedule publication point.
 */
export function isAfterFirstUpdateWindow(now: Date = new Date()): boolean {
  const hourPart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).formatToParts(now).find((part) => part.type === 'hour');
  const hour = Number(hourPart?.value ?? '0');
  return hour >= 15;
}

export const legacyBanzukePath = `/${torikumiMonthKey}-o-sumo`;

export function getBanzukePathForMonthKey(monthKey: string): string {
  const config = getArchiveRouteConfigByMonthKey(monthKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(config.banzukePath);
}

export function getBanzukePathForDateKey(dateKey: string): string {
  const config = getArchiveRouteConfigForDateKey(dateKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(config.banzukePath);
}

export function getAdjacentDay(
  current: TorikumiArchiveDay,
  mode: TorikumiPageMode,
  direction: 'prev' | 'next',
): TorikumiArchiveDay | undefined {
  const config = getArchiveRouteConfigForDateKey(current.pathDate) ?? getDefaultArchiveRouteConfig();
  const days = mode === 'result' ? config.archive.resultDays ?? [] : config.archive.scheduleDays ?? [];
  const index = days.findIndex((day) => day.pathDate === current.pathDate);
  if (index === -1) {
    return undefined;
  }

  return direction === 'prev' ? days[index - 1] : days[index + 1];
}

export function isElapsedArchiveDay(day: TorikumiArchiveDay, referenceDate?: string): boolean {
  const archive = getArchiveRouteConfigForDateKey(day.pathDate)?.archive ?? getDefaultArchiveRouteConfig().archive;
  const targetReferenceDate = referenceDate ?? archive.updatedAt;
  const referenceKey = updatedAtDateKey(targetReferenceDate);
  if (!referenceKey) {
    return false;
  }
  return day.pathDate < referenceKey;
}

export { banzukePath };
