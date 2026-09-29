import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('My Rikishi D1 migration', () => {
  it('defines isolated users, hashed sessions, and per-user rikishi rows', () => {
    const sql = readFileSync('migrations/0001_my_rikishi_auth.sql', 'utf8');
    expect(sql).toContain('UNIQUE (provider, provider_user_id)');
    expect(sql).toContain('token_hash TEXT PRIMARY KEY');
    expect(sql).toContain('PRIMARY KEY (user_id, rikishi_id)');
    expect(sql).toContain('idx_my_rikishi_user_order');
  });
});
