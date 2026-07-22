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
  banzukePath: string;
}

export const PAST_BASHO: ArchiveBasho[] = [
  {
    id: '202605',
    year: '令和八年',
    name: '五月場所',
    data: MAY2026_TORIKUMI_DATA,
    resultPath: '/202605-torikumi',
    schedulePath: '/202605-yotei',
    banzukePath: '/202605-banzuke',
  },
  {
    id: '202603',
    year: '令和八年',
    name: '三月場所',
    data: MARCH2026_TORIKUMI_DATA,
    resultPath: '/202603-torikumi',
    schedulePath: '/202603-yotei',
    banzukePath: '/202603-banzuke',
  },
];

export { CURRENT_BASHO_ID };
