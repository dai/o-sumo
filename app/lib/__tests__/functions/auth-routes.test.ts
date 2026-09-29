import { afterEach, describe, expect, it, vi } from 'vitest';
import { OAUTH_STATE_COOKIE, createOAuthState } from '../../../../functions/lib/oauth-state';
import { onRequestGet as startGoogle } from '../../../../functions/api/auth/google';
import { onRequestGet as callbackGoogle } from '../../../../functions/api/auth/callback/google';
import { onRequestGet as getSession } from '../../../../functions/api/auth/session';
import { onRequestPost as logout } from '../../../../functions/api/auth/logout';

function context(request: Request, env: Record<string, unknown>) {
  return { request, env, params: {}, data: {}, functionPath: '', waitUntil: vi.fn(), next: vi.fn() } as never;
}

function callbackDb() {
  const prepare = vi.fn((sql: string) => {
    const statement = {
      bind: vi.fn(() => statement),
      first: vi.fn(async () => sql.includes('INSERT INTO users') ? { id: 'user-1', display_name: 'Dai' } : null),
      run: vi.fn(async () => ({ success: true })),
    };
    return statement;
  });
  return { prepare, batch: vi.fn() };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Google OAuth routes', () => {
  it('starts Google login with signed state and the configured callback', async () => {
    const response = await startGoogle(context(
      new Request('https://osada.us/api/auth/google?returnTo=/my-rikishi/'),
      {
        GOOGLE_CLIENT_ID: 'client-id',
        AUTH_SESSION_SECRET: 'secret',
        AUTH_ORIGIN: 'https://osada.us',
      },
    ));
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('Location')!);
    expect(location.origin).toBe('https://accounts.google.com');
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('redirect_uri')).toBe('https://osada.us/api/auth/callback/google');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(response.headers.get('Set-Cookie')).toContain(OAUTH_STATE_COOKIE);
  });

  it('rejects callback errors and invalid state without creating a session', async () => {
    const env = {
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      AUTH_SESSION_SECRET: 'secret',
      AUTH_ORIGIN: 'https://osada.us',
      MY_RIKISHI_DB: callbackDb(),
    };
    const providerError = await callbackGoogle(context(
      new Request('https://osada.us/api/auth/callback/google?error=access_denied'),
      env,
    ));
    expect(providerError.status).toBe(400);

    const invalid = await callbackGoogle(context(
      new Request('https://osada.us/api/auth/callback/google?code=x&state=invalid'),
      env,
    ));
    expect(invalid.status).toBe(400);
    expect(env.MY_RIKISHI_DB.prepare).not.toHaveBeenCalled();
  });

  it('creates a hashed session after a valid Google callback', async () => {
    const created = await createOAuthState('/my-rikishi/', 'secret');
    const db = callbackDb();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'provider-token', token_type: 'Bearer' }))
      .mockResolvedValueOnce(Response.json({ sub: 'google-user-1', name: 'Dai' }));
    vi.stubGlobal('fetch', fetchMock);
    const request = new Request(
      `https://osada.us/api/auth/callback/google?code=one-time-code&state=${created.state}`,
      { headers: { cookie: `${OAUTH_STATE_COOKIE}=${created.nonce}` } },
    );
    const response = await callbackGoogle(context(request, {
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      AUTH_SESSION_SECRET: 'secret',
      AUTH_ORIGIN: 'https://osada.us',
      MY_RIKISHI_DB: db,
    }));

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://osada.us/my-rikishi/');
    expect(response.headers.get('Set-Cookie')).toContain('o_sumo_session=');
    expect(JSON.stringify(db.prepare.mock.calls)).not.toContain('provider-token');
  });

  it('reports an unauthenticated session without a cookie', async () => {
    const response = await getSession(context(
      new Request('https://osada.us/api/auth/session'),
      { MY_RIKISHI_DB: callbackDb() },
    ));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('revokes the current session and clears its cookie on same-origin logout', async () => {
    const db = callbackDb();
    const response = await logout(context(
      new Request('https://osada.us/api/auth/logout', {
        method: 'POST',
        headers: { origin: 'https://osada.us', cookie: 'o_sumo_session=raw-token' },
      }),
      { MY_RIKISHI_DB: db, AUTH_ORIGIN: 'https://osada.us' },
    ));
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
    expect(db.prepare).toHaveBeenCalledWith('DELETE FROM sessions WHERE token_hash = ?1');
  });

  it('rejects cross-origin logout without revoking a session', async () => {
    const db = callbackDb();
    const response = await logout(context(
      new Request('https://osada.us/api/auth/logout', {
        method: 'POST',
        headers: { origin: 'https://evil.example', cookie: 'o_sumo_session=raw-token' },
      }),
      { MY_RIKISHI_DB: db, AUTH_ORIGIN: 'https://osada.us' },
    ));
    expect(response.status).toBe(403);
    expect(db.prepare).not.toHaveBeenCalled();
  });
});
