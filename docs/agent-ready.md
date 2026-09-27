# AI Agent Readiness (o-sumo / osada.us)

This document describes the discovery surfaces that o-sumo publishes for AI
agents, the rationale for each one, and the operator-side configuration that
must be applied to DNS so that validators can confirm the site is
agent-friendly.

The application code itself (in `public/.well-known/`, `public/auth.md`, and
`app/lib/webmcp.ts`) ships with the repository. The DNS-AID record and
DNSSEC configuration are **not** committed here because they live in the
Cloudflare DNS zone, not the Pages project.

## Discovery surfaces

| Path | Purpose |
| --- | --- |
| `/.well-known/api-catalog` | RFC 9727 linkset pointing at the public JSON APIs (banzuke, torikumi, rikishi, gyoji, yobidashi). |
| `/.well-known/oauth-protected-resource` | RFC 9728 resource metadata identifying the public JSON API and its documentation. Returns `{ resource, resource_documentation }` — it points agents at `/auth.md` for the metadata-only `agent_auth` declaration. The public APIs require no token. |
| `/.well-known/mcp/server-card.json` | MCP Server Card (SEP-1649). Indicates that no MCP server is hosted, and points agents at the public API catalog and skills index as the alternative discovery surfaces. `serverInfo.version` is synchronized with `package.json` at build time via `vite.config.ts` (`mcpServerCardPlugin`). |
| `/.well-known/agent-card.json` | A2A Agent Card (A2A Protocol v1.0.0 §4.4.1). Published for discovery only — `supportedInterfaces` is non-empty (HTTP+JSON pointing at `/a2a`), but the A2A endpoint returns `-32601 Method not found` for every method because o-sumo has no task state. `skills[]` is derived from `SKILL_MANIFEST` (`app/lib/agent-skills.ts`) via `mapSkillEntryToA2aSkill()` at build time, and `version` is synchronized with `package.json` via `vite.config.ts` (`a2aAgentCardPlugin`). See [docs/agent-card.md](agent-card.md) for the discovery posture. |
| `/.well-known/agent-skills/index.json` | Agent Skills index (RFC v0.2.0). Lists the skills published under `.well-known/agent-skills/`. Generated at build time by `vite.config.ts` (`agentSkillsPlugin`); each entry carries `type: "skill-md"` and `digest: "sha256:{hex}"`. |
| `/.well-known/agent-skills/osumo-content/SKILL.md` | Skill description for fetching public API content (banzuke, torikumi, rikishi, gyoji, yobidashi). |
| `/.well-known/agent-skills/osumo-discovery/SKILL.md` | Resolve current/archived basho, daily and rikishi page URLs from API dates and the sitemap. |
| `/.well-known/http-message-signatures-directory` | Web Bot Auth (IETF WebBotAuth WG) signature directory. Returns a JWKS with at least one Ed25519 public key, signed per RFC 9421 with `tag="http-message-signatures-directory"`. See the dedicated **Web Bot Auth** section below. |
| `/auth.md` | Top-level Auth.md instructions for metadata-only anonymous public access, including registration and claim information URIs and the no-credential constraint. |
| `/index.md`, `/<route>/index.md` | Static Markdown views served with `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`. Satisfies the "Markdown for Agents" check. `index.md` files are pre-rendered at build time by `scripts/build_markdown_views.ts`, so the views work on the Cloudflare Pages Free plan. The matching `functions/_middleware.ts` calls `prefersMarkdown()` (`app/lib/content-negotiation.ts`) to evaluate the `Accept` header per RFC 9110 §12.5.1 and rewrites markdown-positive requests to the pre-rendered `index.md` with the correct `Content-Type`. |

Note: `/.well-known/openid-configuration` was removed in 2026-08-10 (404 expected).
`/.well-known/oauth-authorization-server` is intentionally kept as a
metadata-only discovery surface carrying an `agent_auth` block per
Lesson #5.

The agent-skills index is generated at build time by `vite.config.ts` (see
`agentSkillsPlugin`). The sha256 digests in `index.json` are computed from
the on-disk SKILL.md files, so changing the skill content automatically
updates the digests in `dist/.well-known/agent-skills/index.json` on the next `npm run build`.
The committed public index is a fallback; refresh it from the built index when editing published skills.

