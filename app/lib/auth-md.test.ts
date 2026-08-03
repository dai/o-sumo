import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('auth.md', () => {
  const content = readFileSync(resolve(process.cwd(), 'public/auth.md'), 'utf8');

  it('starts with an H1 heading containing the string "auth.md"', () => {
    expect(content).toMatch(/^# auth.md$/m);
  });

  it('contains a `## agent_auth` section with a YAML block', () => {
    expect(content).toMatch(/^## agent_auth$/m);
    expect(content).toContain('```yaml');
    // The agent_auth block must open and close with a fenced code block.
    expect(content.indexOf('```yaml')).toBeLessThan(content.indexOf('agent_auth:'));
    expect(content.lastIndexOf('```')).toBeGreaterThan(content.indexOf('```yaml'));
  });

  it('exposes the WorkOS auth.md draft fields inside the agent_auth block', () => {
    // Each field must be present in the YAML block.
    for (const field of [
      'register_uri: null',
      'identity_endpoint: null',
      'claim_endpoint: null',
      'events_endpoint: null',
      'identity_types_supported: []',
      'credential_types: []',
      'assertion_types_supported: []',
      'events_supported: []',
      'scopes_supported: []',
    ]) {
      expect(content).toContain(field);
    }
  });

  it('does not advertise any agent identity or credential type', () => {
    // The lists are intentionally empty, but the field names must remain
    // so scanners can recognize the structure.
    expect(content).toMatch(/identity_types_supported: \[\]/);
    expect(content).toMatch(/credential_types: \[\]/);
    expect(content).toMatch(/assertion_types_supported: \[\]/);
  });
});
