import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OAUTH_STATE_COOKIE,
  consumeOAuthState,
  createOAuthState,
} from '../../../../functions/lib/oauth-state';

describe('OAuth state', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-29T05:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-trips a signed state with a same-site return path', async () => {
    const created = await createOAuthState('/my-rikishi/', 'test-secret');
    const request = new Request(`https://osada.us/api/auth/callback/google?state=${created.state}`, {
      headers: { cookie: `${OAUTH_STATE_COOKIE}=${created.nonce}` },
    });

    await expect(consumeOAuthState(request, 'test-secret')).resolves.toEqual({
      nonce: created.nonce,
      returnTo: '/my-rikishi/',
    });
    expect(created.cookie).toContain('HttpOnly');
    expect(created.cookie).toContain('SameSite=Lax');
    expect(created.cookie).toContain('Secure');
  });

  it('rejects tampered, expired, missing-cookie, and external return states', async () => {
    const created = await createOAuthState('/my-rikishi/', 'test-secret');
    const tampered = `${created.state.slice(0, -1)}${created.state.endsWith('a') ? 'b' : 'a'}`;
    const request = (state: string, cookie = `${OAUTH_STATE_COOKIE}=${created.nonce}`) => new Request(
      `https://osada.us/api/auth/callback/google?state=${state}`,
      { headers: cookie ? { cookie } : undefined },
    );

    await expect(consumeOAuthState(request(tampered), 'test-secret')).resolves.toBeNull();
    await expect(consumeOAuthState(request(created.state, ''), 'test-secret')).resolves.toBeNull();

    vi.setSystemTime(new Date('2026-09-29T05:06:00.000Z'));
    await expect(consumeOAuthState(request(created.state), 'test-secret')).resolves.toBeNull();

    const external = await createOAuthState('https://evil.example/', 'test-secret');
    const externalRequest = request(external.state, `${OAUTH_STATE_COOKIE}=${external.nonce}`);
    await expect(consumeOAuthState(externalRequest, 'test-secret')).resolves.toEqual({
      nonce: external.nonce,
      returnTo: '/my-rikishi/',
    });
  });
});
