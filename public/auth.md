# auth.md

> Authentication & registration metadata for AI agents and integrations
> interacting with `https://osada.us/` (the **o-sumo** public archive).

This site is a **read-only, public, unauthenticated content archive** of
official 大相撲 (Grand Sumo) banzuke, torikumi and rikishi data. It does
**not** expose protected APIs, user accounts, registration flows, or
agent credentials. The fields below describe that surface honestly so AI
agents can short-circuit any onboarding flow they would normally attempt.

---

## Service overview

| Field | Value |
| --- | --- |
| `service` | `o-sumo` |
| `site_url` | `https://osada.us/` |
| `description` | Public archive of official 大相撲 banzuke, torikumi, and rikishi data. |
| `maintainer` | `@dai` (https://github.com/dai/o-sumo) |
| `license` | Source code: MIT. Data: derived from 公益財団法人日本相撲協会 publications. |
| `authentication_required` | `false` |
| `registration_required` | `false` |
| `agent_registration_supported` | `false` |

---

## Endpoints available to agents

| Purpose | URL |
| --- | --- |
| Public API catalog | `https://osada.us/.well-known/api-catalog` |
| Skills discovery index | `https://osada.us/.well-known/agent-skills/index.json` |
| MCP server card (not provided) | `https://osada.us/.well-known/mcp/server-card.json` |
| Authentication metadata (RFC 8414-shaped) | `https://osada.us/.well-known/oauth-authorization-server` |
| Public resource metadata | `https://osada.us/.well-known/oauth-protected-resource` |
| Sitemap | `https://osada.us/sitemap.xml` |
| robots.txt | `https://osada.us/robots.txt` |
| Markdown content negotiation | send `Accept: text/markdown` |

These metadata files do not advertise authorization, token, JWKS, Bearer-token,
client-credentials, or authorization-scope capabilities because none are
implemented. The RFC 8414-shaped document is retained only as a discovery
location for `agent_auth`: it tells agents that registration is not supported
and links back to this documentation. The resource metadata points discovery
clients to that document, but this reference does not imply that a token or
authorization flow is available.

There are no applicable `register_uri`, `identity_types_supported`, or
`credential_types` because the site accepts no agent identity. The `agent_auth`
block below records those registration axes as `not applicable` rather than
claiming an authentication feature exists.

## agent_auth

```yaml
agent_auth:
  skill: https://osada.us/auth.md
  register_uri: not applicable
  identity_endpoint: not applicable
  claim_endpoint: not applicable
  events_endpoint: not applicable
  identity_types_supported: not applicable
  credential_types: not applicable
  identity_assertion:
    assertion_types_supported: not applicable
  events_supported: not applicable
  scopes_supported: not applicable
  notes: >-
    o-sumo does not authenticate agents. Every endpoint under
    https://osada.us/ is public. The fields above are intentionally
    marked "not applicable" because no agent registration, identity
    assertion, or scope negotiation is supported.
```

---

## Contact

For questions, bug reports, or data corrections please use one of the
public channels below. **Do not** send credentials, tokens, or any
private key material — none of these channels accept them.

| Channel | URL |
| --- | --- |
| GitHub Issues | https://github.com/dai/o-sumo/issues |
| GitHub Discussions | https://github.com/dai/o-sumo/discussions |
| Repository | https://github.com/dai/o-sumo |
| Maintainer profile | https://github.com/dai |

---

## Rate limits

Cloudflare's default edge protections apply. Heavy batch consumers
should respect the sitemap and the public JSON API surface
(`/api/v1/*.json`) instead of scraping rendered HTML.

## Changelog

- 2026-08-03 — Initial publication. Site has no protected APIs.
