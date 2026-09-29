import { describe, expect, it, vi } from 'vitest';
import { mergeMyRikishiIds, remoteMyRikishiStore } from './my-rikishi-store';

describe('my rikishi synchronization', () => {
  it('merges device and account ids in stable order without duplicates', () => {
    expect(mergeMyRikishiIds([3, 1], [1, 2])).toEqual({ ids: [3, 1, 2], truncated: false });
  });

  it('reports when a merge exceeds the 20-rikishi limit', () => {
    const local = Array.from({ length: 20 }, (_, index) => index + 1);
    expect(mergeMyRikishiIds(local, [21])).toEqual({ ids: local, truncated: true });
  });

  it('loads and replaces account ids with same-origin credentials', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ ids: [1, 2] }))
      .mockResolvedValueOnce(Response.json({ ids: [2, 3] }));

    await expect(remoteMyRikishiStore(fetchMock).load()).resolves.toEqual([1, 2]);
    await expect(remoteMyRikishiStore(fetchMock).replace([2, 3])).resolves.toEqual([2, 3]);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/my-rikishi', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/my-rikishi', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ids: [2, 3] }),
    });
  });

  it('surfaces a failed account request without changing local data', async () => {
    const store = remoteMyRikishiStore(vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(store.load()).rejects.toThrow('my_rikishi_request_failed');
  });
});
