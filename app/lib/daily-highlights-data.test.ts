import { describe, expect, it } from 'vitest';
import {
  findRikishiById,
  findRikishiByName,
  enrichFeaturedMatchup,
  getDailyHighlights,
  getHeadToHeadRecord,
  DAILY_HIGHLIGHTS_REGISTRY,
  resolveDailyHighlightsTarget,
} from './daily-highlights-data';
import { torikumiArchive } from './torikumi-data';
import { getDayPath } from './torikumi-routes';

describe('daily-highlights-data', () => {
  const lastScheduleDay = torikumiArchive.scheduleDays[torikumiArchive.scheduleDays.length - 1];

  it('finds rikishi by id and name', () => {
    const hoshoryu = findRikishiById(3842);
    expect(hoshoryu).toBeDefined();
    expect(hoshoryu?.name).toBe('豊昇龍');

    const onosato = findRikishiByName('大の里');
    expect(onosato).toBeDefined();
    expect(onosato?.id).toBe(4227);
  });

  it('retrieves head-to-head records accurately', () => {
    const record = getHeadToHeadRecord(3842, 4227);
    expect(record).toEqual([5, 3]);

    const reverseRecord = getHeadToHeadRecord(4227, 3842);
    expect(reverseRecord).toEqual([3, 5]);

    const unknownRecord = getHeadToHeadRecord(999998, 999999);
    expect(unknownRecord).toEqual([0, 0]);
  });

  it('enriches featured matchups with rikishi data and aikuchi stats', () => {
    const featured = DAILY_HIGHLIGHTS_REGISTRY[0].featured[0];
    const enriched = enrichFeaturedMatchup(featured);

    expect(enriched).not.toBeNull();
    expect(enriched?.east.name).toBe('豊昇龍');
    expect(enriched?.west.name).toBe('大の里');
    expect(enriched?.aikuchi.winsA).toBe(5);
    expect(enriched?.aikuchi.winsB).toBe(3);
    expect(enriched?.aikuchi.diff).toBe(2);
    expect(enriched?.aikuchi.leader).toBe(0);
    expect(enriched?.compareHref).toBe('/compare/?ids=3842,4227');
  });

  it('resolves upcoming highlights from the first scheduled day', () => {
    const target = resolveDailyHighlightsTarget({
      archive: torikumiArchive,
      bashoStatus: {
        kind: 'upcoming',
        startDate: torikumiArchive.scheduleDays[0].isoDate,
        endDate: lastScheduleDay?.isoDate ?? null,
        day: null,
      },
    });

    expect(target).toEqual({
      day: torikumiArchive.scheduleDays[0],
      mode: 'schedule',
    });
  });

  it('resolves live highlights from published results before the schedule', () => {
    const resultDay = torikumiArchive.resultDays[3];
    const target = resolveDailyHighlightsTarget({
      archive: torikumiArchive,
      bashoStatus: {
        kind: 'live',
        startDate: torikumiArchive.scheduleDays[0].isoDate,
        endDate: lastScheduleDay?.isoDate ?? null,
        day: resultDay.day,
      },
    });

    expect(target).toEqual({ day: resultDay, mode: 'result' });
  });

  it('falls back to the same live schedule day when its result is unpublished', () => {
    const scheduleDay = torikumiArchive.scheduleDays[3];
    const archive = {
      ...torikumiArchive,
      resultDays: torikumiArchive.resultDays.filter((day) => day.day !== scheduleDay.day),
    };

    expect(resolveDailyHighlightsTarget({
      archive,
      bashoStatus: {
        kind: 'live',
        startDate: archive.scheduleDays[0].isoDate,
        endDate: archive.scheduleDays[archive.scheduleDays.length - 1]?.isoDate ?? null,
        day: scheduleDay.day,
      },
    })).toEqual({ day: scheduleDay, mode: 'schedule' });
  });

  it('resolves final highlights from the latest published result with matches', () => {
    const finalDay = torikumiArchive.resultDays[torikumiArchive.resultDays.length - 1]!;
    const target = resolveDailyHighlightsTarget({
      archive: torikumiArchive,
      bashoStatus: {
        kind: 'final',
        startDate: torikumiArchive.scheduleDays[0].isoDate,
        endDate: lastScheduleDay?.isoDate ?? null,
        day: null,
      },
    });

    expect(target).toEqual({ day: finalDay, mode: 'result' });

    const highlights = getDailyHighlights({ monthKey: '202607', target: target! });
    expect(highlights).not.toBeNull();
    expect(highlights?.day).toBe(15);
    expect(highlights?.pathDate).toBe('20260726');
    expect(highlights?.mode).toBe('result');
    expect(highlights?.matchups[0]).toMatchObject({
      east: { id: 4055, name: '熱海富士' },
      west: { id: 3622, name: '霧島' },
      boutHref: `${getDayPath(finalDay, 'result')}#bout-makuuchi-21`,
    });
  });

  it('does not fall back to another basho when no target day can be resolved', () => {
    const emptyArchive = {
      ...torikumiArchive,
      resultDays: [],
      scheduleDays: [],
    };

    expect(resolveDailyHighlightsTarget({
      archive: emptyArchive,
      bashoStatus: { kind: 'final', startDate: null, endDate: null, day: null },
    })).toBeNull();
  });
});
