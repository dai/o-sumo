import { isPastArchiveMonthKey, PAST_ARCHIVE_MONTH_KEYS, type PastArchiveMonthKey } from './archive-months';
import { archiveJsonPath, isArchiveDocument, type ArchiveBanzukeDocument, type ArchiveDocument } from './archive-types';
import { juryo, makuuchiData } from './sumo-data';
import { torikumiArchive, torikumiMonthKey, type TorikumiDataSet } from './torikumi-data';

const documents = new Map<string, ArchiveDocument>();
const inflight = new Map<string, Promise<ArchiveDocument>>();
const listeners = new Set<() => void>();

function emitArchiveCache(): void {
  for (const listener of listeners) listener();
}

documents.set(torikumiMonthKey, {
  monthKey: torikumiMonthKey,
  torikumi: torikumiArchive,
  banzuke: {
    bashoName: torikumiArchive.bashoName,
    year: torikumiArchive.year,
    updatedAt: torikumiArchive.resultUpdatedAt,
    makuuchi: makuuchiData,
    juryo,
  },
});

export function subscribeArchiveCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLoadedArchiveDocument(monthKey: string): ArchiveDocument | undefined {
  return documents.get(monthKey);
}

export function getLoadedBanzuke(monthKey: string): ArchiveBanzukeDocument {
  const document = documents.get(monthKey);
  if (!document) {
    throw new Error(`Archive ${monthKey} is not loaded`);
  }
  return document.banzuke;
}

export function getLoadedTorikumi(monthKey: string): TorikumiDataSet {
  const document = documents.get(monthKey);
  if (!document) {
    throw new Error(`Archive ${monthKey} is not loaded`);
  }
  return document.torikumi;
}

export function arePastArchivesReady(): boolean {
  return PAST_ARCHIVE_MONTH_KEYS.every((monthKey) => documents.has(monthKey));
}

export function primeArchiveDocuments(next: readonly ArchiveDocument[]): void {
  for (const document of next) {
    documents.set(document.monthKey, document);
  }
  emitArchiveCache();
}

/** Drops fetched past basho so a test can observe the network path. */
export function resetPastArchiveDocumentsForTests(): void {
  for (const monthKey of PAST_ARCHIVE_MONTH_KEYS) {
    documents.delete(monthKey);
    inflight.delete(monthKey);
  }
  emitArchiveCache();
}

async function fetchArchiveDocument(monthKey: PastArchiveMonthKey): Promise<ArchiveDocument> {
  const response = await fetch(archiveJsonPath(monthKey));
  if (!response.ok) {
    throw new Error(`Archive ${monthKey} could not be loaded (${response.status})`);
  }
  const payload: unknown = await response.json();
  if (!isArchiveDocument(payload, monthKey)) {
    throw new Error(`Archive ${monthKey} payload was invalid`);
  }
  return payload;
}

export async function loadArchiveDocument(monthKey: string, options?: { force?: boolean }): Promise<ArchiveDocument> {
  if (!/^\d{6}$/.test(monthKey)) {
    throw new Error(`Unknown basho month key: ${monthKey}`);
  }
  if (options?.force) {
    documents.delete(monthKey);
    inflight.delete(monthKey);
  }
  const existing = documents.get(monthKey);
  if (existing) return existing;

  const pending = inflight.get(monthKey);
  if (pending) return pending;

  if (monthKey === torikumiMonthKey) {
    throw new Error(`Current basho ${monthKey} was not initialized`);
  }
  if (!isPastArchiveMonthKey(monthKey)) {
    throw new Error(`Unknown basho month key: ${monthKey}`);
  }

  const request = fetchArchiveDocument(monthKey).then((document) => {
    documents.set(monthKey, document);
    emitArchiveCache();
    return document;
  });
  inflight.set(monthKey, request);
  try {
    return await request;
  } finally {
    inflight.delete(monthKey);
  }
}

export function loadPastArchiveDocuments(): Promise<ArchiveDocument[]> {
  return Promise.all(PAST_ARCHIVE_MONTH_KEYS.map((monthKey) => loadArchiveDocument(monthKey)));
}
