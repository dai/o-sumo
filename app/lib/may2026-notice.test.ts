import { describe, expect, it } from 'vitest';
import { getLatestPublishedScheduleDay, getMay2026NoticeParams } from './may2026-notice';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';
import { torikumiArchive } from './torikumi-data';

describe('May 2026 notice helpers', () => {
  it('returns the latest published schedule day from the active archive data', () => {
    const expected = (torikumiArchive.scheduleDays ?? [])
      .filter((day) => day.status === 'published')
      .sort((a, b) => b.day - a.day)[0];

    const latest = getLatestPublishedScheduleDay(torikumiArchive);
    expect(latest).toEqual(expected);
    if (latest) {
      expect(latest.status).toBe('published');
    }
  });

  it('returns fallback values when no published schedule exists', () => {
    const params = getMay2026NoticeParams({
      ...MAY2026_TORIKUMI_DATA,
      resultDays: (MAY2026_TORIKUMI_DATA.resultDays ?? []).map((day) => ({
        ...day,
        status: 'pending' as const,
      })),
      scheduleDays: (MAY2026_TORIKUMI_DATA.scheduleDays ?? []).map((day) => ({
        ...day,
        status: 'pending' as const,
      })),
    });

    expect(params).toEqual({
      day: 1,
    });
  });

  it('caps schedule day by latest result day + 1', () => {
    const params = getMay2026NoticeParams({
      ...MAY2026_TORIKUMI_DATA,
      resultDays: (MAY2026_TORIKUMI_DATA.resultDays ?? []).map((day) => ({
        ...day,
        status: day.day <= 3 ? 'published' as const : 'pending' as const,
      })),
      scheduleDays: (MAY2026_TORIKUMI_DATA.scheduleDays ?? []).map((day) => ({
        ...day,
        status: 'published' as const,
      })),
    });

    expect(params).toEqual({
      day: 4,
    });
  });
});
