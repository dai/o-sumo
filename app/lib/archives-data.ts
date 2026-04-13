// Archive basho places - ordered from newest to oldest
import type { TorikumiDataSet } from './torikumi-data';
import { MARCH2026_TORIKUMI_DATA } from './torikumi-data';

export interface ArchiveBasho {
  id: string; // e.g., '202603'
  year: string;
  name: string;
  data: TorikumiDataSet;
  resultPath: string;
  schedulePath: string;
  bandukePath: string;
}

export const PAST_BASHO: ArchiveBasho[] = [
  {
    id: '202603',
    year: '令和八年',
    name: '三月場所',
    data: MARCH2026_TORIKUMI_DATA,
    resultPath: '/202603-torikumi',
    schedulePath: '/202603-yotei',
    bandukePath: '/202603-banduke',
  },
];

export const CURRENT_BASHO_ID = '202605'; // May 2026
