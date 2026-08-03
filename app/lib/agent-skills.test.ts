import { describe, expect, it } from 'vitest';
import { buildAgentSkillsIndex, computeSha256 } from './agent-skills';
import { resolve } from 'node:path';

describe('agent-skills', () => {
  it('computes a deterministic sha256 for a given payload', () => {
    const payload = '# skill\n';
    expect(computeSha256(payload)).toBe(computeSha256(payload));
    expect(computeSha256(payload)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('builds the index from the public/ SKILL.md files', () => {
    const index = buildAgentSkillsIndex(resolve(process.cwd(), 'public'), '2026-08-03T00:00:00.000Z');

    expect(index.$schema).toContain('agent-skills-discovery-rfc');
    expect(index.generatedAt).toBe('2026-08-03T00:00:00.000Z');
    expect(index.skills).toHaveLength(2);

    const names = index.skills.map((s) => s.name);
    expect(names).toEqual(['osumo-content', 'osumo-discovery']);

    for (const entry of index.skills) {
      expect(entry.type).toBe('skill-md');
      expect(entry.description).toMatch(/\S/);
      expect(entry.url).toMatch(/^https:\/\/osada\.us\/.well-known\/agent-skills\//);
      // RFC v0.2.0: digest must be `sha256:{64-hex-chars}`.
      expect(entry.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it('keeps the digest in sync with the published SKILL.md on disk', () => {
    const index = buildAgentSkillsIndex(resolve(process.cwd(), 'public'));
    const content = index.skills.find((s) => s.name === 'osumo-content');
    expect(content).toBeDefined();
    // Re-hashing the file directly must yield the same digest stored in the
    // index. If the SKILL.md is edited without rerunning the build, this
    // guard fails and the index will need to be regenerated.
    const onDisk = computeSha256(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('node:fs').readFileSync(
        resolve(process.cwd(), 'public/.well-known/agent-skills/osumo-content/SKILL.md'),
      ),
    );
    expect(content?.digest).toBe(`sha256:${onDisk}`);
  });
});