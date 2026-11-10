import { formatBashoTitle } from './basho-meta';
import { getBashoStatus } from './basho-status';
import { isMatchCompleted } from './live-progress';
import type { TorikumiArchiveDay, TorikumiDataSet, TorikumiMatch } from './torikumi-data';

export type GlobalNoticeArchive = Pick<
  TorikumiDataSet,
  'bashoName' | 'year' | 'updatedAt' | 'resultUpdatedAt' | 'scheduleUpdatedAt' | 'resultDays' | 'scheduleDays'
>;

export type GlobalNotice = {
  href: string;
  day: number;
  dayLabel: string;
  partial: boolean;
  bashoLabel: string;
};

function allMatches(day: TorikumiArchiveDay): TorikumiMatch[] {
  return [...day.data.makuuchi.matches, ...day.data.juryo.matches];
}

/**
 * The banner follows the latest day that actually has bout results.
 * A day still in progress is marked partial. Days with no settled bouts,
 * and a basho that has not started, produce no notice.
 */
export function resolveGlobalNotice(
  archive: GlobalNoticeArchive,
  now: Date = new Date(),
  language = 'ja',
): GlobalNotice | null {
  const status = getBashoStatus(archive, now);
  if (status.kind === 'upcoming') return null;

  const days = [...(archive.resultDays ?? [])].sort((left, right) => left.day - right.day);
  let chosen: { day: TorikumiArchiveDay; partial: boolean } | null = null;

  for (const day of days) {
    if (status.kind === 'live' && status.day !== null && day.day > status.day) continue;
    const matches = allMatches(day);
    if (matches.length === 0) continue;
    const settled = matches.filter((match) => isMatchCompleted(match)).length;
    if (settled === 0) continue;
    chosen = { day, partial: settled < matches.length };
  }

  if (!chosen) return null;

  const isEnglish = language.startsWith('en');
  const dayLabel = isEnglish ? englishDayLabel(chosen.day.day) : chosen.day.label;
  return {
    href: `/${chosen.day.pathDate}-torikumi/`,
    day: chosen.day.day,
    dayLabel,
    partial: chosen.partial,
    bashoLabel: formatBashoTitle({
      year: archive.year,
      bashoName: archive.bashoName,
      monthKey: chosen.day.pathDate.slice(0, 6),
    }, isEnglish ? 'en' : 'ja'),
  };
}

export function englishDayLabel(day: number): string {
  if (day === 1) return 'Day 1';
  if (day === 15) return 'Senshuraku (Day 15)';
  return `Day ${day}`;
}
