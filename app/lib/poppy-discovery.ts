/**
 * Personal Agent Protocol (Poppy) Discovery Document.
 *
 * Served at `/.well-known/poppy.json` as a static file. Follows the same
 * typed-builder + assert pattern as `acp-discovery.ts`.
 *
 * Posture (spec §3.1): o-sumo publishes **no** `agent`, `apis`, or
 * `web.browser_session_endpoint`, so `auth` is intentionally absent —
 * `auth` is only required when one of those is present. This keeps the
 * site free of any OAuth authorization-server obligation.
 *
 * `protocol_version` is pinned to "0.1". Spec 1.0 pre-release versions are
 * NOT mutually readable, so bumping this is a deliberate, test-guarded edit.
 *
 * See: https://personalagentprotocol.org/docs/spec#3-discovery
 */
import { SITE_ORIGIN } from './site-url';

/** Pinned protocol version. Bumping this is a deliberate, guard-tested edit. */
export const POPPY_PROTOCOL_VERSION = '0.1';

/** Organization display name. Matches `host.displayName` in ai-catalog.json. */
export const POPPY_ORGANIZATION_NAME = 'o-sumo';

/** Resolved host of SITE_ORIGIN ("osada.us"). String-narrowed at import time. */
export const POPPY_ORGANIZATION_DOMAIN: string = new URL(SITE_ORIGIN).hostname;

export interface PoppyOrganization {
  readonly name: string;
  readonly domain: string;
}

export interface PoppyWeb {
  readonly browser_session_endpoint?: string;
}

export interface PoppyDocument {
  readonly protocol_version: string;
  readonly organization: PoppyOrganization;
  readonly web: PoppyWeb;
}

const PROTOCOL_VERSION_PATTERN = /^\d+\.\d+$/;
const DOMAIN_SCHEME_PATTERN = /^[a-z0-9.\-]+$/;
const DOMAIN_WWW_PREFIX = 'www.';

export function buildPoppyDocument(): PoppyDocument {
  return {
    protocol_version: POPPY_PROTOCOL_VERSION,
    organization: {
      name: POPPY_ORGANIZATION_NAME,
      domain: POPPY_ORGANIZATION_DOMAIN,
    },
    web: {},
  };
}

function assertPoppyProtocolVersion(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !PROTOCOL_VERSION_PATTERN.test(value)) {
    throw new TypeError(`${field} must match "major.minor" (got ${JSON.stringify(value)})`);
  }
}

function assertPoppyOrganization(value: unknown): asserts value is PoppyOrganization {
  if (!value || typeof value !== 'object') {
    throw new TypeError('Poppy document.organization must be an object');
  }
  const org = value as Partial<PoppyOrganization>;
  if (typeof org.name !== 'string' || org.name.length === 0) {
    throw new TypeError('Poppy document.organization.name must be a non-empty string');
  }
  if (typeof org.domain !== 'string' || org.domain.length === 0) {
    throw new TypeError('Poppy document.organization.domain must be a non-empty string');
  }
  if (org.domain !== org.domain.toLowerCase()) {
    throw new TypeError('Poppy document.organization.domain must be lowercase');
  }
  if (org.domain.startsWith(DOMAIN_WWW_PREFIX)) {
    throw new TypeError('Poppy document.organization.domain must not start with "www."');
  }
  if (!DOMAIN_SCHEME_PATTERN.test(org.domain)) {
    throw new TypeError(
      'Poppy document.organization.domain must be a bare hostname (no scheme, path, or port)',
    );
  }
}

function assertPoppyWeb(value: unknown): asserts value is PoppyWeb {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Poppy document.web must be an object');
  }
  const web = value as Record<string, unknown>;
  if (
    'browser_session_endpoint' in web &&
    (typeof web.browser_session_endpoint !== 'string' || web.browser_session_endpoint.length === 0)
  ) {
    throw new TypeError(
      'Poppy document.web.browser_session_endpoint must be a non-empty string when present',
    );
  }
}

export function assertPoppyDocument(value: unknown): asserts value is PoppyDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Poppy document must be an object');
  }
  const doc = value as Record<string, unknown>;
  assertPoppyProtocolVersion(doc.protocol_version, 'Poppy document.protocol_version');
  assertPoppyOrganization(doc.organization);
  assertPoppyWeb(doc.web);

  // Spec §3.1 — `auth` is required only when agent/apis/feedback/web.browser_session_endpoint
  // is present. Future extensions (`agent`, `apis`, `feedback`) would each demand
  // a matching `auth` block with `poppy_domains`, `token_endpoint`,
  // `revocation_endpoint`, etc. Assert on those combinations early so contributors
  // hit this guard instead of the OIDC server.
  const hasAgent = 'agent' in doc;
  const hasApis = 'apis' in doc;
  const hasFeedback = 'feedback' in doc;
  const browserSession = (doc.web as { browser_session_endpoint?: unknown }).browser_session_endpoint;
  const hasBrowserSession = typeof browserSession === 'string';
  const hasAuth = 'auth' in doc;
  const needsAuth = hasAgent || hasApis || hasFeedback || hasBrowserSession;
  if (needsAuth && !hasAuth) {
    throw new TypeError(
      'Poppy document requires `auth` when `agent`, `apis`, `feedback`, or `web.browser_session_endpoint` is present (spec §3.1)',
    );
  }
}
