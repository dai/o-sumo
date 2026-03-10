import { describe, expect, it } from 'vitest';
import { findArchiveDay, getAdjacentDay, getDayPath, getHubPath, legacyBanzukePath, parseTopLevelSlug } from './torikumi-routes';
import { torikumiArchive } from './torikumi-data';

describe('torikumi route helpers', () => {
  it('parses dated top-level result slug', () => {
    expect(parseTopLevelSlug('20260308-torikumi')).toEqual({
      dateKey: '20260308',
      mode: 'result',
    });
  });

  it('parses dated top-level schedule slug', () => {
    expect(parseTopLevelSlug('20260308-yotei')).toEqual({
      dateKey: '20260308',
      mode: 'schedule',
    });
  });

  it('rejects unsupported slugs', () => {
    expect(parseTopLevelSlug('202603-banduke')).toBeNull();
    expect(parseTopLevelSlug('invalid')).toBeNull();
  });

  it('builds hub and day paths from archive data', () => {
    const day = torikumiArchive.resultDays[0];
    expect(getHubPath('result')).toBe('/202603-torikumi');
    expect(getHubPath('schedule')).toBe('/202603-yotei');
    expect(getDayPath(day, 'result')).toBe('/20260308-torikumi');
    expect(legacyBanzukePath).toBe('/202603-o-sumo');
  });

  it('resolves archive day and adjacent navigation', () => {
    const day = findArchiveDay('20260308', 'result');
    expect(day?.label).toBe('初日');
    expect(getAdjacentDay(day!, 'result', 'prev')).toBeUndefined();
    expect(getAdjacentDay(day!, 'result', 'next')?.pathDate).toBe('20260309');
    expect(torikumiArchive.resultDays).toHaveLength(15);
    expect(torikumiArchive.scheduleDays).toHaveLength(15);
    expect(torikumiArchive.resultDays[1]?.status).toBe('published');

    const scheduleDay = findArchiveDay('20260308', 'schedule');
    expect(getAdjacentDay(scheduleDay!, 'schedule', 'next')?.pathDate).toBe('20260309');
    expect(torikumiArchive.scheduleDays[1]?.status).toBe('published');
  });
});
