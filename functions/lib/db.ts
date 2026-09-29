/// <reference types="@cloudflare/workers-types" />

export const MY_RIKISHI_MAX_COUNT = 20;

type UserRow = {
  id: string;
  display_name: string;
};

type RikishiRow = {
  rikishi_id: number;
  sort_order: number;
};

export function normalizeMyRikishiIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter((id): id is number => Number.isInteger(id) && id > 0)
    .slice(0, MY_RIKISHI_MAX_COUNT);
}

export async function upsertOAuthUser(
  db: D1Database,
  provider: string,
  providerUserId: string,
  displayName: string,
): Promise<UserRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = await db.prepare(
    `INSERT INTO users (id, provider, provider_user_id, display_name, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?5)
     ON CONFLICT(provider, provider_user_id) DO UPDATE SET
       display_name = excluded.display_name,
       updated_at = excluded.updated_at
     RETURNING id, display_name`,
  ).bind(id, provider, providerUserId, displayName, now).first<UserRow>();
  if (!row) throw new Error('OAuth user upsert returned no row');
  return row;
}

export async function createSession(
  db: D1Database,
  tokenHash: string,
  userId: string,
  expiresAt: string,
): Promise<void> {
  await db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
     VALUES (?1, ?2, ?3, ?4)`,
  ).bind(tokenHash, userId, expiresAt, new Date().toISOString()).run();
}

export async function revokeSession(db: D1Database, tokenHash: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run();
}

export async function listMyRikishi(db: D1Database, userId: string): Promise<number[]> {
  const result = await db.prepare(
    `SELECT rikishi_id, sort_order
       FROM my_rikishi
      WHERE user_id = ?1
      ORDER BY sort_order ASC`,
  ).bind(userId).all<RikishiRow>();
  return result.results.map((row) => row.rikishi_id);
}

export async function replaceMyRikishi(
  db: D1Database,
  userId: string,
  value: unknown,
): Promise<number[]> {
  const ids = normalizeMyRikishiIds(value);
  const now = new Date().toISOString();
  const statements: D1PreparedStatement[] = [
    db.prepare('DELETE FROM my_rikishi WHERE user_id = ?1').bind(userId),
    ...ids.map((rikishiId, sortOrder) => db.prepare(
      `INSERT INTO my_rikishi (user_id, rikishi_id, sort_order, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?4)`,
    ).bind(userId, rikishiId, sortOrder, now)),
  ];
  await db.batch(statements);
  return ids;
}

export async function deleteMyRikishi(db: D1Database, userId: string, rikishiId: number): Promise<void> {
  await db.prepare(
    'DELETE FROM my_rikishi WHERE user_id = ?1 AND rikishi_id = ?2',
  ).bind(userId, rikishiId).run();
}
