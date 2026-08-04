import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('auth.md', () => {
  const content = readFileSync(resolve(process.cwd(), 'public/auth.md'), 'utf8');
  const yaml = content.match(/```yaml\r?\n([\s\S]*?)\r?\n```/)?.[1];

  it('starts with an H1 heading containing the string "auth.md"', () => {
    expect(content).toMatch(/^# auth.md$/m);
  });

  it('contains a `## agent_auth` section with a YAML block', () => {
    expect(content).toMatch(/^## agent_auth$/m);
    expect(yaml).toBeDefined();
  });

  it('documents anonymous public access as a complete registration method', () => {
    expect(yaml).toBe([
      'agent_auth:',
      '  skill: https://osada.us/auth.md',
      '  register_uri: https://osada.us/auth.md#anonymous-public-access',
      '  claim_uri: https://osada.us/auth.md#claim-and-revocation',
      '  identity_types_supported:',
      '    - anonymous',
      '  anonymous:',
      '    credential_types_supported:',
      '      - none',
    ].join('\n'));

    for (const uri of yaml?.match(/https:\/\/\S+/g) ?? []) {
      expect(new URL(uri).protocol).toBe('https:');
    }
  });

  it('does not advertise credentials or unsupported lifecycle endpoints', () => {
    expect(content).toContain('No account, token, API key, or user claim is created.');
    expect(content).not.toMatch(/revocation_uri:/);
    expect(content).not.toMatch(/identity_endpoint:/);
    expect(content).not.toMatch(/events_endpoint:/);
  });

  it('uses the shared Markdown header rule without duplicating auth.md headers', () => {
    const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');

    expect(headers).toContain('/*.md\n  Content-Type: text/markdown; charset=utf-8');
    expect(headers).not.toMatch(/^\/auth\.md$/m);
  });
});
