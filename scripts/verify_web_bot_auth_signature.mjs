/**
 * Smoke-test that fetches the locally-running
 * /.well-known/http-message-signatures-directory and verifies the
 * response's `Signature` header against the published JWKS. Used by
 * the Web Bot Auth PR validation step.
 *
 * Usage:
 *   TARGET_URL=http://127.0.0.1:3002 node scripts/verify_web_bot_auth_signature.mjs
 */
import { calculateJwkThumbprint } from 'jose';
import { webcrypto } from 'node:crypto';

const subtle = webcrypto.subtle;

const target = process.env.TARGET_URL ?? 'http://127.0.0.1:3002';
const directoryUrl = `${target}/.well-known/http-message-signatures-directory`;

const response = await fetch(directoryUrl, {
  headers: { Accept: 'application/http-message-signatures-directory+json' },
});
if (!response.ok) {
  console.error(`directory fetch failed: HTTP ${response.status}`);
  process.exit(1);
}

const jwks = await response.json();
const jwk = jwks.keys[0];

const sigInputHeader = response.headers.get('Signature-Input');
const sigHeader = response.headers.get('Signature');
const contentType = response.headers.get('Content-Type');

if (!sigInputHeader || !sigHeader) {
  console.error('Missing Signature / Signature-Input headers');
  process.exit(1);
}
if (!contentType?.includes('application/http-message-signatures-directory+json')) {
  console.error(`Bad Content-Type: ${contentType}`);
  process.exit(1);
}

const sigInputMatch = sigInputHeader.match(/^sig1=(.+)$/);
if (!sigInputMatch) {
  console.error('Signature-Input does not start with sig1=');
  process.exit(1);
}
const signatureParams = sigInputMatch[1];

const sigValueMatch = sigHeader.match(/^sig1=:([A-Za-z0-9_-]+):$/);
if (!sigValueMatch) {
  console.error('Signature header is not in sig1=:<b64>: format');
  process.exit(1);
}
const sigBase64Url = sigValueMatch[1];
const sigBytes = Buffer.from(
  sigBase64Url.replace(/-/g, '+').replace(/_/g, '/'), 'base64',
);

const authority = new URL(target).host;
const signatureBase = [
  '"@authority": ' + authority,
  '"@signature-params": ' + signatureParams,
].join('\n');

// Use Web Crypto's Ed25519 verifier (available in Node 18+ via webcrypto).
const pubKey = await subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify']);
const ok = await subtle.verify(
  { name: 'Ed25519' },
  pubKey,
  sigBytes,
  new TextEncoder().encode(signatureBase),
);

const computedKid = await calculateJwkThumbprint(jwk, 'sha256');

console.log(JSON.stringify({
  contentType,
  authority,
  jwkKid: jwk.kid,
  computedKid,
  signatureInput: sigInputHeader,
  signature: sigHeader,
  signatureVerifies: ok,
}, null, 2));

if (!ok) {
  console.error('Signature did not verify!');
  process.exit(1);
}
if (jwk.kid !== computedKid) {
  console.error('kid does not match the canonical thumbprint of the JWK');
  process.exit(1);
}
console.log('Web Bot Auth directory self-signature verified.');

