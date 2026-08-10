import { describe, expect, it } from 'vitest';
import {
  base64UrlEncode,
  buildSignatureBase,
  buildSignatureParams,
  formatSignatureHeader,
  formatSignatureInputHeader,
  jwkThumbprint,
} from './rfc9421';

describe('rfc9421 primitives', () => {
  it('base64UrlEncode produces unpadded URL-safe encoding', () => {
    const bytes = new Uint8Array([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa]);
    expect(base64UrlEncode(bytes)).toBe('_-7dzLuq');
  });

  it('base64UrlEncode round-trips utf-8 input', () => {
    const text = 'hello world';
    const encoded = base64UrlEncode(new TextEncoder().encode(text));
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    );
    expect(decoded).toBe(text);
  });

  it('buildSignatureParams includes every required field', () => {
    const params = buildSignatureParams({
      coveredComponents: ['@authority'],
      keyId: 'kid-123',
      created: 1700000000,
      expires: 1700000060,
      nonce: 'nonce-xyz',
    });
    expect(params).toContain('("@authority")');
    expect(params).toContain('alg="ed25519"');
    expect(params).toContain('keyid="kid-123"');
    expect(params).toContain('nonce="nonce-xyz"');
    expect(params).toContain('tag="web-bot-auth"');
    expect(params).toContain('created=1700000000');
    expect(params).toContain('expires=1700000060');
    // Every component and parameter is ;-separated.
    expect(params.split(';')).toHaveLength(7);
  });

  it('buildSignatureParams quotes multiple covered components', () => {
    const params = buildSignatureParams({
      coveredComponents: ['@authority', '@method'],
      keyId: 'k',
      created: 1,
      expires: 2,
      nonce: 'n',
    });
    expect(params).toContain('("@authority" "@method")');
  });

  it('buildSignatureBase uses LF separators and quotes @authority', () => {
    const base = buildSignatureBase({
      authority: 'osada.us',
      signatureParams: 'sig1=("@authority")',
    });
    expect(base).toBe('"@authority": osada.us\n"@signature-params": sig1=("@authority")');
  });

  it('formatSignatureHeader / formatSignatureInputHeader produce sig1=...', () => {
    expect(formatSignatureHeader('abc')).toBe('sig1=:abc:');
    expect(formatSignatureInputHeader('("@authority")')).toBe('sig1=("@authority")');
  });

  it('jwkThumbprint computes a stable SHA-256 base64url digest', async () => {
    // Known canonical input: {"crv":"Ed25519","kty":"OKP","x":"abc"}
    const thumbprint = await jwkThumbprint({ kty: 'OKP', crv: 'Ed25519', x: 'abc' });
    expect(thumbprint).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    // Re-running yields the same value.
    const again = await jwkThumbprint({ kty: 'OKP', crv: 'Ed25519', x: 'abc' });
    expect(again).toBe(thumbprint);
  });

  it('jwkThumbprint differs when the public key changes', async () => {
    const a = await jwkThumbprint({ kty: 'OKP', crv: 'Ed25519', x: 'aaa' });
    const b = await jwkThumbprint({ kty: 'OKP', crv: 'Ed25519', x: 'bbb' });
    expect(a).not.toBe(b);
  });
});
