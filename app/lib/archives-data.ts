// Archive basho places - ordered from newest to oldest
import type { TorikumiDataSet } from './torikumi-data';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';
import { CURRENT_BASHO_ID } from './archive-basho-data';

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
    id: '202605',
    year: '令和八年',
    name: '五月場所',
    data: MAY2026_TORIKUMI_DATA,
    resultPath: '/202605-torikumi',
    schedulePath: '/202605-yotei',
    bandukePath: '/202605-banduke',
  },
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

export { CURRENT_BASHO_ID };
