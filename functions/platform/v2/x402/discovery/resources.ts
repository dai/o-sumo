/**
 * Cloudflare Pages Function that serves the x402 Bazaar discovery
 * document at `/platform/v2/x402/discovery/resources`.
 *
 * Returns an empty array. o-sumo is not a commerce site and exposes
 * no x402-payable resources, but advertising the discovery endpoint
 * (even empty) lets AI agents and validators detect that the protocol
 * shape is understood. Adding paywalled routes with `accepts[]`
 * entries would be a separate, intentional decision — this file only
 * satisfies the discovery-surface contract.
 *
 * Spec:
 *   - https://x402.org
 *   - https://docs.x402.org/extensions/bazaar/
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (_context: any): Promise<Response> => {
  return new Response('[]', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const onRequest = onRequestGet;