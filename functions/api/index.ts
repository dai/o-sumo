/**
 * Cloudflare Pages Function that serves `GET /api` (and `/api/`).
 *
 * Returns a JSON directory of the public API endpoints so AI agents
 * and validators see `Content-Type: application/json` rather than
 * the SPA 404 HTML fallback. The richer RFC 9727 linkset lives at
 * `/.well-known/api-catalog`.
 *
 * Routing: `functions/api/index.ts` matches `/api` and `/api/`.
 * The `_middleware.ts` `NON_SPA_PREFIXES` already excludes `/api/`
 * from the SPA trailing-slash rewrite, and bare `/api` is not in
 * `SPA_ROUTE_PATTERNS`, so this handler always wins over the SPA
 * fallback.
 */

import { withX402Payment } from '../lib/x402';

const API_DIRECTORY = {
  name: 'o-sumo public API',
  version: '1.0.0',
  description:
    'Public JSON endpoints for o-sumo. See /.well-known/api-catalog for the RFC 9727 linkset.',
  endpoints: {
    v1: {
      banzuke: '/api/v1/banzuke.json',
      torikumi: '/api/v1/torikumi.json',
      rikishi: '/api/v1/rikishi.json',
      gyoji: '/api/v1/gyoji.json',
      yobidashi: '/api/v1/yobidashi.json',
    },
  },
  discovery: {
    api_catalog: '/.well-known/api-catalog',
    agent_card: '/.well-known/agent-card.json',
    agent_skills: '/.well-known/agent-skills/index.json',
    acp: '/.well-known/acp.json',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleGetDirectory = async (_context: any): Promise<Response> => {
  return Response.json(API_DIRECTORY, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const onRequestGet = withX402Payment(handleGetDirectory, {
  resourcePath: '/api',
  description: 'o-sumo public API endpoints directory',
  exampleOutput: API_DIRECTORY,
});

export const onRequest = onRequestGet;