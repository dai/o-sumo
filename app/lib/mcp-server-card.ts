/**
 * MCP Server Card generation.
 *
 * The repository keeps a hand-maintained template at
 * `public/.well-known/mcp/server-card.json` (the source of truth for
 * every static field). At build time, `vite.config.ts`
 * (`mcpServerCardPlugin`) invokes `buildMcpServerCard` so that
 * `version` is always synchronized with the package version.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface McpServerCardRemote {
  type: 'streamable-http' | 'sse';
  url: string;
  headers?: Array<{
    name: string;
    description?: string;
    isRequired?: boolean;
    isSecret?: boolean;
  }>;
  supportedProtocolVersions?: string[];
}

export interface McpServerCard {
  $schema: string;
  name: string;
  version: string;
  title?: string;
  description: string;
  websiteUrl?: string;
  repository?: {
    source: string;
    url: string;
  };
  remotes?: McpServerCardRemote[];
  _meta?: Record<string, unknown>;
}

export function readPackageVersion(packageJsonPath: string = resolve(process.cwd(), 'package.json')): string {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string };
  return pkg.version;
}

export function buildMcpServerCard(
  publicDir: string,
  outRoot: string,
  packageVersion: string = readPackageVersion(),
): { written: string; card: McpServerCard } {
  const templatePath = resolve(publicDir, '.well-known/mcp/server-card.json');
  const template = JSON.parse(readFileSync(templatePath, 'utf8')) as McpServerCard;
  // Synchronize the version with package.json.
  const card: McpServerCard = {
    ...template,
    version: packageVersion,
  };
  const target = resolve(outRoot, '.well-known/mcp/server-card.json');
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, `${JSON.stringify(card, null, 2)}\n`, 'utf8');

  // Also write to dist/mcp/server-card for canonical SEP-2127 location
  const mcpTarget = resolve(outRoot, 'mcp/server-card');
  mkdirSync(resolve(mcpTarget, '..'), { recursive: true });
  writeFileSync(mcpTarget, `${JSON.stringify(card, null, 2)}\n`, 'utf8');

  return { written: target, card };
}
