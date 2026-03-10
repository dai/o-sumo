import { describe, expect, it } from 'vitest';
import { sortArchiveDays, sortMatches, sortRankGroups } from './sorting';

describe('sorting helpers', () => {
  it('sorts rank groups by natural order and reverse order', () => {
    const groups = [
      { title: '横綱', east: [], west: [] },
      { title: '大関', east: [], west: [] },
      { title: '前頭十七', east: [], west: [] },
    ];

    expect(sortRankGroups(groups, 'asc').map((group) => group.title)).toEqual(['横綱', '大関', '前頭十七']);
    expect(sortRankGroups(groups, 'desc').map((group) => group.title)).toEqual(['前頭十七', '大関', '横綱']);
  });

  it('sorts archive days and bouts in both directions', () => {
    const days = [
      { day: 3 },
      { day: 1 },
      { day: 2 },
    ] as never[];
    const matches = [
      { boutNo: 5 },
      { boutNo: 1 },
      { boutNo: 3 },
    ] as never[];

    expect(sortArchiveDays(days, 'asc').map((day) => day.day)).toEqual([1, 2, 3]);
    expect(sortArchiveDays(days, 'desc').map((day) => day.day)).toEqual([3, 2, 1]);
    expect(sortMatches(matches, 'asc').map((match) => match.boutNo)).toEqual([1, 3, 5]);
    expect(sortMatches(matches, 'desc').map((match) => match.boutNo)).toEqual([5, 3, 1]);
  });
});
