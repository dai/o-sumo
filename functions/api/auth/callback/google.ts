import {
  createRawSessionToken,
  hashSessionToken,
  sessionExpiresAt,
  setSessionCookie,
  type AuthEnv,
} from '../../../lib/auth';
import { createSession, upsertOAuthUser } from '../../../lib/db';
import { clearOAuthStateCookie, consumeOAuthState } from '../../../lib/oauth-state';

type GoogleCallbackEnv = AuthEnv & {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  AUTH_SESSION_SECRET?: string;
  AUTH_ORIGIN?: string;
};

type GoogleTokenResponse = {
  access_token?: unknown;
};

type GoogleUserInfo = {
  sub?: unknown;
  name?: unknown;
};

function redirectWithError(origin: URL, returnTo: string, error: string): Response {
  const targetUrl = new URL(returnTo, origin);
  targetUrl.searchParams.set('auth_error', error);
  const redirect = new Response(null, {
    status: 302,
    headers: {
      Location: targetUrl.toString(),
      'Cache-Control': 'no-store',
    },
  });
  return withClearedOAuthState(redirect);
}

function withClearedOAuthState(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', clearOAuthStateCookie());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequestGet: PagesFunction<GoogleCallbackEnv> = async ({ request, env }) => {
  const callbackUrl = new URL(request.url);
  let origin: URL;
  try {
    origin = new URL(env.AUTH_ORIGIN || callbackUrl.origin);
  } catch {
    origin = new URL(callbackUrl.origin);
  }

  if (!env.GOOGLE_CLIENT_ID
    || !env.GOOGLE_CLIENT_SECRET
    || !env.AUTH_SESSION_SECRET
    || !env.AUTH_ORIGIN) {
    return redirectWithError(origin, '/', 'auth_unavailable');
  }

  if (callbackUrl.searchParams.has('error')) {
    const state = await consumeOAuthState(request, env.AUTH_SESSION_SECRET);
    const returnTo = state?.returnTo ?? '/';
    return redirectWithError(origin, returnTo, callbackUrl.searchParams.get('error') || 'oauth_denied');
  }

  const code = callbackUrl.searchParams.get('code');
  const state = await consumeOAuthState(request, env.AUTH_SESSION_SECRET);
  if (!code || !state) return redirectWithError(origin, state?.returnTo ?? '/', 'invalid_oauth_callback');

  const redirectUri = new URL('/api/auth/callback/google', origin).toString();
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenResponse.ok) return redirectWithError(origin, state.returnTo, 'oauth_exchange_failed');

  const tokenBody = await tokenResponse.json() as GoogleTokenResponse;
  if (typeof tokenBody.access_token !== 'string' || !tokenBody.access_token) {
    return redirectWithError(origin, state.returnTo, 'oauth_exchange_failed');
  }

  const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });
  if (!userInfoResponse.ok) return redirectWithError(origin, state.returnTo, 'oauth_profile_failed');

  const profile = await userInfoResponse.json() as GoogleUserInfo;
  if (typeof profile.sub !== 'string' || !profile.sub || profile.sub.length > 255) {
    return redirectWithError(origin, state.returnTo, 'oauth_profile_failed');
  }
  const displayName = typeof profile.name === 'string' && profile.name.trim()
    ? profile.name.trim().slice(0, 100)
    : 'o-sumo user';

  const user = await upsertOAuthUser(env.MY_RIKISHI_DB, 'google', profile.sub, displayName);
  const rawToken = createRawSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  const expiresAt = sessionExpiresAt(env);
  await createSession(env.MY_RIKISHI_DB, tokenHash, user.id, expiresAt);

  const redirect = new Response(null, {
    status: 302,
    headers: {
      Location: new URL(state.returnTo, origin).toString(),
      'Cache-Control': 'no-store',
    },
  });
  return withClearedOAuthState(setSessionCookie(redirect, rawToken, expiresAt));
};
