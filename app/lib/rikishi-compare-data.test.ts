import { describe, expect, it } from 'vitest';
import {
  analyzeAikuchi,
  calculateCareerWinRate,
  calculateStatDiff,
  getRikishiCurrentBashoInfo,
  getRikishiKimariteStats,
  FEATURED_MATCHUP_PRESETS,
} from './rikishi-compare-data';
import type { RikishiProfile } from './rikishi-profile';

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
