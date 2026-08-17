# o-sumo Skills

[日本語版](./SKILLS.md)

This repository publishes the following skill documents. SKILL.md files are distributed under `public/.well-known/agent-skills/` in the Agent Skills Discovery RFC v0.2.0 format, and `agentSkillsPlugin` regenerates `index.json` at build time.

## Published Skills

The two SKILL.md files currently published under `public/.well-known/agent-skills/`:

### `osumo-content`

- Location: `public/.well-known/agent-skills/osumo-content/SKILL.md`
- Purpose: conventions for agents that access the public banzuke, torikumi, rikishi, gyoji, and yobidashi datasets
- Main use cases:
  - individual rikishi, gyoji, and yobidashi profiles
  - banzuke, results, schedules, and past archives
  - publication rules (sources, updated-at, no photographs)

### `osumo-discovery`

- Location: `public/.well-known/agent-skills/osumo-discovery/SKILL.md`
- Purpose: how to read the discovery surfaces (`api-catalog`, `mcp-server-card`, `agent-skills`, `web-bot-auth`, etc.)
- Main use cases:
  - `public/.well-known/api-catalog` (RFC 9727 linkset)
  - `public/.well-known/mcp/server-card.json` (SEP-1649)
  - `public/.well-known/agent-skills/index.json` (RFC v0.2.0)
  - `public/.well-known/http-message-signatures-directory` (Web Bot Auth)
  - `auth.md` (anonymous, credential-free public access)

To add a new skill, drop `public/.well-known/agent-skills/<skill>/SKILL.md` and the next build will refresh `index.json` automatically.

## Internal Skill

The following skill is published for internal repository development.

### `osumo-api`

- Location: `skills/osumo-api/SKILL.md`
- Purpose: guide for fetching, parsing, and integrating the o-sumo public API (`/api/v1/banzuke.json`, `/api/v1/torikumi.json`)
- Main use cases:
  - consuming banzuke data
  - consuming 15-day torikumi result and schedule data
  - handling `pending` days correctly

See `skills/osumo-api/references/field-map.md` for field details.

Related API docs:

- Japanese spec: `docs/api/v1.md`
- English spec: `docs/api/v1.en.md`
- Japanese policy: `docs/api/policy.md`
- English policy: `docs/api/policy.en.md`
- Japanese changelog: `docs/api/changelog.md`
- English changelog: `docs/api/changelog.en.md`
- AI Agent readiness summary: `docs/agent-ready.md`
- A2A Agent Card: `docs/agent-card.md`
- Gyoji/yobidashi refresh runbook: `docs/official-profile-refresh-runbook.md`
