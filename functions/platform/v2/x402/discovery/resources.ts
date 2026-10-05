/**
 * Cloudflare Pages Function that serves the x402 Bazaar discovery
 * document at `/platform/v2/x402/discovery/resources`.
 *
 * Returns an array of x402-discoverable resources and their payment
 * configurations per the Bazaar extension specification.
 *
 * Spec:
 *   - https://x402.org
 *   - https://docs.x402.org/extensions/bazaar/
 */

import { buildX402PaymentRequiredPayload } from '../../../../lib/x402';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (context: any): Promise<Response> => {
  const requestUrl = new URL(context.request.url);

  const apiPayload = buildX402PaymentRequiredPayload(
    requestUrl,
    {
      resourcePath: '/api',
      description: 'o-sumo public API endpoints directory',
    },
    context.env,
  );

  const apiV1Payload = buildX402PaymentRequiredPayload(
    requestUrl,
    {
      resourcePath: '/api/v1',
      description: 'o-sumo v1 public API endpoints directory',
    },
    context.env,
  );

  const resources = [
    {
      resource: apiPayload.resource.url,
      type: 'http',
      x402Version: apiPayload.x402Version,
      serviceName: 'o-sumo public API',
      description: apiPayload.resource.description,
      accepts: apiPayload.accepts,
      extensions: apiPayload.extensions,
    },
    {
      resource: apiV1Payload.resource.url,
      type: 'http',
      x402Version: apiV1Payload.x402Version,
      serviceName: 'o-sumo public API v1',
      description: apiV1Payload.resource.description,
      accepts: apiV1Payload.accepts,
      extensions: apiV1Payload.extensions,
    },
  ];

  return Response.json(resources, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
};

export const onRequest = onRequestGet;