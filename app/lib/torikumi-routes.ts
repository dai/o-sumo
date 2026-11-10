import { getLoadedArchiveDocument } from './archive-client';
import { ARCHIVE_ROUTE_INDEX } from './archive-route-index.generated';
import type { ArchiveDayIndex, ArchiveRouteIndexEntry } from './archive-types';
import {
  CURRENT_BANZUKE_PATH,
  CURRENT_RESULT_PATH,
  CURRENT_SCHEDULE_PATH,
} from './current-basho';
import { updatedAtDateKey } from './updated-at';
import {
  banzukePath,
  torikumiArchive,
  torikumiMonthKey,
  type TorikumiArchiveDay,
  type TorikumiDataSet,
  type TorikumiDivisionDay,
} from './torikumi-data';

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

export function stripTrailingSlash(path: string): string {
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

function emptyDivision(day: number, dayHead: string, division: '幕内' | '十両'): TorikumiDivisionDay {
  return {
    day,
    dayName: '',
    dayHead,
    division,
    matches: [],
  };
}

function dayFromIndex(day: ArchiveDayIndex): TorikumiArchiveDay {
  return {
    day: day.day,
    isoDate: day.isoDate,
    pathDate: day.pathDate,
    label: day.label,
    dayHead: day.dayHead,
    status: day.status,
    statusMessage: day.statusMessage,
    data: {
      makuuchi: emptyDivision(day.day, day.dayHead, '幕内'),
      juryo: emptyDivision(day.day, day.dayHead, '十両'),
    },
  };
}

function shellArchive(entry: ArchiveRouteIndexEntry): TorikumiDataSet {
  return {
    bashoName: entry.bashoName,
    year: entry.year,
    updatedAt: entry.updatedAt,
    resultUpdatedAt: entry.resultUpdatedAt,
    scheduleUpdatedAt: entry.scheduleUpdatedAt,
    resultDays: entry.resultDays.map(dayFromIndex),
    scheduleDays: entry.scheduleDays.map(dayFromIndex),
  };
}

function routePaths(monthKey: string): Pick<ArchiveRouteConfig, 'resultPath' | 'schedulePath' | 'banzukePath'> {
  return {
    resultPath: withTrailingSlash(`/${monthKey}-torikumi`),
    schedulePath: withTrailingSlash(`/${monthKey}-yotei`),
    banzukePath: withTrailingSlash(`/${monthKey}-banzuke`),
  };
}

function currentRouteConfig(): ArchiveRouteConfig {
  return {
    monthKey: torikumiMonthKey,
    archive: normalizeArchive(getLoadedArchiveDocument(torikumiMonthKey)?.torikumi ?? torikumiArchive),
    resultPath: withTrailingSlash(CURRENT_RESULT_PATH),
    schedulePath: withTrailingSlash(CURRENT_SCHEDULE_PATH),
    banzukePath: withTrailingSlash(CURRENT_BANZUKE_PATH),
  };
}

function pastRouteConfig(entry: ArchiveRouteIndexEntry): ArchiveRouteConfig {
  const loaded = getLoadedArchiveDocument(entry.monthKey)?.torikumi;
  return {
    monthKey: entry.monthKey,
    archive: normalizeArchive(loaded ?? shellArchive(entry)),
    ...routePaths(entry.monthKey),
  };
}

function getDefaultArchiveRouteConfig(): ArchiveRouteConfig {
  return currentRouteConfig();
}

export function getArchiveRouteConfigByMonthKey(monthKey: string): ArchiveRouteConfig | undefined {
  if (monthKey === torikumiMonthKey) return currentRouteConfig();
  const entry = ARCHIVE_ROUTE_INDEX.find((item) => item.monthKey === monthKey);
  if (!entry) return undefined;
  return pastRouteConfig(entry);
}

export function getAllArchiveRouteConfigs(): ArchiveRouteConfig[] {
  return [currentRouteConfig(), ...ARCHIVE_ROUTE_INDEX.map(pastRouteConfig)]
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey));
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
    ? '場所期間中はJST 14:00, 14:30, 15:00, 15:30, 16:00, 16:30に更新し、17:00-18:00は10分ごとに更新'
    : '取組予定はJST 15:30と20:00に更新';
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
