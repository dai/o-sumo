import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface AgentSkillEntry {
  name: string;
  type: 'skill-md';
  description: string;
  url: string;
  /** RFC v0.2.0 compliant digest in the form `sha256:{64-hex-chars}`. */
  digest: string;
}

export interface AgentSkillsIndex {
  $schema: string;
  generatedAt: string;
  skills: AgentSkillEntry[];
}

/**
 * Manifest of skills published under /.well-known/agent-skills/.
 * `path` is relative to the `public/` directory and is read at build time
 * to compute the sha256 digest. `url` is the public absolute URL.
 */
const SKILL_MANIFEST: ReadonlyArray<Omit<AgentSkillEntry, 'digest'> & { path: string }> = [
  {
    path: '.well-known/agent-skills/osumo-content/SKILL.md',
    name: 'osumo-content',
    type: 'skill-md',
    description:
      'Fetch official 大相撲 banzuke, torikumi, and rikishi data from the public o-sumo JSON API (https://osada.us/api/v1/*.json).',
    url: 'https://osada.us/.well-known/agent-skills/osumo-content/SKILL.md',
  },
  {
    path: '.well-known/agent-skills/osumo-discovery/SKILL.md',
    name: 'osumo-discovery',
    type: 'skill-md',
    description:
      'Locate the right page on https://osada.us/ for a given basho (YYYYMM), torikumi day (YYYYMMDD), rikishi (id or shikona), kimarite, or analytics view.',
    url: 'https://osada.us/.well-known/agent-skills/osumo-discovery/SKILL.md',
  },
];

const SKILLS_INDEX_SCHEMA = 'https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/skills-index.v0.2.0.json';

export function computeSha256(content: string | Buffer): string {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

export function buildSkillEntry(
  manifest: Omit<AgentSkillEntry, 'digest'> & { path: string },
  publicRoot: string,
): AgentSkillEntry {
  const absolutePath = resolve(publicRoot, manifest.path);
  const hex = computeSha256(readFileSync(absolutePath));
  return {
    name: manifest.name,
    type: manifest.type,
    description: manifest.description,
    url: manifest.url,
    digest: `sha256:${hex}`,
  };
}

export function buildAgentSkillsIndex(
  publicRoot: string,
  generatedAt: string = new Date().toISOString(),
): AgentSkillsIndex {
  return {
    $schema: SKILLS_INDEX_SCHEMA,
    generatedAt,
    skills: SKILL_MANIFEST.map((entry) => buildSkillEntry(entry, publicRoot)),
  };
}