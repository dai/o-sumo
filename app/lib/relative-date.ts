import type { TFunction } from 'i18next';

/**
 * Returns the current date formatted as YYYY-MM-DD in Japan Standard Time (JST, Asia/Tokyo).
 */
export function getJstIsoDate(now: Date = new Date()): string {
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
 * Computes calendar day difference (targetDate - currentDate) in JST.
 * E.g., if now is 2026-09-11 (JST) and target is 2026-09-13: returns +2 (day after tomorrow).
 * If now is 2026-09-12 (JST) and target is 2026-09-13: returns +1 (tomorrow).
 * If now is 2026-09-13 (JST) and target is 2026-09-13: returns 0 (today).
 */
export function getCalendarDayDiffJst(targetIsoDate: string, now: Date = new Date()): number {
  const currentIso = getJstIsoDate(now);
  const [cy, cm, cd] = currentIso.split('-').map(Number);
  const [ty, tm, td] = targetIsoDate.split('-').map(Number);
  const currentUtc = Date.UTC(cy, cm - 1, cd);
  const targetUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((targetUtc - currentUtc) / 86_400_000);
}

/**
 * Returns relative day label like "今日", "明日", "明後日".
 */
export function getRelativeDateLabel(dayDiff: number, isEn = false): string {
  if (dayDiff === 0) return isEn ? 'Today' : '今日';
  if (dayDiff === 1) return isEn ? 'Tomorrow' : '明日';
  if (dayDiff === 2) return isEn ? 'Day after tomorrow' : '明後日';
  if (dayDiff === -1) return isEn ? 'Yesterday' : '昨日';
  return '';
}

/**
 * Returns section title for highlights based on relative day distance.
 */
export function getRelativeHighlightsTitle(
  dayDiff: number | null,
  isFinal: boolean,
  t: TFunction,
): string {
  if (isFinal) {
    return t('highlights.finalTitle');
  }
  if (dayDiff === 2) {
    return t('highlights.sectionTitleDayAfterTomorrow');
  }
  if (dayDiff === 1) {
    return t('highlights.sectionTitleTomorrow');
  }
  return t('highlights.sectionTitle');
}

/**
 * Returns musubi title based on relative day distance.
 */
export function getRelativeMusubiTitle(dayDiff: number | null, isEn = false): string {
  if (dayDiff === 2) {
    return isEn ? "Day After Tomorrow's Final Bout" : '明後日の結びの一番';
  }
  if (dayDiff === 1) {
    return isEn ? "Tomorrow's Final Bout" : '明日の結びの一番';
  }
  if (dayDiff === 0) {
    return isEn ? "Today's Final Bout" : '本日の結びの一番';
  }
  return isEn ? 'Final Bout of the Day' : '結びの一番';
}

/**
 * Returns monomosu commentary text based on relative day distance.
 */
export function getRelativeMonomosuText(
  dayDiff: number | null,
  isFinal: boolean,
  t: TFunction,
): string {
  if (isFinal) {
    return t('highlights.monomosuFinalText');
  }
  if (dayDiff === 2) {
    return t('highlights.monomosuDayAfterTomorrowText');
  }
  if (dayDiff === 1) {
    return t('highlights.monomosuTomorrowText');
  }
  return t('highlights.monomosuLiveText');
}
