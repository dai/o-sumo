import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { onRequestGet, onRequestPost } from '../../functions/mcp/[[path]]';
import {
  MCP_SERVER_CARD,
  MCP_SERVER_DESCRIPTION,
  MCP_SERVER_TITLE,
  MCP_SERVER_VERSION,
} from '../../functions/lib/mcp/server-card';
import { buildMcpServerCard, readPackageVersion } from './mcp-server-card';

const MCP_REGISTRY_VERSION = '1.0.1';

interface McpServerIdentity {
  name: string;
  version: string;
  title?: string;
  description?: string;
}

async function readServedServerCard(): Promise<{ version: string }> {
  const request = new Request('https://osada.us/mcp/server-card', {
    headers: { Accept: 'application/mcp-server-card+json' },
  });
  const response = await onRequestGet({ request, params: { path: ['server-card'] } });
  expect(response.status).toBe(200);
  return response.json() as Promise<{ version: string }>;
}

async function readInitializeServerInfo(): Promise<McpServerIdentity> {
  const request = new Request('https://osada.us/mcp', {
    method: 'POST',
    headers: {
      Host: 'osada.us',
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'mcp-server-card-test', version: '0.0.0' },
      },
    }),
  });
  const response = await onRequestPost({ request });
  expect(response.status).toBe(200);
  const dataLine = (await response.text()).split('\n').find((line) => line.startsWith('data: '));
  expect(dataLine).toBeDefined();
  const payload = JSON.parse(dataLine!.slice(6)) as { result?: { serverInfo?: McpServerIdentity } };
  expect(payload.result?.serverInfo).toBeDefined();
  return payload.result!.serverInfo!;
}

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

  it('declares streamable-http remote endpoints for data and AI search', () => {
    const { card } = buildMcpServerCard(publicDir, outRoot);
    expect(card.remotes).toBeDefined();
    expect(card.remotes?.length).toBe(2);
    expect(card.remotes?.[0]).toEqual({
      type: 'streamable-http',
      url: 'https://osada.us/mcp',
    });
    expect(card.remotes?.[1]).toEqual({
      type: 'streamable-http',
      url: 'https://ask.osada.us/mcp',
    });
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

  it('keeps server.json, package.json, server-card, and the MCP server on version 1.0.1', async () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'mcp/server.json'), 'utf8')) as {
      version: string;
    };
    const servedCard = await readServedServerCard();
    const serverInfo = await readInitializeServerInfo();
    const builtCard = buildMcpServerCard(publicDir, outRoot).card;

    expect(manifest.version).toBe(MCP_REGISTRY_VERSION);
    expect(readPackageVersion()).toBe(MCP_REGISTRY_VERSION);
    expect(MCP_SERVER_VERSION).toBe(MCP_REGISTRY_VERSION);
    expect(MCP_SERVER_CARD.version).toBe(MCP_REGISTRY_VERSION);
    expect(servedCard.version).toBe(MCP_REGISTRY_VERSION);
    expect(serverInfo.version).toBe(MCP_REGISTRY_VERSION);
    expect(builtCard.version).toBe(MCP_REGISTRY_VERSION);

    expect(MCP_SERVER_CARD.title).toBe(MCP_SERVER_TITLE);
    expect(MCP_SERVER_CARD.description).toBe(MCP_SERVER_DESCRIPTION);
    expect(serverInfo.title).toBe(MCP_SERVER_TITLE);
    expect(serverInfo.description).toBe(MCP_SERVER_DESCRIPTION);
    expect(serverInfo.name).toBe('us.osada/o-sumo');
  });
});
