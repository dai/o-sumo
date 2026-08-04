# auth.md

You are an agent accessing **o-sumo**, a public, read-only archive of Grand
Sumo banzuke, torikumi, and rikishi data. This service supports anonymous
public access. Registration is documentation-only because no account or
credential is required.

## Discover

1. Fetch `https://osada.us/.well-known/oauth-protected-resource`.
2. Fetch the advertised authorization server metadata at
   `https://osada.us/.well-known/oauth-authorization-server`.
3. Read its `agent_auth` block and use the only supported identity type:
   `anonymous`.

The protected resource metadata advertises the `public` scope. The APIs remain
public and do not require an `Authorization` header.

## Anonymous public access

`https://osada.us/auth.md#anonymous-public-access` is the registration URI.
Reading this section completes registration:

1. Do not send user identity, email, assertions, secrets, or credentials.
2. Use credential type `none`.
3. Fetch `https://osada.us/.well-known/api-catalog` to discover the public JSON
   endpoints.
4. Call those endpoints directly with ordinary HTTPS GET or HEAD requests.

No account, token, API key, or user claim is created. Registration has no
server-side state and grants only the same public, read-only access available
to every visitor.

## Claim and revocation

`https://osada.us/auth.md#claim-and-revocation` is the claim information URI.
Anonymous public access has no owner, credential, or server-side registration
record, so there is nothing to claim or revoke. Do not send claim or revocation
requests.

## agent_auth

```yaml
agent_auth:
  skill: https://osada.us/auth.md
  register_uri: https://osada.us/auth.md#anonymous-public-access
  claim_uri: https://osada.us/auth.md#claim-and-revocation
  identity_types_supported:
    - anonymous
  anonymous:
    credential_types_supported:
      - none
```

## Public endpoints

| Purpose | URL |
| --- | --- |
| API catalog | `https://osada.us/.well-known/api-catalog` |
| Protected Resource Metadata | `https://osada.us/.well-known/oauth-protected-resource` |
| Authorization Server Metadata | `https://osada.us/.well-known/oauth-authorization-server` |
| Agent Skills | `https://osada.us/.well-known/agent-skills/index.json` |
| Sitemap | `https://osada.us/sitemap.xml` |

## Contact

Use [GitHub Issues](https://github.com/dai/o-sumo/issues) for bugs and data
corrections. Do not send credentials or private key material.

## Changelog

- 2026-08-04 — Published anonymous public-access registration metadata.
