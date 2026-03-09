import { banzukePath, torikumiArchive, torikumiMonthKey, type TorikumiArchiveDay } from './torikumi-data';

export type TorikumiPageMode = 'result' | 'schedule';

export interface ParsedTorikumiSlug {
  dateKey: string;
  mode: TorikumiPageMode;
}

export function parseTopLevelSlug(slug: string): ParsedTorikumiSlug | null {
  const match = slug.match(/^(\d{8})-(torikumi|yotei)$/);
  if (!match) {
    return null;
  }

  return {
    dateKey: match[1],
    mode: match[2] === 'torikumi' ? 'result' : 'schedule',
  };
}

export function findArchiveDay(dateKey: string, mode: TorikumiPageMode): TorikumiArchiveDay | undefined {
  const days = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;
  return days.find((day) => day.pathDate === dateKey);
}

export function getHubPath(mode: TorikumiPageMode): string {
  return `/${torikumiMonthKey}-${mode === 'result' ? 'torikumi' : 'yotei'}`;
}

export function getDayPath(day: TorikumiArchiveDay, mode: TorikumiPageMode): string {
  return `/${day.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}`;
}

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

export { banzukePath };
