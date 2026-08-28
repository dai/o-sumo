/**
 * A2A Agent Card generation.
 *
 * `public/.well-known/agent-card.json` is a hand-maintained template that
 * holds every static field except `skills` and `version`. At build time,
 * `vite.config.ts` (`a2aAgentCardPlugin`) invokes `buildA2aAgentCard`, which:
 *
 * - synchronizes `version` with the package version, and
 * - **derives `skills[]` from `SKILL_MANIFEST` (the single source of truth)**
 *   via `mapSkillEntryToA2aSkill`. `tags` and `examples` are looked up from
 *   the `TAGS_BY_NAME` / `EXAMPLES_BY_NAME` supplementary tables because
 *   `SKILL_MANIFEST` does not currently carry them.
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
import { SKILL_MANIFEST, type AgentSkillEntry } from './agent-skills';

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

/**
 * Supplementary metadata for skills that `SKILL_MANIFEST` does not carry.
 * `tags` and `examples` are looked up by skill `name`. Unknown names fall
 * back to empty arrays so the builder never throws on a missing key.
 */
const TAGS_BY_NAME: Record<string, readonly string[]> = {
  'osumo-content': ['sumo', 'banzuke', 'torikumi', 'rikishi', 'json-api'],
  'osumo-discovery': ['sumo', 'site-map', 'url-resolution', 'navigation'],
};

const EXAMPLES_BY_NAME: Record<string, readonly string[]> = {
  'osumo-content': [
    'https://osada.us/api/v1/banzuke.json の updatedAt を取得して差分更新を判断する',
    'https://osada.us/api/v1/torikumi.json から 202607 場所の 15 日分の取組結果を取得する',
    'https://osada.us/api/v1/rikishi.json から力士の ID と四股名一覧を取得する',
  ],
  'osumo-discovery': [
    '2026 年 7 月場所の番付ページの URL を組み立てる',
    '照ノ富士のプロフィールページ (/rikishi/{id}/) を rikishi.json の ID から解決する',
    '/sitemap.xml と /robots.txt を取得してクロール可能なページ一覧を作る',
  ],
};

/**
 * Convert a `SKILL_MANIFEST` entry into the A2A Agent Card `skills[]` shape.
 * Pure function — exported for direct unit testing and reuse.
 */
export function mapSkillEntryToA2aSkill(
  entry: Omit<AgentSkillEntry, 'digest'>,
): A2aAgentSkill {
  return {
    id: entry.name,
    name: entry.name,
    description: entry.description,
    tags: [...(TAGS_BY_NAME[entry.name] ?? [])],
    examples: [...(EXAMPLES_BY_NAME[entry.name] ?? [])],
  };
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
  // Synchronize the version with package.json and derive skills[] from SKILL_MANIFEST.
  const card: A2aAgentCard = {
    ...template,
    version: packageVersion,
    skills: SKILL_MANIFEST.map(mapSkillEntryToA2aSkill),
  };
  const target = resolve(outRoot, '.well-known/agent-card.json');
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, `${JSON.stringify(card, null, 2)}\n`, 'utf8');
  return { written: target, card };
}
