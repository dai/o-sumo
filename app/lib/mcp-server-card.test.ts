import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMcpServerCard, readPackageVersion } from './mcp-server-card';

describe('mcp-server-card', () => {
  const publicDir = resolve(process.cwd(), 'public');
  const outRoot = resolve(process.cwd(), 'dist');

  it('synchronizes serverInfo.version with package.json', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.serverInfo.version).toBe(readPackageVersion());
  });

  it('identifies the server as o-sumo', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.serverInfo.name).toBe('o-sumo');
    expect(card.serverInfo.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(card.serverInfo.title.length).toBeGreaterThan(0);
    expect(card.serverInfo.description.length).toBeGreaterThan(0);
  });

  it('declares no MCP endpoint and no transport', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.endpoint).toBeNull();
    expect(card.transport).toBeNull();
  });

  it('advertises alternative endpoints exclusively under https://osada.us/', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    for (const [label, url] of Object.entries(card.alternativeEndpoints)) {
      expect(url, `alternativeEndpoints.${label}`).toMatch(/^https:\/\/osada\.us\//);
    }
  });

  it('writes the card to dist/.well-known/mcp/server-card.json', () => {
    buildMcpServerCard(publicDir, outRoot);
    const path = resolve(outRoot, '.well-known/mcp/server-card.json');
    expect(existsSync(path)).toBe(true);
  });
});
