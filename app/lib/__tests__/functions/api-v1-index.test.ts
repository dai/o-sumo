import { describe, expect, it } from 'vitest';
import { onRequest, onRequestGet } from '../../../../functions/api/v1';

describe('/api/v1 GET function', () => {
  it('returns 402 Payment Required when payment authorization is absent', async () => {
    const request = new Request('https://osada.us/api/v1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(402);
    expect(response.statusText).toBe('Payment Required');
    const contentType = response.headers.get('Content-Type') ?? '';
    expect(contentType).toContain('application/json');

    const paymentRequiredHeader = response.headers.get('Payment-Required');
    expect(paymentRequiredHeader).toBeTruthy();

    const body = (await response.json()) as any;
    expect(body.x402Version).toBe(2);
    expect(body.error).toBe('Payment required');
    expect(body.resource.url).toBe('https://osada.us/api/v1');
    expect(Array.isArray(body.accepts)).toBe(true);
    expect(body.accepts[0].scheme).toBe('exact');
    expect(body.accepts[0].network).toBe('eip155:8453');
    expect(body.extensions.bazaar).toBeDefined();
    expect(body.extensions.bazaar.info.input.method).toBe('GET');
  });

  it('returns 200 with the v1 directory when PAYMENT-SIGNATURE is present', async () => {
    const request = new Request('https://osada.us/api/v1', {
      headers: {
        'PAYMENT-SIGNATURE': 'dummy-signature',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      name: string;
      version: string;
      resources: Array<{ path: string; description: string }>;
    };
    expect(body.name).toBe('o-sumo public API v1');
    expect(body.version).toBe('1.0.0');
    expect(Array.isArray(body.resources)).toBe(true);
    const paths = body.resources.map((r) => r.path);
    expect(paths).toContain('/api/v1/banzuke.json');
    expect(paths).toContain('/api/v1/torikumi.json');
    expect(paths).toContain('/api/v1/rikishi.json');
    expect(paths).toContain('/api/v1/gyoji.json');
    expect(paths).toContain('/api/v1/yobidashi.json');
  });

  it('onRequest is identical to onRequestGet', () => {
    expect(onRequest).toBe(onRequestGet);
  });
});