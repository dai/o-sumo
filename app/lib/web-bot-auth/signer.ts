/**
 * Web Bot Auth client signer.
 *
 * Implements the IETF Web Bot Auth protocol
 * (draft-meunier-web-bot-auth-architecture-02) so that browser-issued
 * fetch() calls can attach `Signature-Agent`, `Signature-Input`, and
 * `Signature` headers per RFC 9421.
 *
 * Usage from the SPA:
 *
 *   import { signAndSend } from '@/lib/web-bot-auth/signer';
 *   await signAndSend('https://example.com/api/data');
 *
 * The signer fetches the published JWKS from the signature directory
 * once per page load (cached in module memory) and generates a
 * per-tab Ed25519 keypair. The `kid` advertised by the directory is
 * reused as the `keyid` parameter on outbound signatures so verifiers
 * that maintain a per-`kid` reputation policy will recognise o-sumo
 * traffic.
 *
 * The canonical Web Bot Auth signing on this site happens server-side
 * in `functions/.well-known/http-message-signatures-directory.ts`,
 * which re-signs the directory response on every request with the
 * server-held private key. Both surfaces share the RFC 9421
 * primitives in `./rfc9421`.
 */

import {
  base64UrlEncode,
  buildSignatureBase,
  buildSignatureParams,
  formatSignatureHeader,
  formatSignatureInputHeader,
} from './rfc9421';

export { base64UrlEncode, jwkThumbprint } from './rfc9421';

export const SIGNATURE_AGENT_URL = 'https://osada.us/.well-known/http-message-signatures-directory';
export const SIGNATURE_TAG = 'web-bot-auth';
const DEFAULT_SIGNATURE_WINDOW_SECONDS = 60;
const NONCE_BYTES = 32;

export interface SignerOptions {
  /** Override the Signature-Agent URL advertised to verifiers. */
  signatureAgent?: string;
  /** Override how long the signed request should be valid. */
  windowSeconds?: number;
  /** Override the components covered by the signature (default: `@authority`). */
  coveredComponents?: string[];
}

export interface SignedHeaders {
  'Signature-Agent': string;
  'Signature-Input': string;
  'Signature': string;
}

export interface JwkSet {
  keys: Array<{
    kty?: string;
    crv?: string;
    alg?: string;
    kid?: string;
    x?: string;
  }>;
}

interface ResolvedSigner {
  privateKey: CryptoKey;
  kid: string;
  signatureAgent: string;
  windowSeconds: number;
  coveredComponents: string[];
}

let cachedSigner: Promise<ResolvedSigner> | null = null;

function randomNonce(byteLength = NONCE_BYTES): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export function selectSigningJwk(jwks: JwkSet): NonNullable<JwkSet['keys'][number]> {
  const candidates = jwks.keys.filter(
    (key) => key.kty === 'OKP' && key.crv === 'Ed25519' && key.x && key.kid,
  );
  if (candidates.length === 0) {
    throw new Error('No Ed25519 JWK found in signing directory');
  }
  return candidates[0];
}

export async function fetchSigningJwkSet(directoryUrl: string = SIGNATURE_AGENT_URL): Promise<JwkSet> {
  const response = await fetch(directoryUrl, {
    headers: { Accept: 'application/http-message-signatures-directory+json' },
    credentials: 'omit',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch signing directory: HTTP ${response.status}`);
  }
  return (await response.json()) as JwkSet;
}

/**
 * Sign a request URL and return the headers to add to the outbound
 * fetch.
 */
export async function signRequest(
  url: string,
  options: SignerOptions = {},
): Promise<{ headers: SignedHeaders; keyId: string }> {
  const signer = await resolveSigner(options);
  const parsed = new URL(url);
  const authority = parsed.host;
  const now = Math.floor(Date.now() / 1000);
  const created = now;
  const expires = now + signer.windowSeconds;

  const nonce = randomNonce();
  const signatureParams = buildSignatureParams({
    coveredComponents: signer.coveredComponents,
    keyId: signer.kid,
    created,
    expires,
    nonce,
  });

  const signatureBase = buildSignatureBase({ authority, signatureParams });
  const signatureBytes = await crypto.subtle.sign(
    'Ed25519',
    signer.privateKey,
    new TextEncoder().encode(signatureBase),
  );
  const signatureValue = base64UrlEncode(signatureBytes);

  return {
    keyId: signer.kid,
    headers: {
      'Signature-Agent': signer.signatureAgent,
      'Signature-Input': formatSignatureInputHeader(signatureParams),
      'Signature': formatSignatureHeader(signatureValue),
    },
  };
}

async function resolveSigner(options: SignerOptions): Promise<ResolvedSigner> {
  if (cachedSigner) {
    return cachedSigner;
  }
  cachedSigner = (async (): Promise<ResolvedSigner> => {
    const directoryUrl = options.signatureAgent ?? SIGNATURE_AGENT_URL;
    const jwks = await fetchSigningJwkSet(directoryUrl);
    const selected = selectSigningJwk(jwks);
    if (!selected.x || !selected.kid) {
      throw new Error('Selected JWK is missing required fields');
    }
    const keypair = await crypto.subtle.generateKey(
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      true,
      ['sign', 'verify'],
    );
    return {
      privateKey: keypair.privateKey,
      kid: selected.kid,
      signatureAgent: directoryUrl,
      windowSeconds: options.windowSeconds ?? DEFAULT_SIGNATURE_WINDOW_SECONDS,
      coveredComponents: options.coveredComponents ?? ['@authority'],
    };
  })();
  return cachedSigner;
}

/** Reset the cached signer (test-only convenience). */
export function _resetSignerCacheForTests(): void {
  cachedSigner = null;
}

export async function signAndSend(
  url: string,
  init: RequestInit = {},
  options: SignerOptions = {},
): Promise<Response> {
  const { headers: signedHeaders } = await signRequest(url, options);
  const mergedHeaders = new Headers(init.headers);
  for (const [key, value] of Object.entries(signedHeaders)) {
    mergedHeaders.set(key, value);
  }
  return fetch(url, { ...init, headers: mergedHeaders });
}

export function createSignedFetch(
  options: SignerOptions = {},
): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.toString();
    return signAndSend(url, init, options);
  };
}

export const WEB_BOT_AUTH_SIGNATURE_AGENT_URL = SIGNATURE_AGENT_URL;
