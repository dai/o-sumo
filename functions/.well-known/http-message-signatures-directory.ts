/**
 * Cloudflare Pages Function that serves
 * `/.well-known/http-message-signatures-directory`.
 *
 * Implements draft-meunier-http-message-signatures-directory-03:
 *   - Body: a JSON Web Key Set containing at least one Ed25519 public key
 *   - Content-Type: application/http-message-signatures-directory+json
 *   - Headers: dynamically computed `Signature` and `Signature-Input`
 *     proving the operator controls the private key (RFC 9421
 *     HTTP Message Signatures over `@authority`).
 *
 * The signing keypair is embedded in `_web-bot-auth-keys.ts` (generated
 * by `scripts/generate_web_bot_auth_keys.mjs`) and travels with the
 * Pages Function bundle. The RFC 9421 signature-base / parameters /
 * base64url primitives live in `app/lib/web-bot-auth/rfc9421.ts` so
 * the SPA client signer and this server function stay in lock-step.
 * Rotating the key only requires re-running the generation script and
 * committing the updated `_web-bot-auth-keys.ts`.
 */

import {
  WEB_BOT_AUTH_JWKS,
  WEB_BOT_AUTH_PRIVATE_JWK,
  WEB_BOT_AUTH_PUBLIC_JWK,
} from './_web-bot-auth-keys';
import {
  base64UrlEncode,
  buildSignatureBase,
  buildSignatureParams,
  formatSignatureHeader,
  formatSignatureInputHeader,
} from '../../app/lib/web-bot-auth/rfc9421';

const DIRECTORY_CONTENT_TYPE = 'application/http-message-signatures-directory+json';
const SIGNATURE_TAG = 'http-message-signatures-directory';
const SIGNATURE_WINDOW_SECONDS = 60;

function randomNonce(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Sign a string with the embedded Ed25519 private JWK using Web Crypto.
 * Cloudflare Workers / Pages Functions expose `crypto.subtle` and the
 * `Ed25519` algorithm directly.
 */
async function signEd25519(message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'jwk',
    WEB_BOT_AUTH_PRIVATE_JWK as unknown as JsonWebKey,
    { name: 'Ed25519' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('Ed25519', key, new TextEncoder().encode(message));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (context: any): Promise<Response> => {
  const url = new URL(context.request.url);
  const authority = url.host;
  const now = Math.floor(Date.now() / 1000);
  const created = now;
  const expires = now + SIGNATURE_WINDOW_SECONDS;

  if (!WEB_BOT_AUTH_PUBLIC_JWK.kid) {
    return new Response(
      JSON.stringify({ error: 'web-bot-auth-key-missing-kid' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const nonce = randomNonce(32);
  const signatureParams = buildSignatureParams({
    coveredComponents: ['@authority'],
    keyId: WEB_BOT_AUTH_PUBLIC_JWK.kid,
    created,
    expires,
    nonce,
    tag: SIGNATURE_TAG,
  });

  const signatureBase = buildSignatureBase({ authority, signatureParams });
  const signatureBytes = await signEd25519(signatureBase);
  const signatureValue = base64UrlEncode(signatureBytes);

  const body = JSON.stringify(WEB_BOT_AUTH_JWKS);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': DIRECTORY_CONTENT_TYPE,
      'Cache-Control': 'public, max-age=60',
      'Signature': formatSignatureHeader(signatureValue),
      'Signature-Input': formatSignatureInputHeader(signatureParams),
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest = onRequestGet;
