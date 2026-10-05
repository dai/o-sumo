import { describe, expect, it } from 'vitest';
import {
  DEFAULT_X402_ASSET,
  DEFAULT_X402_FACILITATOR_URL,
  DEFAULT_X402_NETWORK,
  DEFAULT_X402_WALLET,
  buildX402PaymentRequiredPayload,
  createX402PaymentRequiredResponse,
  decodeBase64,
  hasPaymentSignature,
  resolveFacilitatorUrl,
  resolveWalletAddress,
  withX402Payment,
} from '../../../../functions/lib/x402';

describe('x402 Payment Protocol library', () => {
  describe('configuration resolution', () => {
    it('uses default wallet when env is unset', () => {
      expect(resolveWalletAddress({})).toBe(DEFAULT_X402_WALLET);
      expect(resolveWalletAddress(undefined)).toBe(DEFAULT_X402_WALLET);
    });

    it('uses env wallet when configured', () => {
      const customWallet = '0x1111111111111111111111111111111111111111';
      expect(resolveWalletAddress({ X402_WALLET_ADDRESS: customWallet })).toBe(customWallet);
    });

    it('uses default facilitator URL when env is unset', () => {
      expect(resolveFacilitatorUrl({})).toBe(DEFAULT_X402_FACILITATOR_URL);
    });

    it('uses env facilitator URL when configured', () => {
      const customFacilitator = 'https://custom-facilitator.example.com';
      expect(resolveFacilitatorUrl({ X402_FACILITATOR_URL: customFacilitator })).toBe(customFacilitator);
    });
  });

  describe('buildX402PaymentRequiredPayload', () => {
    it('constructs a valid x402 v2 payload with Bazaar extension', () => {
      const url = new URL('https://osada.us/api');
      const payload = buildX402PaymentRequiredPayload(url, {
        resourcePath: '/api',
        description: 'o-sumo API',
        exampleOutput: { ok: true },
      });

      expect(payload.x402Version).toBe(2);
      expect(payload.error).toBe('Payment required');
      expect(payload.resource.url).toBe('https://osada.us/api');
      expect(payload.resource.mimeType).toBe('application/json');

      expect(payload.accepts).toHaveLength(1);
      const accept = payload.accepts[0];
      expect(accept.scheme).toBe('exact');
      expect(accept.network).toBe(DEFAULT_X402_NETWORK);
      expect(accept.asset).toBe(DEFAULT_X402_ASSET);
      expect(accept.amount).toBe('1000');
      expect(accept.payTo).toBe(DEFAULT_X402_WALLET);
      expect(accept.extra?.name).toBe('USD Coin');
      expect(accept.extra?.version).toBe('2');

      expect(payload.extensions.bazaar).toBeDefined();
      expect(payload.extensions.bazaar.info.input.method).toBe('GET');
      expect(payload.extensions.bazaar.info.input.type).toBe('http');
      expect(payload.extensions.bazaar.info.output.example).toEqual({ ok: true });
      expect(payload.extensions.bazaar.schema?.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    });
  });

  describe('hasPaymentSignature', () => {
    it('detects PAYMENT-SIGNATURE header in various casings', () => {
      const reqUpper = new Request('https://osada.us/api', {
        headers: { 'PAYMENT-SIGNATURE': 'sig' },
      });
      expect(hasPaymentSignature(reqUpper)).toBe(true);

      const reqLower = new Request('https://osada.us/api', {
        headers: { 'payment-signature': 'sig' },
      });
      expect(hasPaymentSignature(reqLower)).toBe(true);
    });

    it('detects legacy X-PAYMENT header', () => {
      const req = new Request('https://osada.us/api', {
        headers: { 'X-PAYMENT': 'sig' },
      });
      expect(hasPaymentSignature(req)).toBe(true);
    });

    it('returns false when payment signature is absent', () => {
      const req = new Request('https://osada.us/api');
      expect(hasPaymentSignature(req)).toBe(false);
    });
  });

  describe('createX402PaymentRequiredResponse', () => {
    it('returns 402 with base64 Payment-Required header and JSON body', async () => {
      const url = new URL('https://osada.us/api');
      const response = createX402PaymentRequiredResponse(url, {
        resourcePath: '/api',
        description: 'Test API',
      });

      expect(response.status).toBe(402);
      expect(response.statusText).toBe('Payment Required');
      expect(response.headers.get('Content-Type')).toContain('application/json');
      expect(response.headers.get('Cache-Control')).toBe('no-store');

      const headerValue = response.headers.get('Payment-Required');
      expect(headerValue).toBeTruthy();
      expect(headerValue).not.toContain(',');
      const decodedHeader = JSON.parse(decodeBase64(headerValue!));
      expect(decodedHeader.x402Version).toBe(2);
      expect(decodedHeader.resource.url).toBe('https://osada.us/api');

      const body = (await response.json()) as any;
      expect(body.x402Version).toBe(2);
      expect(body.accepts[0].scheme).toBe('exact');
      expect(body.extensions.bazaar).toBeDefined();
    });
  });

  describe('withX402Payment middleware', () => {
    const nextHandler = async () => Response.json({ access: 'granted' });
    const wrapped = withX402Payment(nextHandler, {
      resourcePath: '/api',
      description: 'Protected',
    });

    it('rejects unauthenticated requests with 402', async () => {
      const context = {
        request: new Request('https://osada.us/api'),
        env: {},
      };
      const response = await wrapped(context);
      expect(response.status).toBe(402);
    });

    it('allows authenticated requests with 200', async () => {
      const context = {
        request: new Request('https://osada.us/api', {
          headers: { 'PAYMENT-SIGNATURE': 'valid' },
        }),
        env: {},
      };
      const response = await wrapped(context);
      expect(response.status).toBe(200);
      const data = (await response.json()) as { access: string };
      expect(data.access).toBe('granted');
    });
  });
});
