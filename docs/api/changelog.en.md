# API Changelog

[日本語版](./changelog.md)

## 2026-08-17

### Rikishi Comparison And Matchup API

- Rebuilt `/compare/` around exactly two current makuuchi/juryo selections with shikona, kana, romaji, and rank search, URL sync, keyboard operation, and seven comparison metrics
- Added `GET /api/v1/rikishi-matchups.json`, merging pre/post-rename shikona into official rikishi IDs and publishing ordered unique ID pairs with both career win totals from official basho/day profile history
- Replaces the matchup JSON only after all target profiles pass retrieval, ID resolution, and cross-profile consistency checks; partial fetches or parse inconsistencies preserve the last valid file
- At generation time, the official history gives Aonishiki (4230) vs Yoshinofuji (4279) as `1-5`; reversing comparison columns displays `5-1`
- Synced `/.well-known/api-catalog`, the Japanese/English API specifications and READMEs, and the refresh runbook with the new endpoint

### Directory Search IME Input Fix

- Introduced the shared `useDirectorySearchQuery` hook so in-progress IME composition is not pushed into the URL query for rikishi, gyoji/yobidashi, and banzuke directory searches
- Aligns the input field with the URL `q=` and auxiliary filters (rank, heya, shusshin) on Back / Forward navigation
- Kept existing URL filters intact across the four surfaces; verified with focused and full Vitest suites

### Compare Rikishi Career Record And Win Rate Fix

- Extended the rikishi profile generator to interpret both the legacy 通算成績 label and the current 生涯戦歴 label (e.g. `401勝235敗34休` → `401-235-34`)
- Redefined the compare screen win-rate denominator to use only bouts with a decisive winner (kusshi-susumu and fusen-make are excluded)
- Example on `/compare/?ids=…`: Tobizaru (3842) `401-235-34 / 63.1%`, Onosato (4227) `189-69-26 / 73.3%`
- Orphaned detail JSON outside the current index (e.g. `4275.json`) remains as-is; it is not referenced by the compare screen

### Banner Copy Update (Official Directory Release)

- Refreshed the Japanese banner from the 2026-08-12 gyoji/yobidashi directory announcement to the official directory release and its accompanying discovery surfaces
- English banner unchanged — no copy was requested

## 2026-08-13

### July Archive And September Handoff Preparation

- Added immutable TypeScript snapshots for finalized July 2026 (`202607`) torikumi and banzuke data
- Kept monthly HTML routes, metadata, and sitemap entries unique while the public v1 JSON API remains on July
- Synced operations documentation: torikumi workflows are manual-only until the official September banzuke release, while news remains scheduled

## 2026-08-12

### Gyoji And Yobidashi Directories

- Added list APIs for 42 gyoji and 45 yobidashi plus detail APIs keyed by official numeric IDs
- Added a photo-free data contract sourced from the official Japan Sumo Association website
- Added the gyoji and yobidashi list APIs to `/.well-known/api-catalog`

## 2026-08-10

### AI Agent Readiness: Discovery Surface Rebuild

- Migrated the Agent Skills Index to RFC v0.2.0 (`type: "skill-md"` + `digest: "sha256:{hex}"`) and published two SKILL.md files: `osumo-content` and `osumo-discovery`
- Published the MCP Server Card under the new schema (build-time `serverInfo.version` sync via `mcpServerCardPlugin`, `endpoint: null`)
- Removed `/.well-known/openid-configuration` and `/.well-known/oauth-authorization-server`; minimized `/.well-known/oauth-protected-resource` to `{ resource, resource_documentation }`
- Switched Markdown for Agents to a build-time pre-render pipeline and added `Link: </index.md>; rel="alternate"; type="text/markdown"` headers on supported routes
- Refreshed WebMCP to prefer W3C Draft `document.modelContext.registerTool` with a `navigator.modelContext.registerTool` fallback, exposing four tools: `search_rikishi`, `list_basho`, `get_banzuke_for_month`, `get_torikumi_for_day`
- Published the Web Bot Auth directory at `/.well-known/http-message-signatures-directory` with JWKS and RFC 9421 signatures
- Added the WorkOS-shaped `agent_auth` block to `public/auth.md` (`register_uri`, `identity_types_supported: ["anonymous"]`, `anonymous.credential_types_supported: ["none"]`)

## 2026-08-04

### auth.md Agent Registration Metadata

- Documented anonymous, credential-free public access as the registration flow on `public/auth.md`, with a scanner-facing `agent_auth` block
- Aligned Protected Resource Metadata and Authorization Server Metadata with the public, read-only service contract

## 2026-04-30

### Rikishi Image Credit And Banzuke Usage

