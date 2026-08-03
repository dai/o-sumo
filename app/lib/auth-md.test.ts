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
    // Each field must be present in the YAML block. Scanners such as
    // isitagentready.com look for an explicit `skill` reference plus
    // each registration axis marked either by a concrete value or the
    // literal "not applicable" string when no registration is offered.
    for (const field of [
      'skill: https://osada.us/auth.md',
      'register_uri: not applicable',
      'identity_endpoint: not applicable',
      'claim_endpoint: not applicable',
      'events_endpoint: not applicable',
      'identity_types_supported: not applicable',
      'credential_types: not applicable',
      'assertion_types_supported: not applicable',
      'events_supported: not applicable',
      'scopes_supported: not applicable',
    ]) {
      expect(content).toContain(field);
    }
  });

  it('marks every registration axis as not applicable', () => {
    // No null literals or empty list literals should leak into the
    // YAML block — the WorkOS auth.md draft prefers explicit "not
    // applicable" tokens for fields that have no value.
    expect(content).not.toMatch(/register_uri: null/);
    expect(content).not.toMatch(/identity_endpoint: null/);
    expect(content).not.toMatch(/identity_types_supported: \[\]/);
    expect(content).not.toMatch(/credential_types: \[\]/);
  });
});
