/// <reference types="@cloudflare/workers-types" />

import { getSessionUser, type AuthEnv } from '../../lib/auth';
import { deleteMyRikishi } from '../../lib/db';

type DeleteEnv = AuthEnv & { AUTH_ORIGIN?: string };

export const onRequestDelete: PagesFunction<DeleteEnv, 'id'> = async ({ request, env, params }) => {
  const expectedOrigin = env.AUTH_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get('Origin') !== expectedOrigin) {
    return Response.json({ error: 'forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const user = await getSessionUser(request, env);
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: 'invalid_id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  await deleteMyRikishi(env.MY_RIKISHI_DB, user.id, id);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
