import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent discovery metadata', () => {
  const prmPath = resolve(process.cwd(), 'public/.well-known/oauth-protected-resource');
  const prm = JSON.parse(readFileSync(prmPath, 'utf8')) as Record<string, unknown>;

  it('publishes a minimal OAuth Protected Resource Metadata document', () => {
    // RFC 9728 ‡3.2 "Parameters with zero values MUST be omitted."
    expect(prm.resource).toBe('https://osada.us/');
    expect(prm.resource_documentation).toBe('https://osada.us/auth.md');
  });

  it('omits zero-valued arrays from the OAuth Protected Resource Metadata', () => {
    expect(prm).not.toHaveProperty('authorization_servers');
    expect(prm).not.toHaveProperty('bearer_methods_supported');
    expect(prm).not.toHaveProperty('scopes_supported');
  });

  it('does not publish OAuth/OIDC discovery metadata', () => {
    // o-sumo is not an OAuth/OIDC provider. The standard discovery URLs
    // intentionally return 404 so that scanners recognize the absence of
    // an authorization server.
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/openid-configuration'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/oauth-authorization-server'))).toBe(false);
  });
});
