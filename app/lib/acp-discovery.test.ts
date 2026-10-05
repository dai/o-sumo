import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ACP_API_BASE_URL,
  ACP_DISCOVERY_VERSION,
  ACP_SERVICES,
  ACP_TRANSPORTS,
  assertAcpDiscoveryDocument,
  buildAcpDiscoveryDocument,
} from './acp-discovery';

const STATIC_PATH = resolve(process.cwd(), 'public/.well-known/acp.json');

describe('acp-discovery', () => {
  it('declares protocol name "acp"', () => {
    const doc = buildAcpDiscoveryDocument();
    expect(doc.protocol.name).toBe('acp');
  });

  it('declares a non-empty protocol version pinned to ACP_DISCOVERY_VERSION', () => {
    const doc = buildAcpDiscoveryDocument();
    expect(doc.protocol.version.length).toBeGreaterThan(0);
    expect(doc.protocol.version).toBe(ACP_DISCOVERY_VERSION);
  });

  it('declares api_base_url as an absolute HTTP(S) URL', () => {
    const doc = buildAcpDiscoveryDocument();
    expect(doc.api_base_url).toBe(ACP_API_BASE_URL);
    expect(doc.api_base_url).toMatch(/^https?:\/\//);
  });

  it('declares a non-empty transports array', () => {
    const doc = buildAcpDiscoveryDocument();
    expect(Array.isArray(doc.transports)).toBe(true);
    expect(doc.transports.length).toBeGreaterThan(0);
    expect(doc.transports).toContain('http');
    expect(doc.transports).toEqual(ACP_TRANSPORTS);
  });

  it('declares a non-empty capabilities.services array', () => {
    const doc = buildAcpDiscoveryDocument();
    expect(Array.isArray(doc.capabilities.services)).toBe(true);
    expect(doc.capabilities.services.length).toBeGreaterThan(0);
    expect(doc.capabilities.services).toContain('public-data');
    expect(doc.capabilities.services).toEqual(ACP_SERVICES);
  });

  it('matches the static file at public/.well-known/acp.json', () => {
    const doc = buildAcpDiscoveryDocument();
    const file = JSON.parse(readFileSync(STATIC_PATH, 'utf-8'));
    expect(file).toEqual(doc);
  });

  it('assertAcpDiscoveryDocument accepts the builder output', () => {
    expect(() => assertAcpDiscoveryDocument(buildAcpDiscoveryDocument())).not.toThrow();
  });

  it('assertAcpDiscoveryDocument accepts the static file', () => {
    const file = JSON.parse(readFileSync(STATIC_PATH, 'utf-8'));
    expect(() => assertAcpDiscoveryDocument(file)).not.toThrow();
  });

  it('assertAcpDiscoveryDocument rejects empty transports', () => {
    expect(() =>
      assertAcpDiscoveryDocument({
        ...buildAcpDiscoveryDocument(),
        transports: [],
      }),
    ).toThrow(/transports/);
  });

  it('assertAcpDiscoveryDocument rejects empty capabilities.services', () => {
    expect(() =>
      assertAcpDiscoveryDocument({
        ...buildAcpDiscoveryDocument(),
        capabilities: { services: [] },
      }),
    ).toThrow(/capabilities\.services/);
  });

  it('assertAcpDiscoveryDocument rejects non-acp protocol name', () => {
    expect(() =>
      assertAcpDiscoveryDocument({
        ...buildAcpDiscoveryDocument(),
        protocol: { name: 'something-else', version: '2026-04-17' },
      }),
    ).toThrow(/protocol\.name/);
  });

  it('assertAcpDiscoveryDocument rejects non-HTTP api_base_url', () => {
    expect(() =>
      assertAcpDiscoveryDocument({
        ...buildAcpDiscoveryDocument(),
        api_base_url: 'osada.us/api/',
      }),
    ).toThrow(/api_base_url/);
  });
});