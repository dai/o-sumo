/**
 * MCP Server Card generation.
 *
 * The repository keeps a hand-maintained template at
 * `public/.well-known/mcp/server-card.json` (the source of truth for
 * every static field). At build time, `vite.config.ts`
 * (`mcpServerCardPlugin`) invokes `buildMcpServerCard` so that
 * `serverInfo.version` is always synchronized with the package version.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface McpServerCard {
  $schema: string;
  serverInfo: {
    name: string;
    version: string;
    title: string;
    description: string;
  };
  endpoint: string | null;
  transport: string | null;
  capabilities: {
    tools: { listChanged: boolean };
    resources: { subscribe: boolean; listChanged: boolean };
    prompts: { listChanged: boolean };
  };
  authentication: {
    required: boolean;
    schemes: string[];
  };
  alternativeEndpoints: Record<string, string>;
  documentation: string;
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
    serverInfo: {
      ...template.serverInfo,
      version: packageVersion,
    },
  };
  const target = resolve(outRoot, '.well-known/mcp/server-card.json');
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, `${JSON.stringify(card, null, 2)}\n`, 'utf8');
  return { written: target, card };
}
