import { createOAuthState } from '../../lib/oauth-state';

type GoogleAuthStartEnv = {
  GOOGLE_CLIENT_ID?: string;
  AUTH_SESSION_SECRET?: string;
  AUTH_ORIGIN?: string;
};

function unavailable(): Response {
  return Response.json({ error: 'auth_unavailable' }, {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const onRequestGet: PagesFunction<GoogleAuthStartEnv> = async ({ request, env }) => {
  if (!env.GOOGLE_CLIENT_ID || !env.AUTH_SESSION_SECRET || !env.AUTH_ORIGIN) return unavailable();

  let origin: URL;
  try {
    origin = new URL(env.AUTH_ORIGIN);
  } catch {
    return unavailable();
  }

  const returnTo = new URL(request.url).searchParams.get('returnTo') ?? '/my-rikishi/';
  const { state, cookie } = await createOAuthState(returnTo, env.AUTH_SESSION_SECRET);
  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizationUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set('redirect_uri', new URL('/api/auth/callback/google', origin).toString());
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid profile');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('prompt', 'select_account');

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl.toString(),
      'Set-Cookie': cookie,
      'Cache-Control': 'no-store',
    },
  });
};
