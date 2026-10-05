/**
 * Cloudflare Pages Function that serves `GET /api/v1` (and `/api/v1/`).
 *
 * Returns a JSON directory of the v1 endpoints so AI agents and
 * validators see `Content-Type: application/json` rather than the
 * SPA 404 HTML fallback. The actual v1 JSON resources are served as
 * static files from `public/api/v1/*.json`.
 *
 * Routing: `functions/api/v1/index.ts` matches `/api/v1` and
 * `/api/v1/`. The `_middleware.ts` `NON_SPA_PREFIXES` already excludes
 * `/api/` from the SPA trailing-slash rewrite, and bare `/api/v1` is
 * not in `SPA_ROUTE_PATTERNS`, so this handler always wins over the
 * SPA fallback.
 */

const V1_DIRECTORY = {
  name: 'o-sumo public API v1',
  version: '1.0.0',
  description:
    'v1 JSON endpoints for o-sumo. Each resource is served as a static .json file.',
  resources: [
    { path: '/api/v1/banzuke.json', description: 'Banzuke data (current and historical)' },
    { path: '/api/v1/torikumi.json', description: 'Torikumi data (current and historical)' },
    { path: '/api/v1/rikishi.json', description: 'Rikishi profile index' },
    { path: '/api/v1/gyoji.json', description: 'Gyoji (referee) profile index' },
    { path: '/api/v1/yobidashi.json', description: 'Yobidashi (announcer) profile index' },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (_context: any): Promise<Response> => {
  return Response.json(V1_DIRECTORY, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const onRequest = onRequestGet;