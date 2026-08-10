/**
 * A2A Agent Card generation.
 *
 * The repository keeps a hand-maintained template at
 * `public/.well-known/agent-card.json` (the source of truth for every static
 * field). At build time, `vite.config.ts` (`a2aAgentCardPlugin`) invokes
 * `buildA2aAgentCard` so that `version` is always synchronized with the
 * package version.
 *
 * `supportedInterfaces` advertises a single HTTP+JSON entry that resolves
 * to the Cloudflare Pages Function at `/a2a` (see `functions/a2a/[[path]].ts`).
 * That Function implements only the JSON-RPC 2.0 transport framing — every
 * A2A method returns `-32601 Method not found` because o-sumo has no task
 * state. The interface entry is non-empty so the discovery validator
 * (isitagentready.com) treats the Agent Card as well-formed; agents that
 * actually need data should fetch the public JSON API at `/api/v1/*.json`
 * via the skills listed below.
 *
 * Reference: https://a2a-protocol.org/latest/specification/#441-agentcard
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface A2aAgentSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples?: string[];
}

export interface A2aAgentInterface {
  url: string;
  protocolBinding: string;
  protocolVersion: string;
}

export interface A2aAgentCard {
  $schema: string;
  name: string;
  description: string;
  version: string;
  provider: {
    url: string;
    organization: string;
  };
  documentationUrl: string;
  iconUrl: string;
  supportedInterfaces: A2aAgentInterface[];
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    extendedAgentCard: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2aAgentSkill[];
}

export function readPackageVersion(packageJsonPath: string = resolve(process.cwd(), 'package.json')): string {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string };
  return pkg.version;
}

export function buildA2aAgentCard(
  publicDir: string,
  outRoot: string,
  packageVersion: string = readPackageVersion(),
): { written: string; card: A2aAgentCard } {
  const templatePath = resolve(publicDir, '.well-known/agent-card.json');
  const template = JSON.parse(readFileSync(templatePath, 'utf8')) as A2aAgentCard;
  // Synchronize the version with package.json.
  const card: A2aAgentCard = {
    ...template,
    version: packageVersion,
  };
  const target = resolve(outRoot, '.well-known/agent-card.json');
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, `${JSON.stringify(card, null, 2)}\n`, 'utf8');
  return { written: target, card };
}
