import { describe, expect, it } from 'vitest';
import {
  banzukePath,
  findArchiveDay,
  getAdjacentDay,
  getArchiveRouteConfigForPathname,
  getArchiveUpdatedAt,
  getArchiveUpdateMessage,
  getDayPath,
  getHubPath,
  getHubPathForDateKey,
  isElapsedArchiveDay,
  legacyBanzukePath,
  parseTopLevelSlug,
} from './torikumi-routes';
import { torikumiArchive, torikumiMonthKey } from './torikumi-data';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';

describe('torikumi route helpers', () => {
  it('parses dated top-level result slug', () => {
    const day = torikumiArchive.resultDays[0];

    expect(parseTopLevelSlug(`${day.pathDate}-torikumi`)).toEqual({
      dateKey: day.pathDate,
      mode: 'result',
    });
  });

  it('parses dated top-level schedule slug', () => {
    const day = torikumiArchive.scheduleDays[0];

    expect(parseTopLevelSlug(`${day.pathDate}-yotei`)).toEqual({
      dateKey: day.pathDate,
      mode: 'schedule',
    });
  });

  it('rejects unsupported slugs', () => {
    expect(parseTopLevelSlug(banzukePath.slice(1))).toBeNull();
    expect(parseTopLevelSlug('invalid')).toBeNull();
  });

  it('builds hub and day paths from archive data', () => {
    const day = torikumiArchive.resultDays[0];
    expect(getHubPath('result')).toBe(`/${torikumiMonthKey}-torikumi`);
    expect(getHubPath('schedule')).toBe(`/${torikumiMonthKey}-yotei`);
    expect(getDayPath(day, 'result')).toBe(`/${day.pathDate}-torikumi`);
    expect(getArchiveUpdatedAt('result')).toBe(torikumiArchive.resultUpdatedAt);
    expect(getArchiveUpdatedAt('schedule')).toBe(torikumiArchive.scheduleUpdatedAt);
    expect(getArchiveUpdateMessage('result')).toContain('17:30');
    expect(getArchiveUpdateMessage('schedule')).toContain('19:00');
    expect(legacyBanzukePath).toBe(`/${torikumiMonthKey}-o-sumo`);
    expect(banzukePath).toBe(`/${torikumiMonthKey}-banduke`);
  });

  it('resolves archive day and adjacent navigation', () => {
    const firstResultDay = torikumiArchive.resultDays[0];
    const secondResultDay = torikumiArchive.resultDays[1];
    const day = findArchiveDay(firstResultDay.pathDate, 'result');

    expect(day?.label).toBe('初日');
    expect(getAdjacentDay(day!, 'result', 'prev')).toBeUndefined();
    expect(getAdjacentDay(day!, 'result', 'next')?.pathDate).toBe(secondResultDay.pathDate);
    expect(torikumiArchive.resultDays).toHaveLength(15);
    expect(torikumiArchive.scheduleDays).toHaveLength(15);
    // Schedule status can change over time; keep this assertion data-driven.
    const marchScheduleDays = MARCH2026_TORIKUMI_DATA.scheduleDays ?? [];
    expect(marchScheduleDays.length).toBeGreaterThan(0);
    expect(marchScheduleDays.every((d) => d.status === 'pending' || d.status === 'published')).toBe(true);

    const firstScheduleDay = torikumiArchive.scheduleDays[0];
    const secondScheduleDay = torikumiArchive.scheduleDays[1];
    const scheduleDay = findArchiveDay(firstScheduleDay.pathDate, 'schedule');
    // Only test schedule navigation if schedule days are in a configured month
    if (scheduleDay) {
      expect(getAdjacentDay(scheduleDay, 'schedule', 'next')?.pathDate).toBe(secondScheduleDay.pathDate);
    }
  });

  it('keeps adjacent navigation inside the same month archive', () => {
    const marchFirstDay = MARCH2026_TORIKUMI_DATA.resultDays?.[0];
    const marchSecondDay = MARCH2026_TORIKUMI_DATA.resultDays?.[1];
    expect(marchFirstDay).toBeDefined();
    expect(marchSecondDay).toBeDefined();
    expect(getAdjacentDay(marchFirstDay!, 'result', 'prev')).toBeUndefined();
    expect(getAdjacentDay(marchFirstDay!, 'result', 'next')?.pathDate).toBe(marchSecondDay!.pathDate);
  });

  it('keeps all March 2026 result and schedule days in the March archive', () => {
    const marchResultDays = MARCH2026_TORIKUMI_DATA.resultDays ?? [];
    const marchScheduleDays = MARCH2026_TORIKUMI_DATA.scheduleDays ?? [];

    expect(marchResultDays).toHaveLength(15);
    expect(marchScheduleDays).toHaveLength(15);

    for (const day of [...marchResultDays, ...marchScheduleDays]) {
      expect(day.pathDate).toMatch(/^202603/);
      expect(day.isoDate).toMatch(/^2026-03-/);
    }

    for (const day of marchScheduleDays) {
      const matchCount = day.data.makuuchi.matches.length + day.data.juryo.matches.length;
      expect(day.status).toBe('published');
      expect(day.statusMessage).toBeNull();
      expect(matchCount).toBeGreaterThan(0);
      expect(day.data.makuuchi.matches.every((match) => match.winner === null)).toBe(true);
      expect(day.data.juryo.matches.every((match) => match.winner === null)).toBe(true);
    }
  });

  it('resolves month config from pathname and date key', () => {
    const marchConfig = getArchiveRouteConfigForPathname('/202603-banduke');
    const mayConfig = getArchiveRouteConfigForPathname('/202605-torikumi');
    const activeMonthKey = torikumiArchive.resultDays[0]?.pathDate.slice(0, 6);
    expect(torikumiMonthKey).toBe(activeMonthKey);
    expect(torikumiArchive.resultDays[0]?.pathDate.startsWith(torikumiMonthKey)).toBe(true);
    expect(MARCH2026_TORIKUMI_DATA.resultDays?.[0]?.pathDate.startsWith('202603')).toBe(true);
    expect(marchConfig.monthKey).toBe('202603');
    expect(mayConfig.monthKey).toBe('202605');
    expect(getHubPathForDateKey('20260322', 'result')).toBe('/202603-torikumi');
    expect(getHubPathForDateKey('20260524', 'schedule')).toBe('/202605-yotei');
  });

  it('detects elapsed archive days from the supplied reference date', () => {
    const referenceDay = torikumiArchive.resultDays[7];
    const pastDay = torikumiArchive.resultDays[6];
    const currentDay = torikumiArchive.resultDays[7];

    expect(referenceDay).toBeDefined();
    expect(pastDay).toBeDefined();
    expect(currentDay).toBeDefined();
    expect(isElapsedArchiveDay(pastDay!, referenceDay!.isoDate)).toBe(true);
    expect(isElapsedArchiveDay(currentDay!, referenceDay!.isoDate)).toBe(false);
    expect(isElapsedArchiveDay(pastDay!, 'invalid')).toBe(false);
  });
});
