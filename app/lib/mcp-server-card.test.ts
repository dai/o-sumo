import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMcpServerCard, readPackageVersion } from './mcp-server-card';

describe('mcp-server-card', () => {
  const publicDir = resolve(process.cwd(), 'public');
  const outRoot = resolve(process.cwd(), 'dist');

  it('synchronizes version with package.json', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.version).toBe(readPackageVersion());
  });

  it('identifies the server in reverse-DNS format', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.name).toBe('us.osada/o-sumo');
    expect(card.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(card.title?.length).toBeGreaterThan(0);
    expect(card.description.length).toBeGreaterThan(0);
    expect(card.websiteUrl).toBe('https://osada.us/');
  });

  it('declares streamable-http remote endpoint at https://osada.us/mcp', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.remotes).toBeDefined();
    expect(card.remotes?.length).toBeGreaterThan(0);
    const remote = card.remotes?.[0];
    expect(remote?.type).toBe('streamable-http');
    expect(remote?.url).toBe('https://osada.us/mcp');
  });

  it('writes the card to dist/.well-known/mcp/server-card.json and dist/mcp/server-card', () => {
    buildMcpServerCard(publicDir, outRoot);
    const legacyPath = resolve(outRoot, '.well-known/mcp/server-card.json');
    const canonicalPath = resolve(outRoot, 'mcp/server-card');
    expect(existsSync(legacyPath)).toBe(true);
    expect(existsSync(canonicalPath)).toBe(true);

    const legacyContent = readFileSync(legacyPath, 'utf8');
    const canonicalContent = readFileSync(canonicalPath, 'utf8');
    expect(legacyContent).toBe(canonicalContent);
  });
});
