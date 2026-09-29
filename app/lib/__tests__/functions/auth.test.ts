import { describe, expect, it, vi } from 'vitest';
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createRawSessionToken,
  getSessionUser,
  hashSessionToken,
  setSessionCookie,
} from '../../../../functions/lib/auth';

function createDb(row: Record<string, unknown> | null) {
  const first = vi.fn(async () => row);
  const bind = vi.fn(() => ({ first }));
  const prepare = vi.fn(() => ({ bind }));
  return { prepare, bind, first };
}

describe('authentication helpers', () => {
  it('creates an opaque token and stores only a stable SHA-256 hash', async () => {
    const token = createRawSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    await expect(hashSessionToken(token)).resolves.toMatch(/^[a-f0-9]{64}$/);
    expect(await hashSessionToken(token)).not.toContain(token);
  });

  it('reads an unexpired session and rejects missing or expired sessions', async () => {
    const token = createRawSessionToken();
    const validDb = createDb({ id: 'user-1', display_name: 'Dai' });
    const request = new Request('https://osada.us/api/auth/session', {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });

    await expect(getSessionUser(request, { MY_RIKISHI_DB: validDb as never })).resolves.toEqual({
      id: 'user-1',
      displayName: 'Dai',
    });
    expect(validDb.bind).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/), expect.any(String));

    await expect(getSessionUser(new Request('https://osada.us/api/auth/session'), {
      MY_RIKISHI_DB: validDb as never,
    })).resolves.toBeNull();

    const expiredDb = createDb(null);
    await expect(getSessionUser(request, { MY_RIKISHI_DB: expiredDb as never })).resolves.toBeNull();
  });

  it('sets and clears a secure HttpOnly session cookie', () => {
    const response = setSessionCookie(Response.json({ ok: true }), 'raw-token', '2026-10-29T00:00:00.000Z');
    expect(response.headers.get('Set-Cookie')).toContain(`${SESSION_COOKIE}=raw-token`);
    expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    expect(response.headers.get('Set-Cookie')).toContain('SameSite=Lax');
    expect(response.headers.get('Set-Cookie')).toContain('Secure');

    const cleared = clearSessionCookie(Response.json({ ok: true }));
    expect(cleared.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });
});
