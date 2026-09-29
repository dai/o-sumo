import { getSessionUser, type AuthEnv } from '../../lib/auth';

export const onRequestGet: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);
  return Response.json(user
    ? { authenticated: true, user }
    : { authenticated: false }, {
    headers: { 'Cache-Control': 'no-store' },
  });
};
