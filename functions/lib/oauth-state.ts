const STATE_TTL_SECONDS = 300;
export const OAUTH_STATE_COOKIE = 'o_sumo_oauth_state';

type OAuthStatePayload = {
  nonce: string;
  returnTo: string;
  expiresAt: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function normalizeReturnTo(returnTo: string): string {
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return '/my-rikishi/';
  try {
    const parsed = new URL(returnTo, 'https://osada.us');
    return parsed.origin === 'https://osada.us'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : '/my-rikishi/';
  } catch {
    return '/my-rikishi/';
  }
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  for (const part of cookie.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return valueParts.join('=');
  }
  return null;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createOAuthState(
  returnTo: string,
  secret: string,
): Promise<{ state: string; nonce: string; cookie: string }> {
  const nonceBytes = new Uint8Array(24);
  crypto.getRandomValues(nonceBytes);
  const nonce = toBase64Url(nonceBytes);
  const payload: OAuthStatePayload = {
    nonce,
    returnTo: normalizeReturnTo(returnTo),
    expiresAt: Date.now() + STATE_TTL_SECONDS * 1000,
  };
  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload));
  const state = `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
  const cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/api/auth/callback/google; Max-Age=${STATE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
  return { state, nonce, cookie };
}

export async function consumeOAuthState(
  request: Request,
  secret: string,
): Promise<{ nonce: string; returnTo: string } | null> {
  const state = new URL(request.url).searchParams.get('state');
  if (!state) return null;
  const [encodedPayload, encodedSignature, extra] = state.split('.');
  if (!encodedPayload || !encodedSignature || extra) return null;

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(encodedSignature),
      new TextEncoder().encode(encodedPayload),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as Partial<OAuthStatePayload>;
    if (typeof payload.nonce !== 'string' || typeof payload.returnTo !== 'string' || typeof payload.expiresAt !== 'number') {
      return null;
    }
    if (payload.expiresAt < Date.now()) return null;
    if (readCookie(request, OAUTH_STATE_COOKIE) !== payload.nonce) return null;
    return { nonce: payload.nonce, returnTo: normalizeReturnTo(payload.returnTo) };
  } catch {
    return null;
  }
}

export function clearOAuthStateCookie(): string {
  return `${OAUTH_STATE_COOKIE}=; Path=/api/auth/callback/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
