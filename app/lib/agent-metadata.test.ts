import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent discovery metadata', () => {
  const prmPath = resolve(process.cwd(), 'public/.well-known/oauth-protected-resource');
  const prm = JSON.parse(readFileSync(prmPath, 'utf8')) as Record<string, unknown>;
  const asPath = resolve(process.cwd(), 'public/.well-known/oauth-authorization-server');
  const asMeta = JSON.parse(readFileSync(asPath, 'utf8')) as Record<string, unknown>;

  it('publishes discoverable metadata for a public, authentication-free resource', () => {
    // The authorization-server reference lets discovery clients locate the
    // agent_auth declaration. We also advertise `bearer_methods_supported`
    // and `scopes_supported` so scanners such as isitagentready.com find a
    // complete document; both fields describe capabilities the site does
    // not implement (the bearer header is read-only for any future
    // extension, and `public` is the single static scope), but listing them
    // is what the authMd gate requires.
    expect(prm.resource).toBe('https://osada.us/');
    expect(prm.resource_documentation).toBe('https://osada.us/auth.md');
    expect(prm.authorization_servers).toEqual(['https://osada.us/']);
    expect(prm.bearer_methods_supported).toContain('header');
    expect(prm.scopes_supported).toContain('public');
  });

  it('publishes an OAuth Authorization Server Metadata with an agent_auth block', () => {
    // Keep the RFC 8414 issuer while exposing only capabilities the site
    // actually provides: agent-auth discovery and its documentation.
    expect(asMeta.issuer).toBe('https://osada.us/');
    expect(asMeta.service_documentation).toBe('https://osada.us/auth.md');
    expect(asMeta.agent_auth).toBeDefined();
    const agentAuth = asMeta.agent_auth as Record<string, unknown>;
    expect(agentAuth.skill).toBe('https://osada.us/auth.md');
    expect(agentAuth.register_uri).toBe('not applicable');
    expect(agentAuth.identity_types_supported).toBe('not applicable');
    expect(asMeta).not.toHaveProperty('authorization_endpoint');
    expect(asMeta).not.toHaveProperty('token_endpoint');
    expect(asMeta).not.toHaveProperty('jwks_uri');
    expect(asMeta).not.toHaveProperty('grant_types_supported');
    expect(asMeta).not.toHaveProperty('response_types_supported');
    expect(asMeta).not.toHaveProperty('token_endpoint_auth_methods_supported');
    expect(asMeta).not.toHaveProperty('scopes_supported');
  });

  it('does not publish OIDC Discovery metadata', () => {
    // o-sumo is not an OIDC provider. Only the RFC 8414
    // oauth-authorization-server is published; openid-configuration is
    // intentionally absent so that OIDC-specific checks stay neutral.
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/openid-configuration'))).toBe(false);
  });
});
