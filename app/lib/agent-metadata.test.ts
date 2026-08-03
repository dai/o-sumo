import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent discovery metadata', () => {
  const prmPath = resolve(process.cwd(), 'public/.well-known/oauth-protected-resource');
  const prm = JSON.parse(readFileSync(prmPath, 'utf8')) as Record<string, unknown>;
  const asPath = resolve(process.cwd(), 'public/.well-known/oauth-authorization-server');
  const asMeta = JSON.parse(readFileSync(asPath, 'utf8')) as Record<string, unknown>;

  it('publishes metadata for a public, authentication-free resource', () => {
    // RFC 9728 requires `resource`; the remaining fields are optional. Do not
    // claim OAuth capabilities merely to satisfy a discovery scanner.
    expect(prm.resource).toBe('https://osada.us/');
    expect(prm.resource_documentation).toBe('https://osada.us/auth.md');
    expect(prm).not.toHaveProperty('authorization_servers');
    expect(prm).not.toHaveProperty('bearer_methods_supported');
    expect(prm).not.toHaveProperty('scopes_supported');
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
