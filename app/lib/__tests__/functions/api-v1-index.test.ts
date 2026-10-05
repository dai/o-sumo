import { describe, expect, it } from 'vitest';
import { onRequest, onRequestGet } from '../../../../functions/api/v1';

describe('/api/v1 GET function', () => {
  it('returns 200 with JSON content-type', async () => {
    const request = new Request('https://osada.us/api/v1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(200);
    const contentType = response.headers.get('Content-Type') ?? '';
    expect(contentType).toContain('application/json');
  });

  it('returns the v1 directory with the canonical resource paths', async () => {
    const request = new Request('https://osada.us/api/v1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
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
    for (const resource of body.resources) {
      expect(resource.path.startsWith('/api/v1/')).toBe(true);
      expect(resource.path.endsWith('.json')).toBe(true);
      expect(resource.description.length).toBeGreaterThan(0);
    }
  });

  it('returns Cache-Control public with 300s max-age', async () => {
    const request = new Request('https://osada.us/api/v1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('onRequest is identical to onRequestGet', () => {
    expect(onRequest).toBe(onRequestGet);
  });
});