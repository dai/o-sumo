import { describe, expect, it } from 'vitest';
import {
  banzukePath,
  findArchiveDay,
  getAdjacentDay,
  getArchiveUpdatedAt,
  getArchiveUpdateMessage,
  getDayPath,
  getHubPath,
  isElapsedArchiveDay,
  legacyBanzukePath,
  parseTopLevelSlug,
} from './torikumi-routes';
import { torikumiArchive, torikumiMonthKey } from './torikumi-data';

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
    expect(getArchiveUpdateMessage('result')).toContain('30分ごと');
    expect(getArchiveUpdateMessage('schedule')).toContain('10:00');
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
    expect(torikumiArchive.resultDays[1]?.status).toBe('published');

    const firstScheduleDay = torikumiArchive.scheduleDays[0];
    const secondScheduleDay = torikumiArchive.scheduleDays[1];
    const scheduleDay = findArchiveDay(firstScheduleDay.pathDate, 'schedule');
    expect(getAdjacentDay(scheduleDay!, 'schedule', 'next')?.pathDate).toBe(secondScheduleDay.pathDate);
    expect(torikumiArchive.scheduleDays[1]?.status).toBe('published');
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
