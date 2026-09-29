import {
  clearSessionCookie,
  getRawSessionToken,
  hashSessionToken,
  type AuthEnv,
} from '../../lib/auth';
import { revokeSession } from '../../lib/db';

type LogoutEnv = AuthEnv & {
  AUTH_ORIGIN?: string;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export const onRequestPost: PagesFunction<LogoutEnv> = async ({ request, env }) => {
  const expectedOrigin = env.AUTH_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get('Origin') !== expectedOrigin) return json({ error: 'forbidden' }, 403);

  const rawToken = getRawSessionToken(request);
  if (rawToken) await revokeSession(env.MY_RIKISHI_DB, await hashSessionToken(rawToken));
  return clearSessionCookie(json({ ok: true }));
};
