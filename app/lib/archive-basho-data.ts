import { torikumiArchive, torikumiMonthKey, type TorikumiDataSet } from './torikumi-data';
import { juryo, makuuchiData, type RankGroup } from './sumo-data';
import {
  MARCH2026_BASHO_NAME,
  MARCH2026_JURYO_DATA,
  MARCH2026_MAKUUCHI_DATA,
  MARCH2026_UPDATED_AT,
  MARCH2026_YEAR,
} from './march2026-banzuke-data';
import { MARCH2026_TORIKUMI_DATA } from './march2026-torikumi-data';
import {
  MAY2026_BASHO_NAME,
  MAY2026_JURYO_DATA,
  MAY2026_MAKUUCHI_DATA,
  MAY2026_UPDATED_AT,
  MAY2026_YEAR,
} from './may2026-banzuke-data';
import { MAY2026_TORIKUMI_DATA } from './may2026-data';

export interface ArchiveBanzukeData {
  bashoName: string;
  year: string;
  updatedAt: string;
  makuuchi: RankGroup[];
  juryo: RankGroup[];
}

const CURRENT_BANZUKE_DATA: ArchiveBanzukeData = {
  bashoName: torikumiArchive.bashoName,
  year: torikumiArchive.year,
  updatedAt: torikumiArchive.resultUpdatedAt,
  makuuchi: makuuchiData,
  juryo,
};

const MARCH2026_BANZUKE_DATA: ArchiveBanzukeData = {
  bashoName: MARCH2026_BASHO_NAME,
  year: MARCH2026_YEAR,
  updatedAt: MARCH2026_UPDATED_AT,
  makuuchi: MARCH2026_MAKUUCHI_DATA,
  juryo: MARCH2026_JURYO_DATA,
};

const MAY2026_BANZUKE_DATA: ArchiveBanzukeData = {
  bashoName: MAY2026_BASHO_NAME,
  year: MAY2026_YEAR,
  updatedAt: MAY2026_UPDATED_AT,
  makuuchi: MAY2026_MAKUUCHI_DATA,
  juryo: MAY2026_JURYO_DATA,
};

export const CURRENT_BASHO_ID = torikumiMonthKey;
export const CURRENT_RESULT_PATH = `/${CURRENT_BASHO_ID}-torikumi`;
export const CURRENT_SCHEDULE_PATH = `/${CURRENT_BASHO_ID}-yotei`;
export const CURRENT_BANZUKE_PATH = `/${CURRENT_BASHO_ID}-banduke`;

export function getTorikumiArchiveByMonthKey(monthKey: string): TorikumiDataSet {
  if (monthKey === '202603') {
    return MARCH2026_TORIKUMI_DATA;
  }
  if (monthKey === '202605') {
    return MAY2026_TORIKUMI_DATA;
  }
  return torikumiArchive;
}

export function getBanzukeDataByMonthKey(monthKey: string): ArchiveBanzukeData {
  if (monthKey === '202603') {
    return MARCH2026_BANZUKE_DATA;
  }
  if (monthKey === '202605') {
    return MAY2026_BANZUKE_DATA;
  }
  return CURRENT_BANZUKE_DATA;
}
