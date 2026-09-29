export const MY_RIKISHI_MAX_COUNT = 20;

type Fetch = typeof fetch;

export type MyRikishiStore = {
  load: () => Promise<number[]>;
  replace: (ids: number[]) => Promise<number[]>;
  remove: (id: number) => Promise<number[]>;
};

export function normalizeMyRikishiIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter((id): id is number => Number.isInteger(id) && id > 0)
    .slice(0, MY_RIKISHI_MAX_COUNT);
}

export function parseMyRikishiIds(serialized: string | null): number[] {
  if (!serialized) return [];
  try {
    return normalizeMyRikishiIds(JSON.parse(serialized));
  } catch {
    return [];
  }
}

export function mergeMyRikishiIds(
  localIds: number[],
  remoteIds: number[],
): { ids: number[]; truncated: boolean } {
  const unique = [...new Set([...localIds, ...remoteIds])]
    .filter((id): id is number => Number.isInteger(id) && id > 0);
  return {
    ids: unique.slice(0, MY_RIKISHI_MAX_COUNT),
    truncated: unique.length > MY_RIKISHI_MAX_COUNT,
  };
}

function readIds(value: unknown): number[] {
  if (!value || typeof value !== 'object' || !('ids' in value)) {
    throw new Error('my_rikishi_response_invalid');
  }
  const ids = (value as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) throw new Error('my_rikishi_response_invalid');
  return normalizeMyRikishiIds(ids);
}

export function remoteMyRikishiStore(fetcher: Fetch = fetch): MyRikishiStore {
  return {
    async load(): Promise<number[]> {
      const response = await fetcher('/api/my-rikishi', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('my_rikishi_request_failed');
      return readIds(await response.json());
    },
    async replace(ids: number[]): Promise<number[]> {
      const normalized = normalizeMyRikishiIds(ids);
      const response = await fetcher('/api/my-rikishi', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ids: normalized }),
      });
      if (!response.ok) throw new Error('my_rikishi_request_failed');
      return readIds(await response.json());
    },
    async remove(id: number): Promise<number[]> {
      const response = await fetcher(`/api/my-rikishi/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('my_rikishi_request_failed');
      return this.load();
    },
  };
}
