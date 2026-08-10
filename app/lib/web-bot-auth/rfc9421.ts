/**
 * RFC 9421 HTTP Message Signatures primitives shared between the SPA
 * client signer (`signer.ts`) and the Cloudflare Pages Function that
 * serves the Web Bot Auth signing directory. These functions are pure
 * (no I/O) so they can be exercised by both the browser bundle and
 * the Pages Functions runtime, and unit-tested in jsdom.
 */

export function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < view.byteLength; i += 1) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary).replace(/=+$/u, '').replace(/\+/gu, '-').replace(/\//gu, '_');
}

/**
 * Compute the RFC 9421 JWK thumbprint for an OKP/Ed25519 public key.
 * The algorithm: serialize `{crv, kty, x}` (lexicographically sorted
 * by the JSON encoder's property order — Node/browsers preserve
 * insertion order), SHA-256 the UTF-8 bytes, then base64url-encode
 * the digest with no padding.
 */
export async function jwkThumbprint(publicJwk: {
  kty: string;
  crv: string;
  x: string;
}): Promise<string> {
  const canonical = JSON.stringify({ crv: publicJwk.crv, kty: publicJwk.kty, x: publicJwk.x });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return base64UrlEncode(digest);
}

export interface SignatureParamsInput {
  coveredComponents: string[];
  keyId: string;
  created: number;
  expires: number;
  nonce: string;
  /** Tag value for the Web Bot Auth signature (defaults to "web-bot-auth"). */
  tag?: string;
  /** Algorithm identifier advertised in the parameters. */
  alg?: string;
}

/**
 * Build the `Signature-Input` parameter list per RFC 9421 §4.2.
 *
 * The shape is e.g.
 *   ("@authority");alg="ed25519";keyid="...";nonce="...";tag="web-bot-auth";created=...;expires=...
 */
export function buildSignatureParams({
  coveredComponents,
  keyId,
  created,
  expires,
  nonce,
  tag = 'web-bot-auth',
  alg = 'ed25519',
}: SignatureParamsInput): string {
  const componentList = coveredComponents.map((c) => `"${c}"`).join(' ');
  return [
    `(${componentList})`,
    `alg="${alg}"`,
    `keyid="${keyId}"`,
    `nonce="${nonce}"`,
    `tag="${tag}"`,
    `created=${created}`,
    `expires=${expires}`,
  ].join(';');
}

/**
 * Build the RFC 9421 §2.5 signature base string. For now we only
 * support `@authority` (the derived component Cloudflare's Web Bot
 * Auth reference implementation signs).
 */
export function buildSignatureBase({
  authority,
  signatureParams,
}: {
  authority: string;
  signatureParams: string;
}): string {
  return ['"@authority": ' + authority, '"@signature-params": ' + signatureParams].join('\n');
}

/**
 * Format the signed signature value as the body of an RFC 9421
 * `Signature` header for a single signature labelled `sig1`.
 */
export function formatSignatureHeader(signatureValue: string): string {
  return `sig1=:${signatureValue}:`;
}

/** Format the `Signature-Input` header for a single signature labelled `sig1`. */
export function formatSignatureInputHeader(signatureParams: string): string {
  return `sig1=${signatureParams}`;
}
