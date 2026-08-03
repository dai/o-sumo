import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent discovery metadata', () => {
  const prmPath = resolve(process.cwd(), 'public/.well-known/oauth-protected-resource');
  const prm = JSON.parse(readFileSync(prmPath, 'utf8')) as Record<string, unknown>;

  it('publishes a self-issued OAuth Protected Resource Metadata document', () => {
    // RFC 9728 ‡2 requires `resource`; the rest are optional but scanners
    // such as isitagentready.com require `authorization_servers` to be
    // present (even if self-issued) plus `bearer_methods_supported` and
    // `scopes_supported` for a full pass.
    expect(prm.resource).toBe('https://osada.us/');
    expect(prm.resource_documentation).toBe('https://osada.us/auth.md');
  });

  it('advertises a self-issued authorization server and bearer method support', () => {
    expect(prm.authorization_servers).toEqual(['https://osada.us/']);
    expect(prm.bearer_methods_supported).toContain('header');
    expect(prm.scopes_supported).toContain('public');
  });

  it('does not publish OAuth/OIDC discovery metadata', () => {
    // o-sumo is not an OAuth/OIDC provider. The standard discovery URLs
    // intentionally return 404 so that scanners recognize the absence of
    // an authorization server.
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/openid-configuration'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/oauth-authorization-server'))).toBe(false);
  });
});
