import type { TorikumiDataSet } from './torikumi-data';

export type BashoStatusKind = 'upcoming' | 'live' | 'final';

export type BashoStatus = {
  kind: BashoStatusKind;
  startDate: string | null;
  endDate: string | null;
  day: number | null;
};

function jstIsoDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

/**
 * Resolves the basho state from the published schedule rather than from a
 * page-specific copy. All pages should use this single result for labels and
 * calls to action so a finished basho is never described as live elsewhere.
 */
export function getBashoStatus(archive: TorikumiDataSet, now: Date = new Date()): BashoStatus {
  const days = [...(archive.scheduleDays ?? [])]
    .filter((day) => Boolean(day.isoDate))
    .sort((left, right) => left.isoDate.localeCompare(right.isoDate));

  if (days.length === 0) {
    return { kind: 'final', startDate: null, endDate: null, day: null };
  }

  const today = jstIsoDate(now);
  const startDate = days[0].isoDate;
  const endDate = days[days.length - 1].isoDate;
  const activeDay = days.find((day) => day.isoDate === today);

  if (today < startDate) {
    return { kind: 'upcoming', startDate, endDate, day: null };
  }

  if (today > endDate) {
    return { kind: 'final', startDate, endDate, day: null };
  }

  return { kind: 'live', startDate, endDate, day: activeDay?.day ?? null };
}

export function isFinalBasho(archive: TorikumiDataSet, now: Date = new Date()): boolean {
  return getBashoStatus(archive, now).kind === 'final';
}