The authentication metadata exists for agent discovery, not because o-sumo is
an authorization server. The anonymous registration declaration is
documentation-only: agents access the listed resources without credentials,
and no registration record is stored.

## Content policy and Cloudflare

`public/robots.txt` is the source of the site's policy:
`Content-Signal: ai-train=no, search=yes, ai-input=yes`.
Public read-only JSON APIs, skills, and supported Markdown pages need no credentials.
Agents may use content for search and query-time answers; report the source URL and its update time.
Do not infer permission to train or fine-tune models.

Change the policy in this repository and deploy it. A dashboard change is not required when
Cloudflare serves this file unchanged. If the response contains `BEGIN Cloudflare Managed content`,
review Cloudflare's managed robots.txt configuration and AI Crawl Control so that injected rules
or bot blocks do not conflict with the intended policy. A robots.txt preference is not an access-control rule.
See [Cloudflare managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).

## Markdown coverage and date resolution

The generator covers home, archives, rikishi index, kimarite, analytics, about, monthly
banzuke/results/schedules, and daily results/schedules present in the published datasets.
Monthly and historical dates follow `getAllArchiveRouteConfigs()`; current content is read from
`public/api/v1/torikumi.json`, and historical content uses the application's immutable snapshots.
Daily views include the date, status, mode-specific update time, and bouts; pending days explicitly
state that data is not yet published. Unsupported pages fall back to HTML.

Use `Accept: text/markdown` and verify `Content-Type: text/markdown`. Direct `<route>/index.md`
assets are also available. Middleware rejects HTML asset fallbacks rather than relabeling them as
Markdown. Negotiated responses use `Vary: Accept` and `Cache-Control: private, no-cache, no-transform`.

`bashoId` is a numeric upstream ID. Derive YYYYMM from the first valid 8-digit `pathDate` in
`resultDays` or `scheduleDays`; do not turn an ID such as `637` into a URL. Match today's or
yesterday's `isoDate` in Asia/Tokyo. Use the sitemap for older months, and do not mistake an HTTP
200 SPA fallback for proof that a requested date exists.

The HTTP integration is JSON APIs plus skills. Do not advertise the discovery cards as a working
MCP server or A2A task service. Browser WebMCP, described below, is separate.

## WebMCP

WebMCP is registered from `app/components/WebMcpProvider.tsx` on app mount.
The tools are defined in `app/lib/webmcp.ts`:

- `search_rikishi` — partial-match search against the public rikishi index
- `list_basho` — current and archive basho with their URLs
- `get_banzuke_for_month` — resolve a YYYYMM to the banzuke JSON / page URLs. The accepted month set is derived dynamically from `PAST_BASHO` (`app/lib/archives-data.ts`) via `bashoListForMonthKey()` so that adding a new basho to the source of truth automatically extends the WebMCP tool.
- `get_torikumi_for_day` — resolve a YYYYMMDD to the torikumi / yotei page URL

