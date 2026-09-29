/// <reference types="@cloudflare/workers-types" />

import { getSessionUser, type AuthEnv, type AuthUser } from '../lib/auth';
import {
  MY_RIKISHI_MAX_COUNT,
  listMyRikishi,
  normalizeMyRikishiIds,
  replaceMyRikishi,
} from '../lib/db';

type MyRikishiEnv = AuthEnv & {
  AUTH_ORIGIN?: string;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isSameOrigin(request: Request, env: MyRikishiEnv): boolean {
  const expected = env.AUTH_ORIGIN ?? new URL(request.url).origin;
  return request.headers.get('Origin') === expected;
}

export async function handleMyRikishiRequest(
  request: Request,
  env: MyRikishiEnv,
  user: AuthUser | null,
): Promise<Response> {
  if (!user) return json({ error: 'unauthorized' }, 401);

  if (request.method === 'GET') {
    return json({ ids: await listMyRikishi(env.MY_RIKISHI_DB, user.id) });
  }

  if (request.method === 'PUT') {
    if (!isSameOrigin(request, env)) return json({ error: 'forbidden' }, 403);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }
    const ids = typeof body === 'object' && body !== null && 'ids' in body
      ? (body as { ids?: unknown }).ids
      : undefined;
    if (!Array.isArray(ids)
      || ids.length > MY_RIKISHI_MAX_COUNT
      || ids.some((id) => !Number.isInteger(id) || Number(id) <= 0)) {
      return json({ error: 'invalid_ids' }, 400);
    }
    const normalized = normalizeMyRikishiIds(ids);
    return json({ ids: await replaceMyRikishi(env.MY_RIKISHI_DB, user.id, normalized) });
  }

  return new Response(null, { status: 405, headers: { Allow: 'GET, PUT', 'Cache-Control': 'no-store' } });
}

export const onRequest: PagesFunction<MyRikishiEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);
  return handleMyRikishiRequest(request, env, user);
};
