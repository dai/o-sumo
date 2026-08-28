import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestGet } from '../../../../functions/.well-known/http-message-signatures-directory';

describe('http-message-signatures-directory function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-28T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 200 with the http-message-signatures-directory content type', async () => {
    const request = new Request('https://osada.us/.well-known/http-message-signatures-directory');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/http-message-signatures-directory+json',
    );
  });

  it('includes Signature and Signature-Input headers (RFC 9421)', async () => {
    const request = new Request('https://osada.us/.well-known/http-message-signatures-directory');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const signature = response.headers.get('Signature');
    const signatureInput = response.headers.get('Signature-Input');
    expect(signature).toBeTruthy();
    expect(signatureInput).toBeTruthy();
    // Signature-Input should reference the http-message-signatures-directory tag.
    expect(signatureInput).toContain('http-message-signatures-directory');
  });

  it('returns a JWKS body with at least one public key', async () => {
    const request = new Request('https://osada.us/.well-known/http-message-signatures-directory');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = { request, env: {} };
    const response = await onRequestGet(context);
    const body = (await response.json()) as { keys: Array<{ kty: string; kid?: string }> };
    expect(Array.isArray(body.keys)).toBe(true);
    expect(body.keys.length).toBeGreaterThan(0);
    for (const key of body.keys) {
      expect(key.kty).toBe('OKP');
      expect(key.kid).toBeTruthy();
    }
  });
});