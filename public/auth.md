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
| OAuth Protected Resource Metadata (public only) | `https://osada.us/.well-known/oauth-protected-resource` |
| Sitemap | `https://osada.us/sitemap.xml` |
| robots.txt | `https://osada.us/robots.txt` |
| Markdown content negotiation | send `Accept: text/markdown` |

There are no `register_uri`, `identity_types_supported`, or
`credential_types` to advertise because the site accepts no agent
identity. The `agent_auth` block below follows the WorkOS auth.md
draft, with every list intentionally empty.

## agent_auth

```yaml
agent_auth:
  register_uri: null
  identity_endpoint: null
  claim_endpoint: null
  events_endpoint: null
  identity_types_supported: []
  credential_types: []
  identity_assertion:
    assertion_types_supported: []
  events_supported: []
  scopes_supported: []
  notes: >-
    o-sumo does not authenticate agents. Every endpoint under
    https://osada.us/ is public. The lists above are intentionally
    empty per the WorkOS auth.md spec.
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