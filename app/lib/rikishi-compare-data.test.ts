import { describe, expect, it } from 'vitest';
import {
  analyzeAikuchi,
  calculateCareerWinRate,
  calculateStatDiff,
  computeBashoMatchupHistory,
  getBashoMatchupHistory,
  getRikishiCurrentBashoInfo,
  getRikishiKimariteStats,
  FEATURED_MATCHUP_PRESETS,
} from './rikishi-compare-data';
import type { RikishiProfile } from './rikishi-profile';
import type { TorikumiArchiveDay, TorikumiMatch } from './torikumi-data';

describe('rikishi-compare-data', () => {
  it('analyzes aikuchi stats correctly with a clear leader', () => {
    const analysis = analyzeAikuchi(12, 8);
    expect(analysis.totalBouts).toBe(20);
    expect(analysis.winsA).toBe(12);
    expect(analysis.winsB).toBe(8);
    expect(analysis.winRateA).toBe(60);
    expect(analysis.winRateB).toBe(40);
    expect(analysis.leader).toBe(0);
    expect(analysis.diff).toBe(4);
  });

  it('handles even aikuchi matchups', () => {
    const analysis = analyzeAikuchi(5, 5);
    expect(analysis.totalBouts).toBe(10);
    expect(analysis.winRateA).toBe(50);
    expect(analysis.winRateB).toBe(50);
    expect(analysis.leader).toBeNull();
    expect(analysis.diff).toBe(0);
  });

  it('handles zero bouts for first-time encounters', () => {
    const analysis = analyzeAikuchi(0, 0);
    expect(analysis.totalBouts).toBe(0);
    expect(analysis.winRateA).toBe(0);
    expect(analysis.winRateB).toBe(0);
    expect(analysis.leader).toBeNull();
    expect(analysis.diff).toBe(0);
  });

  it('calculates physical stat differences', () => {
    const heightDiff = calculateStatDiff(188, 183);
    expect(heightDiff.diff).toBe(5);
    expect(heightDiff.advantage).toBe(0);

    const weightDiff = calculateStatDiff(138, 175);
    expect(weightDiff.diff).toBe(37);
    expect(weightDiff.advantage).toBe(1);

    const equalDiff = calculateStatDiff(180, 180);
    expect(equalDiff.diff).toBe(0);
    expect(equalDiff.advantage).toBeNull();
  });

  it('fetches current basho rikishi info when available', () => {
    const hoshoryu = getRikishiCurrentBashoInfo(3842);
    expect(hoshoryu).not.toBeNull();
    expect(hoshoryu?.rank).toBe('横綱');

    const unknown = getRikishiCurrentBashoInfo(999999);
    expect(unknown).toBeNull();
  });

  it('aggregates kimarite stats from tournament archives', () => {
    const stats = getRikishiKimariteStats('安青錦', 3);
    expect(Array.isArray(stats)).toBe(true);
    if (stats.length > 0) {
      expect(stats[0]).toHaveProperty('name');
      expect(stats[0]).toHaveProperty('count');
      expect(stats[0].count).toBeGreaterThan(0);
    }
  });

  it('calculates career win rate', () => {
    const mockProfile: RikishiProfile = {
      id: 1,
      name: 'テスト力士',
      yomi: 'てすとりきし',
      currentRank: '前頭筆頭',
      birthDate: '1995-01-01',
      height: 185,
      weight: 150,
      shusshin: '東京都',
      debut: '2015-03',
      photoUrl: '/images/rikishi/1.png',
      sourceUrl: 'https://example.com',
      updatedAt: '2026-08-01',
      careerStats: { wins: 300, losses: 200, draws: 10 },
    };
    const rate = calculateCareerWinRate(mockProfile);
    expect(rate.rate).toBe('60.0%');
    expect(rate.total).toBe(510);
  });

  it('contains valid featured matchup presets', () => {
    expect(FEATURED_MATCHUP_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of FEATURED_MATCHUP_PRESETS) {
      expect(preset.ids).toHaveLength(2);
      expect(preset.ids[0]).toBeGreaterThan(0);
      expect(preset.ids[1]).toBeGreaterThan(0);
      expect(preset.names).toHaveLength(2);
    }
  });
});

// === Basho-by-basho matchup history ===

interface MatchupBashoEntry {
  monthKey: string;
  year: string;
  bashoName: string;
  resultDays: readonly TorikumiArchiveDay[];
}

function makeMatch(
  eastId: number,
  westId: number,
  winner: 'east' | 'west' | null = null,
  boutNo = 1,
): TorikumiMatch {
  return {
    division: '幕内',
    boutNo,
    eastName: `力士${eastId}`,
    eastYomi: '',
    eastEnglish: '',
    eastRank: '前頭',
    eastProfileUrl: `https://www.sumo.or.jp/ResultRikishiData/profile/${eastId}/`,
    westName: `力士${westId}`,
    westYomi: '',
    westEnglish: '',
    westRank: '前頭',
    westProfileUrl: `https://www.sumo.or.jp/ResultRikishiData/profile/${westId}/`,
    kimarite: winner ? '寄り切り' : '',
    winner,
  };
}

