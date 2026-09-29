import { describe, expect, it, vi } from 'vitest';
import { handleMyRikishiRequest } from '../../../../functions/api/my-rikishi';

function createDb(remoteIds: number[] = []) {
  const rows = remoteIds.map((rikishi_id, sort_order) => ({ rikishi_id, sort_order }));
  const prepare = vi.fn((_sql: string) => {
    const statement = {
      bind: vi.fn(() => statement),
      all: vi.fn(async () => ({ results: rows })),
      run: vi.fn(async () => ({ success: true })),
    };
    return statement;
  });
  return { prepare, batch: vi.fn(async () => []) } as never;
}

describe('My Rikishi API', () => {
  it('returns 401 without an authenticated user', async () => {
    const response = await handleMyRikishiRequest(
      new Request('https://osada.us/api/my-rikishi'),
      { MY_RIKISHI_DB: createDb() },
      null,
    );
    expect(response.status).toBe(401);
  });

  it('returns the authenticated user rows', async () => {
    const response = await handleMyRikishiRequest(
      new Request('https://osada.us/api/my-rikishi'),
      { MY_RIKISHI_DB: createDb([1, 2]) },
      { id: 'user-a', displayName: 'A' },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ids: [1, 2] });
  });

  it('rejects cross-origin writes, malformed JSON, and more than 20 IDs', async () => {
    const request = (body: string, origin = 'https://osada.us') => new Request('https://osada.us/api/my-rikishi', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', origin },
      body,
    });
    const user = { id: 'user-a', displayName: 'A' };
    const env = { MY_RIKISHI_DB: createDb() };

    expect((await handleMyRikishiRequest(request('{}', 'https://evil.example'), env, user)).status).toBe(403);
    expect((await handleMyRikishiRequest(request('{invalid'), env, user)).status).toBe(400);
    expect((await handleMyRikishiRequest(request(JSON.stringify({ ids: Array.from({ length: 21 }, (_, i) => i + 1) })), env, user)).status).toBe(400);
  });

  it('normalizes valid writes and rejects unsupported methods', async () => {
    const user = { id: 'user-a', displayName: 'A' };
    const env = { MY_RIKISHI_DB: createDb() };
    const put = new Request('https://osada.us/api/my-rikishi', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', origin: 'https://osada.us' },
      body: JSON.stringify({ ids: [3, 3, 4] }),
    });
    const putResponse = await handleMyRikishiRequest(put, env, user);
    expect(putResponse.status).toBe(200);
    await expect(putResponse.json()).resolves.toEqual({ ids: [3, 4] });

    const post = await handleMyRikishiRequest(
      new Request('https://osada.us/api/my-rikishi', { method: 'POST' }),
      env,
      user,
    );
    expect(post.status).toBe(405);
  });
});
