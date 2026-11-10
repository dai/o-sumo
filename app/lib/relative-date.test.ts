import { describe, expect, it } from 'vitest';
import {
  getJstIsoDate,
  getCalendarDayDiffJst,
  getRelativeDateLabel,
  getRelativeHighlightsTitle,
  getRelativeMusubiTitle,
  getRelativeMonomosuText,
  formatKanjiNumber,
  formatWarekiBashoName,
  normalizeWarekiBashoTitle,
  formatDisplayDate,
  formatDisplayTimestamp,
  formatDayHead,
  formatInstantDate,
  formatJstClock,
} from './relative-date';

describe('relative-date utilities', () => {
  it('formats current date in JST correctly', () => {
    // 2026-09-11 15:00 JST is 2026-09-11 06:00 UTC
    const dateUtc = new Date('2026-09-11T06:00:00Z');
    expect(getJstIsoDate(dateUtc)).toBe('2026-09-11');

    // 2026-09-11 23:30 UTC is 2026-09-12 08:30 JST
    const dateLateUtc = new Date('2026-09-11T23:30:00Z');
    expect(getJstIsoDate(dateLateUtc)).toBe('2026-09-12');
  });

  it('calculates calendar day diff in JST accurately', () => {
    const sept11 = new Date('2026-09-11T06:00:00Z'); // 15:00 JST Sept 11
    expect(getCalendarDayDiffJst('2026-09-13', sept11)).toBe(2);

    const sept12 = new Date('2026-09-12T01:00:00Z'); // 10:00 JST Sept 12
    expect(getCalendarDayDiffJst('2026-09-13', sept12)).toBe(1);

    const sept13 = new Date('2026-09-13T06:00:00Z'); // 15:00 JST Sept 13
    expect(getCalendarDayDiffJst('2026-09-13', sept13)).toBe(0);

    const sept14 = new Date('2026-09-14T06:00:00Z'); // 15:00 JST Sept 14
    expect(getCalendarDayDiffJst('2026-09-13', sept14)).toBe(-1);
  });

  it('resolves relative day labels', () => {
    expect(getRelativeDateLabel(0)).toBe('今日');
    expect(getRelativeDateLabel(1)).toBe('明日');
    expect(getRelativeDateLabel(2)).toBe('明後日');
    expect(getRelativeDateLabel(0, true)).toBe('Today');
    expect(getRelativeDateLabel(1, true)).toBe('Tomorrow');
    expect(getRelativeDateLabel(2, true)).toBe('Day after tomorrow');
  });

  it('resolves relative musubi title', () => {
    expect(getRelativeMusubiTitle(2)).toBe('明後日の結びの一番');
    expect(getRelativeMusubiTitle(1)).toBe('明日の結びの一番');
    expect(getRelativeMusubiTitle(0)).toBe('本日の結びの一番');
    expect(getRelativeMusubiTitle(2, true)).toBe("Day After Tomorrow's Final Bout");
    expect(getRelativeMusubiTitle(1, true)).toBe("Tomorrow's Final Bout");
    expect(getRelativeMusubiTitle(0, true)).toBe("Today's Final Bout");
    expect(getRelativeMusubiTitle(null)).toBe('結びの一番');
  });

  it('resolves relative highlights title and monomosu text via translation mock', () => {
    const fakeT = ((key: string) => key) as any;
    expect(getRelativeHighlightsTitle(2, false, fakeT)).toBe('highlights.sectionTitleDayAfterTomorrow');
    expect(getRelativeHighlightsTitle(1, false, fakeT)).toBe('highlights.sectionTitleTomorrow');
    expect(getRelativeHighlightsTitle(0, false, fakeT)).toBe('highlights.sectionTitle');
    expect(getRelativeHighlightsTitle(0, true, fakeT)).toBe('highlights.finalTitle');

    expect(getRelativeMonomosuText(2, false, fakeT)).toBe('highlights.monomosuDayAfterTomorrowText');
    expect(getRelativeMonomosuText(1, false, fakeT)).toBe('highlights.monomosuTomorrowText');
    expect(getRelativeMonomosuText(0, false, fakeT)).toBe('highlights.monomosuLiveText');
    expect(getRelativeMonomosuText(0, true, fakeT)).toBe('highlights.monomosuFinalText');
  });
});

