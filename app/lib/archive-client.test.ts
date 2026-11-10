import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getLoadedArchiveDocument,
  loadArchiveDocument,
  resetPastArchiveDocumentsForTests,
} from './archive-client';
import { primeCommittedArchives, readCommittedArchiveDocuments } from '../test/prime-archives';

afterEach(() => {
  vi.unstubAllGlobals();
  resetPastArchiveDocumentsForTests();
  primeCommittedArchives();
});

describe('archive client', () => {
  it('keeps the current basho in memory without a network fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const current = getLoadedArchiveDocument('202611');
    expect(current?.torikumi.bashoName).toBe('十一月場所');
    await loadArchiveDocument('202611');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches a past basho JSON once and caches it', async () => {
    resetPastArchiveDocumentsForTests();
    const [september] = readCommittedArchiveDocuments().filter((document) => document.monthKey === '202609');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => september,
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await loadArchiveDocument('202609');
    const second = await loadArchiveDocument('202609');
    expect(first.torikumi.bashoName).toBe('九月場所');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/api/v1/archive/202609.json');
  });

  it('rejects an unknown month key', async () => {
    await expect(loadArchiveDocument('209912')).rejects.toThrow(/Unknown basho month key/);
  });
});
