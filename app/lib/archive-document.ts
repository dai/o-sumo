import { getBanzukeDataByMonthKey, getTorikumiArchiveByMonthKey } from './archive-basho-data';
import { PAST_ARCHIVE_MONTH_KEYS } from './archive-months';
import type { ArchiveDayIndex, ArchiveDocument, ArchiveRouteIndexEntry } from './archive-types';
import type { TorikumiArchiveDay } from './torikumi-data';

/**
 * Node-side snapshot of every past basho. The browser must not import this
 * module: it pulls the historical datasets into the JS bundle.
 */
export function listPastArchiveDocuments(): ArchiveDocument[] {
  return PAST_ARCHIVE_MONTH_KEYS.map((monthKey) => ({
    monthKey,
    torikumi: getTorikumiArchiveByMonthKey(monthKey),
    banzuke: getBanzukeDataByMonthKey(monthKey),
  }));
}

export function summarizeArchiveDay(day: TorikumiArchiveDay): ArchiveDayIndex {
  return {
    day: day.day,
    isoDate: day.isoDate,
    pathDate: day.pathDate,
    label: day.label,
    dayHead: day.dayHead,
    status: day.status,
    statusMessage: day.statusMessage ?? null,
  };
}

export function toArchiveRouteIndex(documents: readonly ArchiveDocument[]): ArchiveRouteIndexEntry[] {
  return documents.map((document) => ({
    monthKey: document.monthKey,
    year: document.torikumi.year,
    bashoName: document.torikumi.bashoName,
    updatedAt: document.torikumi.updatedAt,
    resultUpdatedAt: document.torikumi.resultUpdatedAt,
    scheduleUpdatedAt: document.torikumi.scheduleUpdatedAt,
    resultDays: (document.torikumi.resultDays ?? []).map(summarizeArchiveDay),
    scheduleDays: (document.torikumi.scheduleDays ?? []).map(summarizeArchiveDay),
  }));
}