- Added a MiniMax I2I Generation image-credit note to the `/rikishi/{id}` source section for locally managed profile illustrations
- Updated the banzuke page to prefer `public/images/rikishi/{id}.png` processed images
- Synced `docs/api/v1.en.md`, `README*.md`, `DEVELOPMENT*.md`, `docs/rikishi-profile-refresh-runbook.md`, and `public/images/rikishi/README.md` with the current image workflow

## 2026-04-28

### Rikishi Profile Pages

- Added first-party profile pages at `/rikishi` and `/rikishi/{id}`
- Added links from banzuke and daily torikumi pages to first-party profiles
- Added backward-compatible fields to `public/api/v1/rikishi/{id}.json`: `name`, `yomi`, `currentRank`, `sourceUrl`, and `updatedAt`
- Added the place-by-place profile refresh runbook at `docs/rikishi-profile-refresh-runbook.md`

## 2026-04-28 (Addendum)

### Banzuke Profile Navigation

- Standardized the banzuke "Profile" link to `/rikishi/{id}` (first-party profile page)
- Exposed the external Kyokai profile link only on `/rikishi/{id}` via `sourceUrl`

## 2026-04-27

### Documentation Sync

- Updated `README.md` / `README_en.md` with the `/archives` route and rikishi API endpoint references (`rikishi.json`, `rikishi/{id}.json`)
- Removed stale README references that no longer match the implementation (`app/rikishi/[id]/page.tsx` and `/rikishi/{id}` as a local UI route)
- Updated `DEVELOPMENT.md` / `DEVELOPMENT_en.md` with `--rikishi-only` / `--profile-limit`, `/archives` local URL checks, and archives-related main files
- Added `GET /api/v1/rikishi.json` and `GET /api/v1/rikishi/{id}.json` sections with response shapes/examples to `docs/api/v1.md` / `docs/api/v1.en.md`

## 2026-04-24

### May Basho Update Preparation

- Added the manual update procedure for the May 2026 banzuke release on April 27, 2026 to the README, development guide, and API policy
- Synced documentation with the current `realtime-torikumi-update.yml` state: `workflow_dispatch` only until May 1, 2026
- Normalized May pending-data `isoDate` values to API-format `YYYY-MM-DD` while keeping `pathDate` as `YYYYMMDD`
- Added homepage links to every page header and footer

## 2026-04-14

### Spec And Operations Updates

- Normalized May basho `pending` behavior and unified `statusMessage` values to `結果未更新` / `取組予定未更新`
- Corrected May date coverage to 15 consecutive days (`20260510` - `20260524`)
- Re-enabled cron for realtime result updates (`realtime-torikumi-update.yml`) while keeping daily updates manual (`workflow_dispatch`)
- Synced API docs examples and pending-state wording with current operations

## 2026-03-30

### New Features

- Rikishi profile page at `/rikishi/{id}` - click rikishi names on banzuke page to view
- Washin-modern UI refresh: Shippori Mincho font, refined color palette

### Data Model Extensions

- Extended `Rikishi` interface with: `birthDate`, `height`, `weight`, `shusshin`, `debut`, `careerStats`, `photoUrl`
- Added new `RikishiProfile` interface

### Python Script Updates

- Added `--rikishi-only` option: fetch rikishi profile data only
- Added `--profile-limit N` option: limit number of rikishi profiles to fetch (for testing)

## 2026-03-23

- Updated `README.md` and `README_en.md` to match the current route design, update commands, and GitHub Actions operations
- Updated `DEVELOPMENT.md` to match the current developer commands, update flows, and CI behavior
- Corrected the update schedule in `docs/api/policy.md` to match the workflow implementation
- Updated `docs/api/v1.md` to match live data for `winner`, `dayHead`, `resultUpdatedAt`, `scheduleUpdatedAt`, and `statusMessage`
- Updated the response examples in `docs/api/v1.md` to better reflect the current data in `public/api/v1/*.json`
- Added `docs/api/v1.en.md` as the English API v1 specification
- Added `docs/api/policy.en.md` as the English API policy
- Added `docs/api/changelog.en.md` as the English API changelog
- Added Japanese and English API documentation links to `SKILLS.md`
- Added `SKILLS_en.md` as the English skills index
- Added `DEVELOPMENT_en.md` as the English development guide
- Added a bilingual document index near the top of `README.md` and `README_en.md`
- Synced `skills/osumo-api/SKILL.md` and `skills/osumo-api/references/field-map.md` with the current API v1 specification

## 2026-03-11

- Added `docs/api/v1.md` to document the field specifications for `banzuke.json` and `torikumi.json`
- Added `docs/api/policy.md` to document update frequency, compatibility, and deprecation policy
- Added `skills/osumo-api/SKILL.md` as a Codex-facing usage guide
