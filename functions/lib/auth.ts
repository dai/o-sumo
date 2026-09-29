/// <reference types="@cloudflare/workers-types" />

export const SESSION_COOKIE = 'o_sumo_session';
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  displayName: string;
};

export type AuthEnv = {
  MY_RIKISHI_DB: D1Database;
  AUTH_SESSION_TTL_SECONDS?: string;
};

type SessionRow = {
  id: string;
  display_name: string;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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

function withSetCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', cookie);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function createRawSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function hashSessionToken(rawToken: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function sessionExpiresAt(env: Pick<AuthEnv, 'AUTH_SESSION_TTL_SECONDS'>, now = Date.now()): string {
  const configured = Number.parseInt(env.AUTH_SESSION_TTL_SECONDS ?? '', 10);
  const ttl = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_TTL_SECONDS;
  return new Date(now + ttl * 1000).toISOString();
}

export async function getSessionUser(request: Request, env: AuthEnv): Promise<AuthUser | null> {
  const rawToken = readCookie(request, SESSION_COOKIE);
  if (!rawToken) return null;
  const tokenHash = await hashSessionToken(rawToken);
  const row = await env.MY_RIKISHI_DB.prepare(
    `SELECT users.id, users.display_name
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?1 AND sessions.expires_at > ?2`,
  ).bind(tokenHash, new Date().toISOString()).first<SessionRow>();
  return row ? { id: row.id, displayName: row.display_name } : null;
}

export function setSessionCookie(response: Response, rawToken: string, expiresAt: string): Response {
  return withSetCookie(
    response,
    `${SESSION_COOKIE}=${rawToken}; Path=/; Expires=${new Date(expiresAt).toUTCString()}; HttpOnly; Secure; SameSite=Lax`,
  );
}

export function clearSessionCookie(response: Response): Response {
  return withSetCookie(response, `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export function getRawSessionToken(request: Request): string | null {
  return readCookie(request, SESSION_COOKIE);
}
