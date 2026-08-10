import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SIGNATURE_AGENT_URL,
  SIGNATURE_TAG,
  _resetSignerCacheForTests,
  selectSigningJwk,
  signAndSend,
  signRequest,
} from './signer';

const sampleJwks = {
  keys: [
    {
      kty: 'OKP',
      crv: 'Ed25519',
      alg: 'EdDSA',
      use: 'sig',
      kid: 'test-kid-abc',
      x: 'j1RResRnGlZcJQrVs1lAUzhxm4qwWXc0wgmErRVz2v8',
    },
  ],
};

describe('web-bot-auth signer', () => {
  beforeEach(() => {
    _resetSignerCacheForTests();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('selectSigningJwk picks the first OKP Ed25519 key with x and kid', () => {
    const selected = selectSigningJwk(sampleJwks);
    expect(selected.kid).toBe('test-kid-abc');
    expect(selected.x).toBe(sampleJwks.keys[0].x);
  });

  it('selectSigningJwk rejects an empty / non-Ed25519 directory', () => {
    expect(() => selectSigningJwk({ keys: [] })).toThrow(/No Ed25519 JWK/);
    expect(() =>
      selectSigningJwk({
        keys: [{ kty: 'RSA', crv: 'RSA', kid: 'r', x: 'r' }],
      }),
    ).toThrow(/No Ed25519 JWK/);
  });

  it('signRequest returns a Signature-Agent / Signature-Input / Signature triplet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(sampleJwks), { status: 200 })),
    );

    const { headers, keyId } = await signRequest('https://osada.us/.well-known/agent-card.json');
    expect(keyId).toBe('test-kid-abc');
    expect(headers['Signature-Agent']).toBe(SIGNATURE_AGENT_URL);
    expect(headers['Signature-Input']).toMatch(/^sig1=\(.*"@authority".*\)/);
    expect(headers['Signature']).toMatch(/^sig1=:[A-Za-z0-9_-]+:$/);

    // The Signature-Input must include the kid, tag, and window.
    expect(headers['Signature-Input']).toContain(`keyid="${keyId}"`);
    expect(headers['Signature-Input']).toContain(`tag="${SIGNATURE_TAG}"`);
    expect(headers['Signature-Input']).toMatch(/created=\d+;expires=\d+/);
  });

  it('signRequest uses the authority component for the signature base', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(sampleJwks), { status: 200 })),
    );

    const { headers } = await signRequest('https://example.com/foo');
    // The covered component list should reference @authority (the
    // component used to build the signature base per RFC 9421).
    expect(headers['Signature-Input']).toContain('"@authority"');
  });

  it('signAndSend issues a fetch with the signed headers merged in', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        // First call: directory lookup.
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleJwks), { status: 200 }))
        // Second call: the actual signed request — capture it.
        .mockResolvedValueOnce(new Response('ok', { status: 200 })),
    );

    const response = await signAndSend('https://example.com/api/data', {
      headers: { Accept: 'application/json' },
    });
    expect(response.status).toBe(200);

    // The second fetch must have carried the signed headers alongside
    // the caller-supplied Accept header.
    const signedFetch = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[1];
    const init = signedFetch[1] as RequestInit;
    const passedHeaders = init.headers as Headers;
    expect(passedHeaders.get('Accept')).toBe('application/json');
    expect(passedHeaders.get('Signature-Agent')).toBe(SIGNATURE_AGENT_URL);
    expect(passedHeaders.get('Signature-Input')).toMatch(/^sig1=/);
    expect(passedHeaders.get('Signature')).toMatch(/^sig1=:/);
  });
});
