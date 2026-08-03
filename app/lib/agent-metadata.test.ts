import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent discovery metadata', () => {
  const prmPath = resolve(process.cwd(), 'public/.well-known/oauth-protected-resource');
  const prm = JSON.parse(readFileSync(prmPath, 'utf8')) as Record<string, unknown>;
  const asPath = resolve(process.cwd(), 'public/.well-known/oauth-authorization-server');
  const asMeta = JSON.parse(readFileSync(asPath, 'utf8')) as Record<string, unknown>;

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

  it('publishes an OAuth Authorization Server Metadata with an agent_auth block', () => {
    // RFC 8414 requires `issuer`, `authorization_endpoint`, `token_endpoint`,
    // `jwks_uri`, `grant_types_supported`, `response_types_supported`.
    // isitagentready.com additionally requires an `agent_auth` block to be
    // present in the same document so that the auth.md check can verify
    // registration axes.
    expect(asMeta.issuer).toBe('https://osada.us/');
    expect(asMeta.authorization_endpoint).toBe('https://osada.us/');
    expect(asMeta.token_endpoint).toBe('https://osada.us/');
    expect(asMeta.jwks_uri).toBe('https://osada.us/.well-known/jwks.json');
    expect(asMeta.grant_types_supported).toContain('client_credentials');
    expect(asMeta.response_types_supported).toContain('token');
    expect(asMeta.agent_auth).toBeDefined();
    const agentAuth = asMeta.agent_auth as Record<string, unknown>;
    expect(agentAuth.skill).toBe('https://osada.us/auth.md');
    expect(agentAuth.identity_types_supported).toBe('not applicable');
  });

  it('does not publish OIDC Discovery metadata', () => {
    // o-sumo is not an OIDC provider. Only the RFC 8414
    // oauth-authorization-server is published; openid-configuration is
    // intentionally absent so that OIDC-specific checks stay neutral.
    expect(existsSync(resolve(process.cwd(), 'public/.well-known/openid-configuration'))).toBe(false);
  });
});
