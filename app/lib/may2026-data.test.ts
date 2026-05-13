import { describe, expect, it } from 'vitest';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';

describe('MAY2026_TORIKUMI_DATA', () => {
  it('keeps 15 consecutive days from 2026-05-10 to 2026-05-24', () => {
    const resultDays = MAY2026_TORIKUMI_DATA.resultDays ?? [];
    expect(resultDays).toHaveLength(15);
    expect(resultDays[0]?.isoDate).toBe('2026-05-10');
    expect(resultDays[0]?.pathDate).toBe('20260510');
    expect(resultDays[14]?.isoDate).toBe('2026-05-24');
    expect(resultDays[14]?.pathDate).toBe('20260524');

    for (let i = 0; i < resultDays.length; i += 1) {
      const currentDate = new Date(resultDays[i].isoDate);
      const expectedDate = new Date('2026-05-10');
      expectedDate.setDate(expectedDate.getDate() + i);
      expect(currentDate.toISOString().slice(0, 10)).toBe(expectedDate.toISOString().slice(0, 10));
      expect(resultDays[i].pathDate).toBe(resultDays[i].isoDate.replace(/-/g, ''));
    }
  });

  it('publishes fetched result days and leaves unfetched future days pending', () => {
    const resultDays = MAY2026_TORIKUMI_DATA.resultDays ?? [];

    expect(resultDays[0].status).toBe('published');
    expect(resultDays[0].data.makuuchi.matches).toHaveLength(20);
    expect(resultDays[0].data.juryo.matches).toHaveLength(14);

    for (const day of resultDays) {
      const matchCount = day.data.makuuchi.matches.length + day.data.juryo.matches.length;
      if (day.status === 'published') {
        expect(day.statusMessage).toBeNull();
        expect(matchCount).toBeGreaterThan(0);
      } else {
        expect(day.status).toBe('pending');
        expect(day.statusMessage).toBe('結果未更新');
      }
    }
  });

  it('publishes early schedule days with announced Makuuchi and Juryo counts', () => {
    const scheduleDays = MAY2026_TORIKUMI_DATA.scheduleDays ?? [];
    const day1 = scheduleDays[0];
    const day2 = scheduleDays[1];

    expect(scheduleDays).toHaveLength(15);
    expect(day1.status).toBe('published');
    expect(day1.statusMessage).toBeNull();
    expect(day1.data.makuuchi.matches).toHaveLength(20);
    expect(day1.data.juryo.matches).toHaveLength(14);
    expect(day1.data.makuuchi.matches[0]).toMatchObject({
      division: '幕内',
      boutNo: 1,
      kimarite: '未定',
      winner: null,
    });

    expect(day2.status).toBe('published');
    expect(day2.statusMessage).toBeNull();
    expect(day2.data.makuuchi.matches).toHaveLength(20);
    expect(day2.data.juryo.matches).toHaveLength(14);
    expect(day2.data.makuuchi.matches[19]).toMatchObject({
      division: '幕内',
      boutNo: 20,
      kimarite: '未定',
      winner: null,
    });
    expect(day2.data.makuuchi.absentees?.map((entry) => entry.name)).toEqual(['大の里', '安青錦']);
    expect(day2.data.juryo.absentees ?? []).toHaveLength(0);
  });

  it('keeps unpublished schedule days pending with normalized status message and empty matches', () => {
    const scheduleDays = MAY2026_TORIKUMI_DATA.scheduleDays ?? [];
    for (const day of scheduleDays) {
      const matchCount = day.data.makuuchi.matches.length + day.data.juryo.matches.length;
      if (day.status === 'published') {
        expect(day.statusMessage).toBeNull();
        expect(matchCount).toBeGreaterThan(0);
      } else {
        expect(day.status).toBe('pending');
        expect(day.statusMessage).toBe('取組予定未更新');
      }
    }
  });
});