The provider follows the WebMCP registration priority (per Lesson #4):

1. W3C Draft `document.modelContext.registerTool({ name, description, inputSchema, annotations, execute })` — Chrome 138+
2. `navigator.modelContext.registerTool(...)` — early Chrome builds behind a flag
3. (legacy) `navigator.modelContext.provideContext({ tools: [...] })` — kept for isitagentready.com and pre-138 Chrome

Registration and cleanup are managed with `AbortController.signal` so that
React Strict Mode's double-mount does not duplicate tools. The provider is
defensive: if neither `document.modelContext` nor `navigator.modelContext`
is available (currently Chrome 138+ behind a flag), the call is a no-op and
the rest of the SPA continues to work.

## Web Bot Auth (IETF WebBotAuth WG)

`/.well-known/http-message-signatures-directory` is served by
`functions/.well-known/http-message-signatures-directory.ts`. The handler
returns a JWKS containing at least one Ed25519 public key and signs the
response per RFC 9421 with `tag="http-message-signatures-directory"`,
covering `@authority`. The signing keypair is generated by
`scripts/generate_web_bot_auth_keys.mjs` and committed as
`functions/.well-known/_web-bot-auth-keys.ts`. The shared RFC 9421
primitives (`base64UrlEncode`, `buildSignatureBase`, `buildSignatureParams`,
`formatSignatureHeader`, `formatSignatureInputHeader`) live in
`app/lib/web-bot-auth/rfc9421.ts` so the SPA client signer and this server
function stay in lock-step.

The function is exercised by
`app/lib/__tests__/functions/http-message-signatures-directory.test.ts`,
which calls `onRequestGet` directly with a fixed system time and asserts
the `Content-Type`, `Signature` / `Signature-Input` headers, and the JWKS
shape. The test deliberately lives under `app/lib/__tests__/functions/`
rather than `functions/.well-known/__tests__/` because the Cloudflare Pages
build (wrangler) bundles every `.ts` file under `functions/` — a colocated
Vitest test would pull in `vitest` and break the Pages build.

## DNS-AID (operator-side)

To satisfy the "Publish DNS for AI Discovery (DNS-AID) records" goal, add a
SVCB / HTTPS record to the `osada.us` Cloudflare DNS zone. The record is
not checked into this repository because it is part of the DNS configuration.

### Steps in Cloudflare DNS

1. In the Cloudflare dashboard, open the `osada.us` zone.
2. Add a record with the following values:

   | Field | Value |
   | --- | --- |
   | Type | `HTTPS` (SVCB) |
   | Name | `_index._agents` |
   | TTL | Auto |
   | Priority | `0` (alias mode) |
   | Target | `_index._agents.osada.us.` (or `osada.us.`) |
   | Service parameters | `alpn=h2,h3` |
   | Service parameters | `port=443` |
   | Service parameters | `endpoint=osada.us` |

3. Repeat with `_a2a._agents` if you want to advertise the A2A endpoint as
   well. The published skills index lives at
   `https://osada.us/.well-known/agent-skills/index.json`, so an explicit
   `_a2a` record is optional.
4. Publish the zone.

### DNSSEC

1. In the Cloudflare dashboard, open the `osada.us` zone → **DNS** → **Settings**.
2. Enable **DNSSEC**.
3. Copy the DS record that Cloudflare generates.
4. Add the DS record to the `.us` registry (TLD) so validating resolvers
   can chain trust from the root.

After DNSSEC is enabled, the SVCB record above will be served with the
`AD` (Authenticated Data) flag by validating resolvers, which is the
expected signal for DNS-AID consumers.

## Verifying the deployment

After the site is deployed and the DNS record is published, run the
following checks:

- `curl -i https://osada.us/.well-known/agent-skills/index.json` —
  returns 200 with the skills index JSON.
- `curl -i https://osada.us/auth.md` — returns 200 with
  `Content-Type: text/markdown; charset=utf-8`.
- `curl -i https://osada.us/.well-known/oauth-protected-resource` —
  returns the minimized `{ resource, resource_documentation }` metadata.
- `curl -i https://osada.us/.well-known/openid-configuration` — returns 404
  (removed in 2026-08-10; this is the expected state).
- `curl -i -H 'Accept: text/markdown' https://osada.us/` — returns
  `Content-Type: text/markdown; charset=utf-8` and a `Vary: Accept` header.
- `curl -i -H 'Accept: text/markdown' https://osada.us/20260926-yotei/` —
  returns Markdown for the specified date; also check a result date and a pending day.
- `curl -fsS https://osada.us/robots.txt` — includes `ai-input=yes` without conflicting rules.
- Download each SKILL.md listed in the index and compare its SHA-256 with `digest`.
- `dig +multi _index._agents.osada.us HTTPS` — returns the SVCB record
  with the expected `alpn` and `endpoint` parameters.
- `dig +dnssec osada.us` — the `ad` flag is set when the resolver
  validates DNSSEC.

## Maintenance

- New SKILL.md files should be added under
  `public/.well-known/agent-skills/<skill-name>/SKILL.md`. The next
  add the entry to `SKILL_MANIFEST` in `app/lib/agent-skills.ts`. The next
  `npm run build` regenerates the output index with fresh SHA-256 digests.
- Add new basho data to the application archive/route configuration. Markdown derives
  its monthly routes from that configuration and its daily routes from the datasets.
- The DNS-AID record and DNSSEC configuration are zone-scoped and live in
  Cloudflare DNS, not in this repository.

Last reviewed: 2026-09-26 (AI input policy, date resolution, daily Markdown coverage).
