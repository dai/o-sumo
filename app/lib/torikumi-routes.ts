import { banzukePath, torikumiArchive, torikumiMonthKey, MARCH2026_TORIKUMI_DATA, type TorikumiArchiveDay } from './torikumi-data';

export type TorikumiPageMode = 'result' | 'schedule';

export interface ParsedTorikumiSlug {
  dateKey: string;
  mode: TorikumiPageMode;
}

export function parseTopLevelSlug(slug: string): ParsedTorikumiSlug | null {
  // Match both 8-digit day pages (20260314-torikumi) and 6-digit hub pages (202603-torikumi)
  const match = slug.match(/^(\d{6,8})-(torikumi|yotei)$/);
  if (!match) {
    return null;
  }

  return {
    dateKey: match[1],
    mode: match[2] === 'torikumi' ? 'result' : 'schedule',
  };
}

// May 2026 paths
export const MAY2026_RESULT_PATH = '/202605-torikumi';
export const MAY2026_SCHEDULE_PATH = '/202605-yotei';
export const MAY2026_BANDUKE_PATH = '/202605-banduke';

// March 2026 paths
export const MARCH2026_RESULT_PATH = '/202603-torikumi';
export const MARCH2026_SCHEDULE_PATH = '/202603-yotei';
export const MARCH2026_BANDUKE_PATH = '/202603-banduke';

export function findArchiveDay(dateKey: string, mode: TorikumiPageMode): TorikumiArchiveDay | undefined {
  const isMarch2026 = dateKey.startsWith('202603');
  const isMay2026 = dateKey.startsWith('202605');

  if (isMarch2026) {
    if (dateKey.length === 6) {
      // Hub page - return first day for reference
      const days = mode === 'result' ? MARCH2026_TORIKUMI_DATA.resultDays : MARCH2026_TORIKUMI_DATA.scheduleDays;
      return days?.[0];
    }
    // Day page - find specific day
    const days = mode === 'result' ? MARCH2026_TORIKUMI_DATA.resultDays : MARCH2026_TORIKUMI_DATA.scheduleDays;
    return days?.find((day) => day.pathDate === dateKey);
  }

  if (isMay2026) {
    if (dateKey.length === 6) {
      // Hub page
      const days = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;
      return days?.[0];
    }
    // Day page
    const days = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;
    return days.find((day) => day.pathDate === dateKey);
  }

  // Fallback
  return undefined;
}

export function getHubPath(mode: TorikumiPageMode): string {
  return `/${torikumiMonthKey}-${mode === 'result' ? 'torikumi' : 'yotei'}`;
}

export function getDayPath(day: TorikumiArchiveDay, mode: TorikumiPageMode): string {
  return `/${day.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}`;
}

export function getArchiveUpdatedAt(mode: TorikumiPageMode): string {
  return mode === 'result' ? torikumiArchive.resultUpdatedAt : torikumiArchive.scheduleUpdatedAt;
}

export function getArchiveUpdateMessage(mode: TorikumiPageMode): string {
  return mode === 'result'
    ? '15:00-18:00(JST)は30分ごと'
    : '10:00 / 18:00(JST)更新';
}

export const legacyBanzukePath = `/${torikumiMonthKey}-o-sumo`;

export function getAdjacentDay(
  current: TorikumiArchiveDay,
  mode: TorikumiPageMode,
  direction: 'prev' | 'next',
): TorikumiArchiveDay | undefined {
  const days = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;
  const index = days.findIndex((day) => day.pathDate === current.pathDate);
  if (index === -1) {
    return undefined;
  }

  return direction === 'prev' ? days[index - 1] : days[index + 1];
}

export function isElapsedArchiveDay(day: TorikumiArchiveDay, referenceDate: string = torikumiArchive.updatedAt): boolean {
  const referenceKey = referenceDate.replace(/-/g, '');
  if (!/^\d{8}$/.test(referenceKey)) {
    return false;
  }
  return day.pathDate < referenceKey;
}

export { banzukePath };
