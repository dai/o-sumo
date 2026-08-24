import { makuuchiData, juryo, type Rikishi } from './sumo-data';
import type { RikishiProfile } from './rikishi-profile';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';
import { JULY2026_TORIKUMI_DATA } from './july2026-data';

export interface FeaturedMatchupPreset {
  id: string;
  labelJa: string;
  labelEn: string;
  ids: [number, number];
  names: [string, string];
}

export const FEATURED_MATCHUP_PRESETS: FeaturedMatchupPreset[] = [
  {
    id: 'yokozuna-clash',
    labelJa: '豊昇龍 vs 大の里（横綱対決）',
    labelEn: 'Hoshoryu vs Onosato (Yokozuna)',
    ids: [3842, 4227],
    names: ['豊昇龍', '大の里'],
  },
  {
    id: 'ozeki-rivalry',
    labelJa: '霧島 vs 琴櫻（大関対決）',
    labelEn: 'Kirishima vs Kotozakura (Ozeki)',
    ids: [3622, 3661],
    names: ['霧島', '琴櫻'],
  },
  {
    id: 'sekiwake-battle',
    labelJa: '熱海富士 vs 若隆景（関脇対決）',
    labelEn: 'Atamifuji vs Wakatakakage (Sekiwake)',
    ids: [4055, 3761],
    names: ['熱海富士', '若隆景'],
  },
  {
    id: 'sanyaku-rising',
    labelJa: '琴勝峰 vs 安青錦（三役対決）',
    labelEn: 'Kotoshogiku vs Aonishiki (Sanyaku)',
    ids: [3840, 4230],
    names: ['琴勝峰', '安青錦'],
  },
];

export interface CurrentBashoRikishiInfo {
  rank: string;
  side: 'east' | 'west';
  wins: number;
  losses: number;
  draws: number;
}

const ALL_CURRENT_RIKISHI: Rikishi[] = [
  ...makuuchiData.flatMap((group) => [...group.east, ...group.west]),
  ...juryo.flatMap((group) => [...group.east, ...group.west]),
];

const RIKISHI_BY_ID = new Map<number, Rikishi>(
  ALL_CURRENT_RIKISHI.map((wrestler) => [wrestler.id, wrestler]),
);

export function getRikishiCurrentBashoInfo(id: number): CurrentBashoRikishiInfo | null {
  const wrestler = RIKISHI_BY_ID.get(id);
  if (!wrestler) return null;
  return {
    rank: wrestler.rank,
    side: wrestler.side,
    wins: wrestler.wins ?? 0,
    losses: wrestler.losses ?? 0,
    draws: wrestler.draws ?? 0,
  };
}

export interface AikuchiAnalysis {
  totalBouts: number;
  winsA: number;
  winsB: number;
  winRateA: number; // 0 - 100
  winRateB: number; // 0 - 100
  leader: 0 | 1 | null; // 0 = A leads, 1 = B leads, null = even or no bouts
  diff: number;
}

export function analyzeAikuchi(winsA: number, winsB: number): AikuchiAnalysis {
  const totalBouts = winsA + winsB;
  if (totalBouts === 0) {
    return {
      totalBouts: 0,
      winsA: 0,
      winsB: 0,
      winRateA: 0,
      winRateB: 0,
      leader: null,
      diff: 0,
    };
  }

  const winRateA = Math.round((winsA / totalBouts) * 1000) / 10;
  const winRateB = Math.round((winsB / totalBouts) * 1000) / 10;
  const diff = Math.abs(winsA - winsB);
  const leader = winsA > winsB ? 0 : winsA < winsB ? 1 : null;

  return {
    totalBouts,
    winsA,
    winsB,
    winRateA,
    winRateB,
    leader,
    diff,
  };
}

export interface PhysicalStatDiff {
  valueA: number;
  valueB: number;
  diff: number; // A - B
  advantage: 0 | 1 | null; // 0 = A larger/higher, 1 = B, null = equal
}

export function calculateStatDiff(valueA: number, valueB: number): PhysicalStatDiff {
  const diff = valueA - valueB;
  return {
    valueA,
    valueB,
    diff: Math.abs(diff),
    advantage: diff > 0 ? 0 : diff < 0 ? 1 : null,
  };
}

export interface KimariteCount {
  name: string;
  count: number;
}

export function getRikishiKimariteStats(shikona: string, limit = 4): KimariteCount[] {
  if (!shikona) return [];
  const counts = new Map<string, number>();
  const datasets = [JULY2026_TORIKUMI_DATA, MAY2026_TORIKUMI_DATA, MARCH2026_TORIKUMI_DATA];

  for (const archive of datasets) {
    for (const day of archive.resultDays ?? []) {
      for (const divisionDay of [day.data.makuuchi, day.data.juryo]) {
        for (const match of divisionDay.matches) {
          if (match.winner === shikona && match.kimarite) {
            counts.set(match.kimarite, (counts.get(match.kimarite) ?? 0) + 1);
          }
        }
      }
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ja'))
    .slice(0, limit);
}

export function calculateCareerWinRate(profile: RikishiProfile): { rate: string; total: number } {
  const { wins, losses } = profile.careerStats;
  const decided = wins + losses;
  if (decided === 0) return { rate: '0.0%', total: 0 };
  return {
    rate: `${((wins / decided) * 100).toFixed(1)}%`,
    total: wins + losses + (profile.careerStats.draws ?? 0),
  };
}
