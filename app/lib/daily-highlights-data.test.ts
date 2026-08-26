import { describe, expect, it } from 'vitest';
import {
  enrichFeaturedMatchup,
  getDailyHighlights,
  resolveDailyHighlightsTarget,
  type FeaturedMatchup,
} from './daily-highlights-data';
import { torikumiArchive, type TorikumiDataSet, type TorikumiArchiveDay } from './torikumi-data';
import { getDayPath } from './torikumi-routes';

describe('daily-highlights-data', () => {
  const lastScheduleDay = torikumiArchive.scheduleDays[torikumiArchive.scheduleDays.length - 1];

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

describe('getDailyHighlights pending state', () => {
  function buildEmptyScheduleDay(): TorikumiArchiveDay {
    return {
      day: 1,
      isoDate: '2026-09-13',
      pathDate: '20260913',
      label: '初日',
      dayHead: '',
      status: 'pending',
      data: {
        makuuchi: { day: 1, dayName: '', dayHead: '', division: '幕内', matches: [] },
        juryo: { day: 1, dayName: '', dayHead: '', division: '十両', matches: [] },
      },
    };
  }

  it('returns null for an upcoming schedule day that has no official makuuchi bouts', () => {
    const archive: TorikumiDataSet = {
      ...torikumiArchive,
      scheduleDays: [buildEmptyScheduleDay()],
      resultDays: [],
    };
    const target = resolveDailyHighlightsTarget({
      archive,
      bashoStatus: { kind: 'upcoming', startDate: '2026-09-13', endDate: '2026-09-27', day: null },
    });

    expect(target).not.toBeNull();
    expect(getDailyHighlights({ monthKey: '202609', target: target! })).toBeNull();
  });

  it('returns null for a live schedule day whose results are not yet published', () => {
    const scheduleDay = buildEmptyScheduleDay();
    const archive: TorikumiDataSet = {
      ...torikumiArchive,
      scheduleDays: [scheduleDay],
      resultDays: [],
    };
    const target = resolveDailyHighlightsTarget({
      archive,
      bashoStatus: { kind: 'live', startDate: '2026-09-13', endDate: '2026-09-27', day: 1 },
    });

    expect(target).toEqual({ day: scheduleDay, mode: 'schedule' });
    expect(getDailyHighlights({ monthKey: '202609', target: target! })).toBeNull();
  });

  it('does not synthesize matchups from a static registry when official data exists', () => {
    const finalDay = torikumiArchive.resultDays[torikumiArchive.resultDays.length - 1]!;
    const target = resolveDailyHighlightsTarget({
      archive: torikumiArchive,
      bashoStatus: { kind: 'final', startDate: null, endDate: null, day: null },
    });
    expect(target).toEqual({ day: finalDay, mode: 'result' });

    const highlights = getDailyHighlights({ monthKey: '202607', target: target! });
    expect(highlights?.matchups[0]).not.toMatchObject({
      descriptionJa: expect.stringContaining('先場所優勝の豊昇龍'),
    });
  });
});

describe('enrichFeaturedMatchup aikuchi handling', () => {
  const featuredFixture: FeaturedMatchup = {
    id: 'fixture-musubi',
    eastId: 3842,
    westId: 4227,
    descriptionJa: 'テスト用の汎用解説',
    descriptionEn: 'Generic fixture description',
  };

  it('returns null aikuchi when no matchupWinsMap is provided', () => {
    const enriched = enrichFeaturedMatchup(featuredFixture);
    expect(enriched).not.toBeNull();
    expect(enriched?.aikuchi).toBeNull();
  });

  it('returns null aikuchi when matchupWinsMap does not contain the pair', () => {
    const emptyMap = new Map<string, [number, number]>();
    const enriched = enrichFeaturedMatchup(featuredFixture, emptyMap);
    expect(enriched?.aikuchi).toBeNull();
  });

  it('uses the matchupWinsMap entry when present', () => {
    const map = new Map<string, [number, number]>([
      ['3842,4227', [5, 3]],
    ]);
    const enriched = enrichFeaturedMatchup(featuredFixture, map);
    expect(enriched?.aikuchi).toEqual({
      totalBouts: 8,
      winsA: 5,
      winsB: 3,
      winRateA: 62.5,
      winRateB: 37.5,
      leader: 0,
      diff: 2,
    });
    expect(enriched?.compareHref).toBe('/compare/?ids=3842,4227');
  });
});
