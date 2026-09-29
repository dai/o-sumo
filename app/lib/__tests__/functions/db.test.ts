import { describe, expect, it, vi } from 'vitest';
import {
  deleteMyRikishi,
  listMyRikishi,
  replaceMyRikishi,
} from '../../../../functions/lib/db';

function createDb(rows: Array<{ rikishi_id: number; sort_order: number }> = []) {
  const prepared: Array<{ sql: string; args: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => {
    const entry = { sql, args: [] as unknown[] };
    prepared.push(entry);
    const statement = {
      bind: (...args: unknown[]) => {
        entry.args = args;
        return statement;
      },
      all: async () => ({ results: rows }),
      run: async () => ({ success: true }),
    };
    return statement;
  });
  const batch = vi.fn(async () => []);
  return { db: { prepare, batch } as never, prepared, batch };
}

describe('D1 My Rikishi queries', () => {
  it('lists only rows bound to the authenticated user', async () => {
    const { db, prepared } = createDb([{ rikishi_id: 2, sort_order: 0 }, { rikishi_id: 9, sort_order: 1 }]);
    await expect(listMyRikishi(db, 'user-a')).resolves.toEqual([2, 9]);
    expect(prepared[0].sql).toContain('WHERE user_id = ?1');
    expect(prepared[0].args).toEqual(['user-a']);
  });

  it('replaces rows in one batch and enforces normalized IDs', async () => {
    const { db, prepared, batch } = createDb();
    const ids = await replaceMyRikishi(db, 'user-a', [3, 3, -1, 4]);
    expect(ids).toEqual([3, 4]);
    expect(batch).toHaveBeenCalledTimes(1);
    expect(prepared[0].args).toEqual(['user-a']);
    expect(prepared.slice(1).map((entry) => entry.args.slice(0, 3))).toEqual([
      ['user-a', 3, 0],
      ['user-a', 4, 1],
    ]);
  });

  it('deletes by both user and rikishi ID', async () => {
    const { db, prepared } = createDb();
    await deleteMyRikishi(db, 'user-b', 42);
    expect(prepared[0].sql).toContain('user_id = ?1');
    expect(prepared[0].args).toEqual(['user-b', 42]);
  });
});
