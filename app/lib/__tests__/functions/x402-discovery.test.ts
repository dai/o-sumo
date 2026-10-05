import { describe, expect, it } from 'vitest';
import { onRequest, onRequestGet } from '../../../../functions/platform/v2/x402/discovery/resources';

describe('/platform/v2/x402/discovery/resources GET function', () => {
  it('returns 200 with JSON content-type', async () => {
    const request = new Request('https://osada.us/platform/v2/x402/discovery/resources');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(200);
    const contentType = response.headers.get('Content-Type') ?? '';
    expect(contentType).toContain('application/json');
  });

  it('returns a JSON array of x402-discoverable resources with Bazaar extension metadata', async () => {
    const request = new Request('https://osada.us/platform/v2/x402/discovery/resources');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const body = (await response.json()) as Array<{
      resource: string;
      type: string;
      x402Version: number;
      serviceName: string;
      description: string;
      accepts: unknown[];
      extensions: { bazaar: unknown };
    }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);

    const apiResource = body.find((r) => r.resource === 'https://osada.us/api');
    expect(apiResource).toBeDefined();
    expect(apiResource?.x402Version).toBe(2);
    expect(apiResource?.type).toBe('http');
    expect(apiResource?.extensions.bazaar).toBeDefined();

    const apiV1Resource = body.find((r) => r.resource === 'https://osada.us/api/v1');
    expect(apiV1Resource).toBeDefined();
    expect(apiV1Resource?.x402Version).toBe(2);
    expect(apiV1Resource?.extensions.bazaar).toBeDefined();
  });

  it('returns Cache-Control public with 300s max-age', async () => {
    const request = new Request('https://osada.us/platform/v2/x402/discovery/resources');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('onRequest is identical to onRequestGet', () => {
    expect(onRequest).toBe(onRequestGet);
  });
});