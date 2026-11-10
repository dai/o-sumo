import type { RankGroup } from './sumo-data';
import type { TorikumiDataSet } from './torikumi-data';

/** Day fields the shell needs before the bout payload is fetched. */
export interface ArchiveDayIndex {
  day: number;
  isoDate: string;
  pathDate: string;
  label: string;
  dayHead: string;
  status: 'published' | 'pending';
  statusMessage: string | null;
}

export interface ArchiveRouteIndexEntry {
  monthKey: string;
  year: string;
  bashoName: string;
  updatedAt: string;
  resultUpdatedAt: string;
  scheduleUpdatedAt: string;
  resultDays: ArchiveDayIndex[];
  scheduleDays: ArchiveDayIndex[];
}

export interface ArchiveBanzukeDocument {
  bashoName: string;
  year: string;
  updatedAt: string;
  makuuchi: RankGroup[];
  juryo: RankGroup[];
}

/** One past basho, as written to `public/api/v1/archive/{YYYYMM}.json`. */
export interface ArchiveDocument {
  monthKey: string;
  torikumi: TorikumiDataSet;
  banzuke: ArchiveBanzukeDocument;
}

export function isArchiveDocument(value: unknown, monthKey: string): value is ArchiveDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as Partial<ArchiveDocument>;
  return document.monthKey === monthKey && Boolean(document.torikumi) && Boolean(document.banzuke);
}

export function archiveJsonPath(monthKey: string): string {
  return `/api/v1/archive/${monthKey}.json`;
}
