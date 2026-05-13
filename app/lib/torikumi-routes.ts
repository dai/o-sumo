import {
  banzukePath,
  torikumiArchive,
  torikumiMonthKey,
  type TorikumiArchiveDay,
  type TorikumiDataSet,
} from './torikumi-data';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';
import { updatedAtDateKey } from './updated-at';

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
  bandukePath: string;
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

export const MAY2026_RESULT_PATH = '/202605-torikumi';
export const MAY2026_SCHEDULE_PATH = '/202605-yotei';
export const MAY2026_BANDUKE_PATH = '/202605-banduke';

export const MARCH2026_RESULT_PATH = '/202603-torikumi';
export const MARCH2026_SCHEDULE_PATH = '/202603-yotei';
export const MARCH2026_BANDUKE_PATH = '/202603-banduke';

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
    bandukePath: withTrailingSlash(MARCH2026_BANDUKE_PATH),
  },
  '202605': {
    monthKey: '202605',
    archive: normalizeArchive(torikumiArchive),
    resultPath: withTrailingSlash(MAY2026_RESULT_PATH),
    schedulePath: withTrailingSlash(MAY2026_SCHEDULE_PATH),
    bandukePath: withTrailingSlash(MAY2026_BANDUKE_PATH),
  },
};

if (!ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey]) {
  ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey] = {
    monthKey: torikumiMonthKey,
    archive: normalizeArchive(torikumiArchive),
    resultPath: withTrailingSlash(`/${torikumiMonthKey}-torikumi`),
    schedulePath: withTrailingSlash(`/${torikumiMonthKey}-yotei`),
    bandukePath: withTrailingSlash(`/${torikumiMonthKey}-banduke`),
  };
}

function getDefaultArchiveRouteConfig(): ArchiveRouteConfig {
  return ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey] ?? ARCHIVE_ROUTE_CONFIGS['202605'];
}

export function getArchiveRouteConfigByMonthKey(monthKey: string): ArchiveRouteConfig | undefined {
  return ARCHIVE_ROUTE_CONFIGS[monthKey];
}

export function getArchiveRouteConfigForDateKey(dateKey: string): ArchiveRouteConfig | undefined {
  if (!/^\d{6,8}$/.test(dateKey)) {
    return undefined;
  }
  return getArchiveRouteConfigByMonthKey(dateKey.slice(0, 6));
}

export function getArchiveRouteConfigForPathname(pathname: string): ArchiveRouteConfig {
  const normalized = stripTrailingSlash(pathname);
  const match = normalized.match(/^\/(\d{6})(?:\d{2})?-(?:banduke|torikumi|yotei|o-sumo)$/);
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
    ? '場所期間中はJST 14:00, 14:30, 15:00, 15:30, 16:00, 16:30に更新し、17:00-18:00は5分ごとに更新'
    : '取組予定はJST 09:00と18:00に更新';
}

export const legacyBanzukePath = `/${torikumiMonthKey}-o-sumo`;

export function getBanzukePathForMonthKey(monthKey: string): string {
  const config = getArchiveRouteConfigByMonthKey(monthKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(config.bandukePath);
}

export function getBanzukePathForDateKey(dateKey: string): string {
  const config = getArchiveRouteConfigForDateKey(dateKey) ?? getDefaultArchiveRouteConfig();
  return withTrailingSlash(config.bandukePath);
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
