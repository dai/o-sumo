import { describe, expect, it } from 'vitest';
import {
  getJstIsoDate,
  getCalendarDayDiffJst,
  getRelativeDateLabel,
  getRelativeHighlightsTitle,
  getRelativeMusubiTitle,
  getRelativeMonomosuText,
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
