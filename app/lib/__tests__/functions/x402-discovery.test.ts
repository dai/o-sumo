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

  it('returns a JSON array body (empty for o-sumo)', async () => {
    const request = new Request('https://osada.us/platform/v2/x402/discovery/resources');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const body = (await response.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toEqual([]);
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