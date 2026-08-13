import { JULY2026_JURYO_DATA, JULY2026_MAKUUCHI_DATA } from './july2026-banzuke-data';

export interface Rikishi {
  id: number;
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw' | null)[];
  profileUrl: string;
  memo?: string;
}

export interface RankGroup {
  title: string;
  east: Rikishi[];
  west: Rikishi[];
}

export const makuuchiData: RankGroup[] = JULY2026_MAKUUCHI_DATA;

export const juryo: RankGroup[] = JULY2026_JURYO_DATA;
