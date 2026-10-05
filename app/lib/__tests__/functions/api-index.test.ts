import { describe, expect, it } from 'vitest';
import { onRequest, onRequestGet } from '../../../../functions/api';

describe('/api GET function', () => {
  it('returns 200 with JSON content-type', async () => {
    const request = new Request('https://osada.us/api');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(200);
    const contentType = response.headers.get('Content-Type') ?? '';
    expect(contentType).toContain('application/json');
  });

  it('returns the API directory with v1 endpoints', async () => {
    const request = new Request('https://osada.us/api');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const body = (await response.json()) as {
      name: string;
      version: string;
      endpoints: { v1: Record<string, string> };
      discovery: Record<string, string>;
    };
    expect(body.name).toBe('o-sumo public API');
    expect(body.version).toBe('1.0.0');
    expect(body.endpoints.v1.banzuke).toBe('/api/v1/banzuke.json');
    expect(body.endpoints.v1.torikumi).toBe('/api/v1/torikumi.json');
    expect(body.endpoints.v1.rikishi).toBe('/api/v1/rikishi.json');
    expect(body.endpoints.v1.gyoji).toBe('/api/v1/gyoji.json');
    expect(body.endpoints.v1.yobidashi).toBe('/api/v1/yobidashi.json');
  });

  it('returns Cache-Control public with 300s max-age', async () => {
    const request = new Request('https://osada.us/api');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('advertises the ACP discovery document in the discovery block', async () => {
    const request = new Request('https://osada.us/api');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const body = (await response.json()) as { discovery: Record<string, string> };
    expect(body.discovery.acp).toBe('/.well-known/acp.json');
    expect(body.discovery.api_catalog).toBe('/.well-known/api-catalog');
    expect(body.discovery.agent_card).toBe('/.well-known/agent-card.json');
    expect(body.discovery.agent_skills).toBe('/.well-known/agent-skills/index.json');
  });

  it('onRequest is identical to onRequestGet', () => {
    expect(onRequest).toBe(onRequestGet);
  });
});