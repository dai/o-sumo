import { describe, expect, it } from 'vitest';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';

function toYmd(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

describe('MAY2026_TORIKUMI_DATA', () => {
  it('keeps 15 consecutive days from 2026-05-10 to 2026-05-24', () => {
    const resultDays = MAY2026_TORIKUMI_DATA.resultDays ?? [];
    expect(resultDays).toHaveLength(15);
    expect(resultDays[0]?.pathDate).toBe('20260510');
    expect(resultDays[14]?.pathDate).toBe('20260524');

    for (let i = 0; i < resultDays.length; i += 1) {
      const currentDate = new Date(toYmd(resultDays[i].pathDate));
      const expectedDate = new Date('2026-05-10');
      expectedDate.setDate(expectedDate.getDate() + i);
      expect(currentDate.toISOString().slice(0, 10)).toBe(expectedDate.toISOString().slice(0, 10));
    }
  });

  it('keeps all result days pending with normalized status message and empty matches', () => {
    const resultDays = MAY2026_TORIKUMI_DATA.resultDays ?? [];
    for (const day of resultDays) {
      expect(day.status).toBe('pending');
      expect(day.statusMessage).toBe('結果未更新');
      expect(day.data.makuuchi.matches).toHaveLength(0);
      expect(day.data.juryo.matches).toHaveLength(0);
    }
  });

  it('keeps all schedule days pending with normalized status message and empty matches', () => {
    const scheduleDays = MAY2026_TORIKUMI_DATA.scheduleDays ?? [];
    expect(scheduleDays).toHaveLength(15);

    for (const day of scheduleDays) {
      expect(day.status).toBe('pending');
      expect(day.statusMessage).toBe('取組予定未更新');
      expect(day.data.makuuchi.matches).toHaveLength(0);
      expect(day.data.juryo.matches).toHaveLength(0);
    }
  });
});