function makeDay(day: number, matches: TorikumiMatch[]): TorikumiArchiveDay {
  const isoDate = `2026-09-${String(day).padStart(2, '0')}`;
  const dayName = day === 15 ? '千秋楽' : `${day}日目`;
  return {
    day,
    isoDate,
    pathDate: isoDate.replace(/-/g, ''),
    label: dayName,
    dayHead: isoDate,
    status: 'published',
    data: {
      makuuchi: { day, dayName, dayHead: isoDate, division: '幕内', matches },
      juryo: { day, dayName, dayHead: isoDate, division: '十両', matches: [] },
    },
  };
}

function makeEntry(monthKey: string, days: TorikumiArchiveDay[]): MatchupBashoEntry {
  return { monthKey, year: '令和八年', bashoName: `${monthKey}場所`, resultDays: days };
}

describe('computeBashoMatchupHistory', () => {
  it('returns one record with bout details when two rikishi meet once', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [makeDay(1, [makeMatch(4230, 3842, 'east')])]),
    ];
    const records = computeBashoMatchupHistory(4230, 3842, entries);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      monthKey: '202609',
      year: '令和八年',
      bashoName: '202609場所',
      winsA: 1,
      winsB: 0,
    });
    expect(records[0].bouts).toHaveLength(1);
    expect(records[0].bouts[0]).toMatchObject({
      day: 1,
      division: '幕内',
      boutNo: 1,
      kimarite: '寄り切り',
      winner: 'a',
    });
  });

  it('omits basho entries where only one of the pair participated', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [makeDay(1, [makeMatch(4230, 9999, 'east')])]),
    ];
    expect(computeBashoMatchupHistory(4230, 3842, entries)).toEqual([]);
  });

  it('returns empty when neither of the pair is in any basho entry', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [makeDay(1, [makeMatch(1111, 2222, 'east')])]),
    ];
    expect(computeBashoMatchupHistory(4230, 3842, entries)).toEqual([]);
  });

  it('aggregates multiple bouts in the same basho entry', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [
        makeDay(1, [makeMatch(4230, 3842, 'east', 1)]),
        makeDay(8, [makeMatch(4230, 3842, 'west', 2)]),
      ]),
    ];
    const records = computeBashoMatchupHistory(4230, 3842, entries);
    expect(records).toHaveLength(1);
    expect(records[0].winsA).toBe(1);
    expect(records[0].winsB).toBe(1);
    expect(records[0].bouts.map((b) => b.day)).toEqual([1, 8]);
  });

  it('keeps pending bouts in bouts[] but excludes them from wins', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [
        makeDay(1, [makeMatch(4230, 3842, 'east', 1), makeMatch(4230, 3842, null, 2)]),
      ]),
    ];
    const records = computeBashoMatchupHistory(4230, 3842, entries);
    expect(records).toHaveLength(1);
    expect(records[0].winsA).toBe(1);
    expect(records[0].winsB).toBe(0);
    expect(records[0].bouts).toHaveLength(2);
    expect(records[0].bouts[0].winner).toBe('a');
    expect(records[0].bouts[1].winner).toBeNull();
  });

  it('returns empty when idA === idB (defensive guard)', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [makeDay(1, [makeMatch(4230, 4230, 'east')])]),
    ];
    expect(computeBashoMatchupHistory(4230, 4230, entries)).toEqual([]);
  });

  it('preserves the entry order (newest first) in the returned records', () => {
    const entries: MatchupBashoEntry[] = [
      makeEntry('202609', [makeDay(1, [makeMatch(4230, 3842, 'east')])]),
      makeEntry('202605', [makeDay(1, [makeMatch(4230, 3842, 'west')])]),
      makeEntry('202603', [makeDay(1, [makeMatch(4230, 3842, null)])]),
    ];
    const records = computeBashoMatchupHistory(4230, 3842, entries);
    expect(records.map((r) => r.monthKey)).toEqual(['202609', '202605', '202603']);
    expect(records[0].winsA).toBe(1);
    expect(records[0].winsB).toBe(0);
    expect(records[1].winsA).toBe(0);
    expect(records[1].winsB).toBe(1);
    expect(records[2].winsA).toBe(0);
    expect(records[2].winsB).toBe(0);
    expect(records[2].bouts[0].winner).toBeNull();
  });

  it('getBashoMatchupHistory walks every basho in publication order (live data smoke)', () => {
    const records = getBashoMatchupHistory(4230, 3842);
    expect(Array.isArray(records)).toBe(true);
    for (const record of records) {
      expect(record.monthKey).toMatch(/^20\d{4}$/);
      expect(record.year).toBeTruthy();
      expect(record.bashoName).toBeTruthy();
      expect(record.winsA).toBeGreaterThanOrEqual(0);
      expect(record.winsB).toBeGreaterThanOrEqual(0);
      const settled = record.bouts.filter((b) => b.winner !== null).length;
      expect(record.winsA + record.winsB).toBe(settled);
    }
    for (let i = 1; i < records.length; i++) {
      expect(records[i - 1].monthKey > records[i].monthKey).toBe(true);
    }
  });
});
