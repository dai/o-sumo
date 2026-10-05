/**
 * ACP (Agentic Commerce Protocol) Discovery Document.
 *
 * Served at `/.well-known/acp.json` as a static file so AI agents can
 * discover the ACP endpoint of o-sumo. Schema is the minimum required
 * by `https://isitagentready.com/api/scan`'s `checks.commerce.acp`
 * validator. See `https://agenticcommerce.dev`.
 */

export interface AcpProtocol {
  readonly name: string;
  readonly version: string;
}

export interface AcpCapabilities {
  readonly services: readonly string[];
}

export interface AcpDiscoveryDocument {
  readonly protocol: AcpProtocol;
  readonly api_base_url: string;
  readonly transports: readonly string[];
  readonly capabilities: AcpCapabilities;
}

/** Latest stable ACP version (date-based, per agenticcommerce.dev). */
export const ACP_DISCOVERY_VERSION = '2026-04-17';

/** Origin serving the public ACP endpoints. */
export const ACP_API_BASE_URL = 'https://osada.us/';

/** Transports o-sumo exposes (HTTP/JSON over /api/v1/*.json). */
export const ACP_TRANSPORTS: readonly string[] = ['http'];

/** Services o-sumo exposes through ACP. */
export const ACP_SERVICES: readonly string[] = ['public-data'];

export function buildAcpDiscoveryDocument(): AcpDiscoveryDocument {
  return {
    protocol: {
      name: 'acp',
      version: ACP_DISCOVERY_VERSION,
    },
    api_base_url: ACP_API_BASE_URL,
    transports: ACP_TRANSPORTS,
    capabilities: {
      services: ACP_SERVICES,
    },
  };
}

export function assertAcpDiscoveryDocument(
  value: unknown,
): asserts value is AcpDiscoveryDocument {
  if (!value || typeof value !== 'object') {
    throw new TypeError('ACP discovery document must be an object');
  }
  const doc = value as Partial<AcpDiscoveryDocument>;
  if (!doc.protocol || typeof doc.protocol !== 'object') {
    throw new TypeError('ACP discovery document.protocol must be an object');
  }
  if (doc.protocol.name !== 'acp') {
    throw new TypeError('ACP discovery document.protocol.name must be "acp"');
  }
  if (typeof doc.protocol.version !== 'string' || doc.protocol.version.length === 0) {
    throw new TypeError('ACP discovery document.protocol.version must be a non-empty string');
  }
  if (typeof doc.api_base_url !== 'string' || !/^https?:\/\//.test(doc.api_base_url)) {
    throw new TypeError('ACP discovery document.api_base_url must be an absolute HTTP(S) URL');
  }
  if (!Array.isArray(doc.transports) || doc.transports.length === 0) {
    throw new TypeError('ACP discovery document.transports must be a non-empty array');
  }
  if (!doc.capabilities || typeof doc.capabilities !== 'object') {
    throw new TypeError('ACP discovery document.capabilities must be an object');
  }
  const caps = doc.capabilities;
  if (!Array.isArray(caps.services) || caps.services.length === 0) {
    throw new TypeError('ACP discovery document.capabilities.services must be a non-empty array');
  }
}