describe('shared date display', () => {
  it('writes Reiwa basho names with kanji numerals', () => {
    expect(formatKanjiNumber(1)).toBe('一');
    expect(formatKanjiNumber(8)).toBe('八');
    expect(formatKanjiNumber(10)).toBe('十');
    expect(formatKanjiNumber(11)).toBe('十一');
    expect(formatKanjiNumber(20)).toBe('二十');
    expect(formatWarekiBashoName(2026, 11)).toBe('令和八年十一月場所');
    expect(formatWarekiBashoName(2019, 5)).toBe('令和元年五月場所');
    expect(normalizeWarekiBashoTitle('令和8年', '11月場所')).toBe('令和八年十一月場所');
    expect(normalizeWarekiBashoTitle('令和八年', '七月場所')).toBe('令和八年七月場所');
  });

  it('writes calendar dates as 2026年11月9日 and English dates in month-name form', () => {
    expect(formatDisplayDate('2026-11-09', 'ja')).toBe('2026年11月9日');
    expect(formatDisplayDate('2026-05-10', 'ja')).toBe('2026年5月10日');
    expect(formatDisplayDate('2026-11-09', 'en')).toBe('November 9, 2026');
  });

  it('writes timestamps in JST and labels them JST', () => {
    expect(formatDisplayTimestamp('2026-11-09T17:57:42+09:00', 'ja')).toBe('2026年11月9日 17:57 JST');
    expect(formatDisplayTimestamp('2026-04-27T08:15:00+09:00', 'ja')).toBe('2026年4月27日 08:15 JST');
    expect(formatDisplayTimestamp('2026-08-12T00:27:59Z', 'ja')).toBe('2026年8月12日 09:27 JST');
    expect(formatDisplayTimestamp('2026-04-18', 'ja')).toBe('2026年4月18日');
    expect(formatDisplayTimestamp('2026-11-09T17:57:42+09:00', 'en')).toBe('November 9, 2026, 5:57 p.m. JST');
    expect(formatDisplayTimestamp('not-a-date', 'ja')).toBe('not-a-date');
    expect(formatInstantDate('2026-06-30T00:00:00+09:00', 'ja')).toBe('2026年6月30日');
    expect(formatInstantDate('2026-06-30T00:00:00+09:00', 'en')).toBe('June 30, 2026');
  });

  it('rewrites wareki dates inside day headings to the gregorian date form', () => {
    expect(formatDayHead('二日目： 令和8年11月9日(月)', 'ja')).toBe('二日目： 2026年11月9日(月)');
    expect(formatDayHead('千秋楽： 令和八年三月二十二日(日)', 'ja')).toBe('千秋楽： 2026年3月22日(日)');
    expect(formatDayHead('千秋楽： 令和81年12月31日(木)', 'ja')).toBe('千秋楽： 2099年12月31日(木)');
    expect(formatDayHead('二日目： 2026年11月9日(月)', 'ja')).toBe('二日目： 2026年11月9日(月)');
    expect(formatDayHead('二日目： 令和8年11月9日(月)', 'en')).toBe('二日目： November 9, 2026 (Mon)');
    expect(formatDayHead('二日目： 2026年11月9日(月)', 'en')).toBe('二日目： November 9, 2026 (Mon)');
  });

  it('marks a clock time as JST', () => {
    expect(formatJstClock('16:20')).toBe('16:20 JST');
    expect(formatJstClock('16:20 JST')).toBe('16:20 JST');
  });
});
