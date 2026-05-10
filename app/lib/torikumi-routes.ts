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

export function parseTopLevelSlug(slug: string): ParsedTorikumiSlug | null {
  const match = slug.match(/^(\d{6,8})-(torikumi|yotei)$/);
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
    resultPath: MARCH2026_RESULT_PATH,
    schedulePath: MARCH2026_SCHEDULE_PATH,
    bandukePath: MARCH2026_BANDUKE_PATH,
  },
  '202605': {
    monthKey: '202605',
    archive: normalizeArchive(torikumiArchive),
    resultPath: MAY2026_RESULT_PATH,
    schedulePath: MAY2026_SCHEDULE_PATH,
    bandukePath: MAY2026_BANDUKE_PATH,
  },
};

if (!ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey]) {
  ARCHIVE_ROUTE_CONFIGS[torikumiMonthKey] = {
    monthKey: torikumiMonthKey,
    archive: normalizeArchive(torikumiArchive),
    resultPath: `/${torikumiMonthKey}-torikumi`,
    schedulePath: `/${torikumiMonthKey}-yotei`,
    bandukePath: `/${torikumiMonthKey}-banduke`,
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
  const match = pathname.match(/^\/(\d{6})(?:\d{2})?-(?:banduke|torikumi|yotei|o-sumo)(?:\/)?$/);
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
  return mode === 'result' ? config.resultPath : config.schedulePath;
}

export function getHubPathForMonthKey(monthKey: string, mode: TorikumiPageMode): string {
  const config = getArchiveRouteConfigByMonthKey(monthKey) ?? getDefaultArchiveRouteConfig();
  return mode === 'result' ? config.resultPath : config.schedulePath;
}

export function getHubPathForDateKey(dateKey: string, mode: TorikumiPageMode): string {
  const config = getArchiveRouteConfigForDateKey(dateKey) ?? getDefaultArchiveRouteConfig();
  return mode === 'result' ? config.resultPath : config.schedulePath;
}

export function getDayPath(day: TorikumiArchiveDay, mode: TorikumiPageMode): string {
  return `/${day.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}`;
}

export function getArchiveUpdatedAt(mode: TorikumiPageMode): string {
  const archive = getDefaultArchiveRouteConfig().archive;
  return mode === 'result' ? archive.resultUpdatedAt : archive.scheduleUpdatedAt;
}

export function getArchiveUpdateMessage(mode: TorikumiPageMode): string {
  return mode === 'result'
    ? '場所期間中は毎日JST 14, 15, 16, 17, 17:30, 18:00時に更新'
    : '前日のJST 19:00 頃更新';
}

export const legacyBanzukePath = `/${torikumiMonthKey}-o-sumo`;

export function getBanzukePathForMonthKey(monthKey: string): string {
  return (getArchiveRouteConfigByMonthKey(monthKey) ?? getDefaultArchiveRouteConfig()).bandukePath;
}

export function getBanzukePathForDateKey(dateKey: string): string {
  const config = getArchiveRouteConfigForDateKey(dateKey) ?? getDefaultArchiveRouteConfig();
  return config.bandukePath;
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
