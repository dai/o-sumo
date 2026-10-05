/**
 * x402 Payment Protocol middleware and discovery helpers for Cloudflare Pages Functions.
 *
 * Implements the x402 v2 protocol specification (HTTP transport):
 * - Responds with HTTP 402 Payment Required when payment authorization is absent
 * - Encodes payment requirements into the `Payment-Required` header (Base64 JSON) and JSON body
 * - Advertises the Bazaar discovery extension with input/output schema for AI agents
 * - Allows authenticated requests carrying `PAYMENT-SIGNATURE` or `X-PAYMENT`
 *
 * Specification:
 * - Protocol: https://x402.org
 * - GitHub: https://github.com/coinbase/x402 (and https://github.com/x402-foundation/x402)
 * - Bazaar extension: https://docs.x402.org/extensions/bazaar/
 */

export const DEFAULT_X402_NETWORK = 'eip155:8453'; // Base Mainnet
export const DEFAULT_X402_ASSET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
export const DEFAULT_X402_WALLET = '0x0000000000000000000000000000000000000000';
export const DEFAULT_X402_FACILITATOR_URL = 'https://api.cdp.coinbase.com/platform/v2/x402';

export interface X402Accepts {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface X402BazaarInfo {
  input: {
    method: string;
    type: string;
    queryParams?: Record<string, unknown>;
  };
  output: {
    type: string;
    example?: Record<string, unknown>;
  };
}

export interface X402BazaarExtension {
  info: X402BazaarInfo;
  schema?: Record<string, unknown>;
}

export interface X402Resource {
  url: string;
  description: string;
  mimeType: string;
}

export interface X402PaymentRequiredPayload {
  x402Version: number;
  error: string;
  resource: X402Resource;
  accepts: X402Accepts[];
  extensions: {
    bazaar: X402BazaarExtension;
    [key: string]: unknown;
  };
}

export interface X402RouteOptions {
  resourcePath: string;
  description: string;
  amount?: string;
  exampleOutput?: Record<string, unknown>;
}

export function resolveWalletAddress(env?: Record<string, unknown>): string {
  if (env && typeof env.X402_WALLET_ADDRESS === 'string' && env.X402_WALLET_ADDRESS.trim().length > 0) {
    return env.X402_WALLET_ADDRESS.trim();
  }
  return DEFAULT_X402_WALLET;
}

export function resolveFacilitatorUrl(env?: Record<string, unknown>): string {
  if (env && typeof env.X402_FACILITATOR_URL === 'string' && env.X402_FACILITATOR_URL.trim().length > 0) {
    return env.X402_FACILITATOR_URL.trim();
  }
  return DEFAULT_X402_FACILITATOR_URL;
}

export function buildX402PaymentRequiredPayload(
  requestUrl: URL,
  options: X402RouteOptions,
  env?: Record<string, unknown>,
): X402PaymentRequiredPayload {
  const payTo = resolveWalletAddress(env);
  const resourceUrl = new URL(options.resourcePath, requestUrl.origin).href;

  return {
    x402Version: 2,
    error: 'Payment required',
    resource: {
      url: resourceUrl,
      description: options.description,
      mimeType: 'application/json',
    },
    accepts: [
      {
        scheme: 'exact',
        network: DEFAULT_X402_NETWORK,
        amount: options.amount || '1000', // 0.001 USDC (6 decimals)
        asset: DEFAULT_X402_ASSET,
        payTo,
        maxTimeoutSeconds: 3600,
        extra: {
          name: 'USD Coin',
          version: '2',
        },
      },
    ],
    extensions: {
      bazaar: {
        info: {
          input: {
            method: 'GET',
            type: 'http',
          },
          output: {
            type: 'json',
            example: options.exampleOutput || {},
          },
        },
        schema: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          properties: {
            input: {
              additionalProperties: false,
              properties: {
                method: {
                  enum: ['GET'],
                  type: 'string',
                },
                type: {
                  const: 'http',
                  type: 'string',
                },
              },
              required: ['type', 'method'],
              type: 'object',
            },
            output: {
              properties: {
                example: {
                  type: 'object',
                },
                type: {
                  type: 'string',
                },
              },
              required: ['type'],
              type: 'object',
            },
          },
          required: ['input'],
          type: 'object',
        },
      },
    },
  };
}

export function hasPaymentSignature(request: Request): boolean {
  return (
    request.headers.has('PAYMENT-SIGNATURE') ||
    request.headers.has('payment-signature') ||
    request.headers.has('X-PAYMENT') ||
    request.headers.has('x-payment')
  );
}

export function encodeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function createX402PaymentRequiredResponse(
  requestUrl: URL,
  options: X402RouteOptions,
  env?: Record<string, unknown>,
): Response {
  const payload = buildX402PaymentRequiredPayload(requestUrl, options, env);
  const jsonString = JSON.stringify(payload, null, 2);
  const base64Header = encodeBase64(JSON.stringify(payload));

  return new Response(jsonString, {
    status: 402,
    statusText: 'Payment Required',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Payment-Required': base64Header,
      'PAYMENT-REQUIRED': base64Header,
    },
  });
}


/**
 * Higher-order Pages Function handler applying x402 payment protection.
 */
export function withX402Payment(
  handler: (context: any) => Promise<Response>,
  options: X402RouteOptions,
): (context: any) => Promise<Response> {
  return async (context: any): Promise<Response> => {
    const request: Request = context.request;
    if (hasPaymentSignature(request)) {
      return handler(context);
    }

    const requestUrl = new URL(request.url);
    return createX402PaymentRequiredResponse(requestUrl, options, context.env);
  };
}
