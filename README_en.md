# o-sumo

Agent readiness status is available [here](https://isitagentready.com/osada.us).

[日本語 README](./README.md)

o-sumo is a web app for publishing sumo banzuke, torikumi, and rikishi, gyoji, and yobidashi directories. Built with React 19, TypeScript, and Vite, it serves the site and JSON APIs from Cloudflare Pages. Agents can also use MCP, browser WebMCP, Markdown views, and discovery metadata.

Sumo data has been available to end users through MCP since November 4, 2026. [Setup guide](./mcp/README.md#english)

## Table of Contents

- [Document Index](#document-index)
- [Overview](#overview)
- [Access for AI agents](#access-for-ai-agents)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Data Updates](#data-updates)
- [Automated Updates](#automated-updates)
- [Testing](#testing)
- [Cloudflare Pages](#cloudflare-pages)
- [November 2026 Basho Operations](#november-2026-basho-operations)
- [Important Files](#important-files)
- [Contact](#contact)
- [License](#license)
- [Download](#download)

## Document Index

- README: [README.md](./README.md) / [README_en.md](./README_en.md)
- Development guide: [DEVELOPMENT.md](./DEVELOPMENT.md) / [DEVELOPMENT_en.md](./DEVELOPMENT_en.md)
- MCP integration kit: [mcp/README.md](./mcp/README.md)
- Skills index: [SKILLS.md](./SKILLS.md) / [SKILLS_en.md](./SKILLS_en.md)
- API spec: [docs/api/v1.md](./docs/api/v1.md) / [docs/api/v1.en.md](./docs/api/v1.en.md)
- API policy: [docs/api/policy.md](./docs/api/policy.md) / [docs/api/policy.en.md](./docs/api/policy.en.md)
- API changelog: [docs/api/changelog.md](./docs/api/changelog.md) / [docs/api/changelog.en.md](./docs/api/changelog.en.md)
- Rikishi profile and matchup refresh runbook: [docs/rikishi-profile-refresh-runbook.md](./docs/rikishi-profile-refresh-runbook.md)
- Gyoji and yobidashi refresh runbook: [docs/official-profile-refresh-runbook.md](./docs/official-profile-refresh-runbook.md)
- Agent guide: [docs/agent-ready.md](./docs/agent-ready.md)

## Overview

- Web routes:
  - Homepage: `/`
  - Archives: `/archives`
  - Rikishi list: `/rikishi`
  - Rikishi profile: `/rikishi/{id}`
  - My Rikishi: `/my-rikishi/`
  - Privacy policy: `/privacy/`
  - Compare Rikishi: `/compare/?ids={id1},{id2}`
  - Gyoji directory: `/gyoji/`
  - Gyoji profile: `/gyoji/{id}/`
  - Yobidashi directory: `/yobidashi/`
  - Yobidashi profile: `/yobidashi/{id}/`
  - Banzuke: `/{YYYYMM}-banzuke/`
  - Results hub: `/{YYYYMM}-torikumi`
  - Schedule hub: `/{YYYYMM}-yotei`
  - Daily result: `/{YYYYMMDD}-torikumi`
  - Daily schedule: `/{YYYYMMDD}-yotei`
  - Kimarite: `/kimarite`
  - Basho analytics: `/analytics/`
- Current route examples:
  - `/202611-banzuke/`
  - `/202611-torikumi/`
  - `/20261108-yotei/`
  - `/compare/?ids=3842,4227`
  - `/kimarite`
- Stories: `https://blog.osada.us/`
- Supported legacy banzuke URLs such as `/202609-o-sumo/` resolve to the matching monthly banzuke. Retired archive URLs such as `/archives/cat11/` return HTTP 410.
- Public APIs:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`
  - `/api/v1/rikishi.json`
  - `/api/v1/rikishi/{id}.json`
  - `/api/v1/rikishi-matchups.json`
  - `/api/v1/gyoji.json`
  - `/api/v1/gyoji/{id}.json`
  - `/api/v1/yobidashi.json`
  - `/api/v1/yobidashi/{id}.json`
  - `/api/v1/news.json`
  - `/api/v1/blog.json`

Related docs:

- `docs/api/v1.en.md`
- `docs/api/v1.md`
- `docs/api/policy.en.md`
- `docs/api/policy.md`
- `docs/api/changelog.en.md`
- `docs/api/changelog.md`
- `DEVELOPMENT_en.md`
- `DEVELOPMENT.md`

Skill publishing:

- `SKILLS_en.md`
- `SKILLS.md`
- `public/.well-known/agent-skills/osumo-content/SKILL.md`
- `public/.well-known/agent-skills/osumo-discovery/SKILL.md`
- `skills/osumo-api/SKILL.md`

## Access for AI agents

Start with the [English agent guide](https://osada.us/agents/en), then choose your client in the [MCP setup guide](./mcp/README.md#english) or consult the [JSON API reference](./docs/api/v1.en.md). The public JSON API, published skills, and structured MCP require no o-sumo account or API key.
Search and query-time grounding are permitted; model training is not (`search=yes, ai-input=yes, ai-train=no`).

| Goal | Entry point |
| --- | --- |
| Discover APIs | [Public JSON API guide](https://osada.us/agents/en#api) |
| Query banzuke, torikumi, and rikishi with tools | [Sumo data MCP integration kit](https://github.com/dai/o-sumo/tree/main/mcp) |
| Search articles and profiles in natural language | [AI Search MCP guide](https://osada.us/agents/en#search) |
| Learn data access and page URL resolution | [Agent Skills guide](https://osada.us/agents/en#skills) |
| Check authentication | [Usage and authentication guide](https://osada.us/agents/en#policy) |
| Check coverage and operations | [Agent guide](https://github.com/dai/o-sumo/blob/main/docs/agent-ready.md) |

The table links to pages for people. Machine-readable URLs are listed on the guide page.

`torikumi.json.bashoId` is an upstream numeric ID, not YYYYMM. Derive the month from `pathDate`,
and read the separate schedule/result statuses and timestamps. Home, main indexes, monthly pages,
and daily schedule/result pages present in the published datasets support `Accept: text/markdown`.
Unsupported routes, including individual profile pages, fall back to HTML.

The read-only sumo data server uses Streamable HTTP (`https://osada.us/mcp`) and exposes `search_rikishi`,
`get_rikishi_profile`, `get_banzuke`, `get_torikumi`, and `list_basho`.
The [client setup guide](./mcp/README.md#english) lists connection methods and labels developer templates.
The AI Search endpoint exposes a `search` tool for natural-language queries.

```bash
curl -fsS https://osada.us/.well-known/agent-skills/index.json
curl -fsS https://osada.us/mcp/server-card
curl -fsS https://osada.us/api/v1/torikumi.json
curl -i -H 'Accept: text/markdown' https://osada.us/20261108-yotei/
```

Supported browsers also register four WebMCP tools within the page: `search_rikishi`,
`list_basho`, `get_banzuke_for_month`, and `get_torikumi_for_day`. This is separate from
the remote MCP endpoints above. The A2A card is for discovery; task operations are not implemented.

## Key Features

- Direct navigation from the homepage to `Banzuke / Schedule / Results / Rikishi Directory / Gyoji Directory / Yobidashi Directory / My Rikishi / Compare Rikishi / Basho Analytics`
- **Today's Highlights (Featured Matchups)**:
  - Prominently featured right below the Hero on the homepage with 1-2 curated matchups for the day
  - Displays East vs West bout cards, shikona, rank badges, deterministic avatars, **Aikuchi (head-to-head record and two-tone win rate bar)**, insightful bout preview commentary, and one-tap direct links to the Rikishi Comparison page
  - Generated automatically from the official musubi bout on days with published torikumi data; hand-written static matchups, fixed descriptions, and hand-curated head-to-head records have been removed
  - On days without an official torikumi, renders only a neutral "Today's Highlights / Awaiting Official Bouts / Featured bouts, aikuchi, and comparison links will appear after the official torikumi is published." notice — no rikishi names, articles, aikuchi, comparison/bout links, or commentary box
  - Aikuchi is sourced exclusively from `/api/v1/rikishi-matchups.json` (pre-aggregated from official profile history) and is only shown when the JSON loads successfully. On failure the aikuchi block is hidden while comparison and bout links remain available
- **Revamped Rikishi Comparison (`/compare/?ids={id1},{id2}`)**:
  - Highlights **Aikuchi (Head-to-Head Record / Compatibility)** as the primary hero scoreboard with score, win rate, contextual lead badge, and two-tone ratio meter
  - East vs West graphical faceoff card (rank, avatar, current basho win-loss record)
  - Physical stats visual comparison bars (height, weight, career win rate) with advantage indicators
  - Top winning techniques (Kimarite) side-by-side ranking dynamically aggregated from tournament archives
  - Quick-pick matchup presets (Yokozuna, Ozeki, Sekiwake, Sanyaku rivalries) and one-tap selection for saved My Rikishi pairs
- Bilingual lists and profiles for 42 active gyoji and 45 active yobidashi, sourced from the official Japan Sumo Association website. Official numeric IDs are used in page and JSON API URLs, and no photographs are published
- Banzuke pages for makuuchi and juryo rankings and records, with MiniMax I2I Generation processed rikishi profile images and links to rikishi profiles
- My Rikishi (`/my-rikishi/`) stores up to 10 wrestlers by shikona with navigation count badges, URL synchronisation, `localStorage` persistence, and optional Google sign-in cloud sync across devices. The “My Rikishi only” filter on daily torikumi pages remembers its setting on the device and lets you share matching bouts on X
- Basho analytics (`/analytics/`) shows makuuchi yusho, jun-yusho, kanto-sho, gin-o-sho, and juryo yusho for the current basho
- The `ShareCurrentLink` button copies the current URL to the clipboard (with a manual fallback for non-secure contexts)
- Monthly hub pages listing all 15 daily pages
- Daily pages for makuuchi and juryo torikumi, with profile links on wrestler names
- `ascending / descending` sorting on banzuke, hub, and daily pages
- Unpublished days remain available as `pending` pages with empty-state messaging
- The month key is derived dynamically from generated data in `app/lib/torikumi-data.ts`
- Homepage **Latest News** section split into two sub-sections: Japan Sumo Association announcements and Sumo World News (latest 5 from dmenu Sports)
- Homepage **Kimarite** card links to the `/kimarite` index page that lists all 82 winning techniques, grouped by category with bilingual Japanese/English commentary
- News JSON is regenerated automatically by the `news-feed-update` GitHub Actions workflow via the Python scraper (`/api/v1/news.json`)
- Stories are managed as Japanese Markdown posts in `blog/posts/*.md`. Run `npm run blog:build` to generate the standalone `blog.osada.us` output in `dist-blog/` and refresh `/api/v1/blog.json` for homepage integration
- Four WebMCP tools (`search_rikishi`, `list_basho`, `get_banzuke_for_month`, `get_torikumi_for_day`) are exposed for AI agents running in supported browsers (prefers `document.modelContext.registerTool` from the W3C Draft, falls back to `navigator.modelContext.registerTool`)

## Tech Stack

- Frontend: React 19, TypeScript, React Router, Vite
- Testing: Vitest, Testing Library, jsdom
- Data generation: Python (`scripts/update_sumo_data.py`, `scripts/update_official_profiles.py`)
- Hosting: Cloudflare Pages
- Data sources: Japan Sumo Association Ajax endpoints and the official gyoji/yobidashi member list and profile pages
- Rikishi imagery: local PNG illustrations processed with MiniMax I2I Generation from Japan Sumo Association profile photos
- News sources: Japan Sumo Association announcements page and dmenu Sports (`https://sumo.sports.smt.docomo.ne.jp/news/`)

## Local Development

Requirements:

- Node.js 20.19+ or 22.12+
- npm 9+
- Python 3.10+

Setup:

```bash
git clone https://github.com/dai/o-sumo.git
cd o-sumo
npm install
```

Notes:

- `package-lock.json` is committed
- Use `npm install` for the initial setup
- Use `npm ci` for reproducible reinstalls and CI

Main commands:

```bash
# Dev server
npm run dev

# Type checking
npm run typecheck

# Tests
npm test

# Production build
npm run build

# Read-only current-data switch preflight
npm run preflight:current-data

# Local preview of the built app
npm run preview

# Generate the Stories site output
npm run blog:generate
```

Useful local URLs:

- `http://localhost:3001/`
- `http://localhost:3001/archives`
- `http://localhost:3001/rikishi`
- `http://localhost:3001/rikishi/{id}`
- `http://localhost:3001/my-rikishi/`
- `http://localhost:3001/compare/?ids={id1},{id2}`
- `http://localhost:3001/gyoji/`
- `http://localhost:3001/gyoji/{id}/`
- `http://localhost:3001/yobidashi/`
- `http://localhost:3001/yobidashi/{id}/`
- `http://localhost:3001/{YYYYMM}-banzuke/`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`
- `http://localhost:3001/kimarite`
- `http://localhost:3001/analytics/`
- `http://localhost:3001/api/v1/rikishi-matchups.json`
- `http://localhost:3001/api/v1/news.json`

## Data Updates

Full refresh (banzuke + torikumi + rikishi profiles):

```bash
python scripts/update_sumo_data.py
```

Rikishi profiles only:

```bash
python scripts/update_sumo_data.py --rikishi-only
```

This full-profile refresh also generates `rikishi-matchups.json`, resolving shikona before and after name changes to official rikishi IDs. The file is replaced only after all target profiles pass retrieval, ID resolution, and cross-profile consistency checks; partial fetches and parse failures preserve the last valid file. See `docs/rikishi-profile-refresh-runbook.md` for pre-publish checks.

Rikishi profiles only, limited to the first 10 profiles (for testing):

```bash
python scripts/update_sumo_data.py --rikishi-only --profile-limit 10
```

Torikumi-only refresh:

```bash
python scripts/update_sumo_data.py --torikumi-only
```

Results-only or schedule-only refresh:

```bash
python scripts/update_sumo_data.py --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-scope schedule
```

Torikumi-only plus scoped refresh:

```bash
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope result
python scripts/update_sumo_data.py --torikumi-only --torikumi-scope schedule
```

News feed only (Japan Sumo Association announcements + dmenu Sports):

```bash
python scripts/update_news_feed.py
```

Gyoji and yobidashi directories only, sourced from the official Japan Sumo Association website:

```bash
python scripts/update_official_profiles.py
python scripts/update_official_profiles_test.py
```

See `docs/official-profile-refresh-runbook.md` for generated-file and pre-publish integrity checks.

The September basho is final and retained as immutable snapshots in `app/lib/september2026-data.ts` and `app/lib/september2026-banzuke-data.ts`. The current `/api/v1/banzuke.json` and `/api/v1/torikumi.json` serve November; September remains available as an archive.

Run `npm run preflight:current-data` before switching current data. It fetches the official annual schedule and banzuke, then checks current banzuke/torikumi, archives, routes, sitemap, and workflow consistency without writing files. The November 2026 switch used `--current-month 202609 --target-month 202611`. It prints `READY` and exits 0 only when every gate is `[OK]`; official publication/fetch failures and contract mismatches print `BLOCKED` and exit 1. The generator is not run, and data, routes, sitemap, redirects, and workflow schedules are not changed.

To check a different basho month, pass arguments after `--` so npm forwards them to the script: `npm run preflight:current-data -- --current-month YYYYMM --target-month YYYYMM` (npm 8+). You can also invoke the script directly: `python scripts/preflight_current_basho.py --current-month YYYYMM --target-month YYYYMM`. The npm script keeps the hard-coded defaults, so subsequent switches must specify the months explicitly.

For the next basho switch, preserve the current November data and the immutable September snapshots, and switch banzuke, torikumi, public JSON, monthly routes, and sitemap together only after validating the new official data.

Generated outputs:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `app/lib/news-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`
- `public/api/v1/rikishi.json`
- `public/api/v1/rikishi/{id}.json` (one file per rikishi, including `name`, `yomi`, `currentRank`, `sourceUrl`, and `updatedAt`)
- `public/api/v1/rikishi-matchups.json` (unique official ID pairs and both career win totals derived from profile history)
- `public/api/v1/news.json`
- `public/api/v1/gyoji.json` / `public/api/v1/gyoji/{id}.json` (42 gyoji)
- `public/api/v1/yobidashi.json` / `public/api/v1/yobidashi/{id}.json` (45 yobidashi)
- `public/images/rikishi/{id}.png` (processed profile illustrations for all rikishi, used permanently on both profile and banzuke pages)

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- 15-day archives for both results and schedules
- Published days are populated from source data when available
- Unpublished days remain as `pending` placeholders
- Gyoji and yobidashi list/detail JSON counts match and contain no image fields

## Automated Updates

GitHub Actions runs separate jobs for torikumi schedules, results, and news. All three use the shared `data-update.yml` workflow to validate changes and publish directly to `main`.

Shared helpers under `scripts/ci/`:

- `run_torikumi_generator.sh` — runs `update_sumo_data.py` with up to two retries
- `validate_torikumi.py` — schema check for `public/api/v1/torikumi.json`
- `validate_news.py` — schema check for `public/api/v1/news.json`
- `notify_discord.sh` — posts a Discord notification when `DISCORD_WEBHOOK_URL` is configured

Workflows:

- Daily update: `.github/workflows/daily-data-update.yml`
  - current trigger: `workflow_dispatch`
  - updates torikumi schedules only (`--torikumi-only --torikumi-scope schedule`)
- Realtime results update: `.github/workflows/realtime-torikumi-direct-update.yml`
  - current trigger: `workflow_dispatch`
  - updates torikumi results only (`--torikumi-only --torikumi-scope result --skip-rikishi-fetch --strict-torikumi-fetch`)
  - logs: GitHub Actions job summary aggregates step results, commit state, and the run URL
- News update: `.github/workflows/news-feed-update.yml`
  - schedule: twice daily at JST 09:05 and 19:05 (publication on the 19:05 run)
  - updates Japan Sumo Association and dmenu Sports news (`python scripts/update_news_feed.py`)
  - skips rewriting `news.json` when the selected feed is unchanged
  - Fetch state is stored on `automation/news-state`. The validated snapshot selected for publication is committed to `main`.

## Testing

- test runner: Vitest
- component testing: Testing Library
- workflow: `.github/workflows/test.yml`

Current main coverage:

- routing helpers in `app/lib/torikumi-routes.ts`
- sorting helpers in `app/lib/sorting.ts`
- kimarite 82-entry master in `app/lib/kimarite-data.ts`
- homepage navigation
- homepage news section (Japan Sumo Association + Sumo World News split sections, empty states, see-all links)
- banzuke sorting
- 15-day hub rendering and sorting
- daily torikumi sorting and pending-state rendering
- gyoji/yobidashi lists and profiles, bilingual ranks, official numeric IDs, API paths, dynamic metadata, and sitemap entries
- My Rikishi toggle, list, IME input correction, and URL synchronisation
- Compare Rikishi (exactly two wrestlers) search, URL sync, seven metrics, and head-to-head results from both display perspectives
- Basho analytics (`/analytics/`) makuuchi awards, special prizes, and juryo yusho
- `WebMcpProvider` four-tool registration with `document.modelContext.registerTool` / `navigator.modelContext.registerTool`

GitHub Actions runs the following on pull requests and pushes to `main`, `codex/**`, and `automation/data-updates`:

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Cloudflare Pages

- Production URL: `https://osada.us`
- SPA fallback file: `public/_redirects` (app routes only; `/api/v1/*` serves static JSON as-is)
- Direct access to date-based URLs falls back to `index.html`

## November 2026 Basho Operations

- The current APIs have switched to November; keep the September TypeScript snapshots immutable as archives.
- Schedule and result workflows currently run on manual dispatch. See the [basho scheduling runbook](./scripts/ci/README.md) for enabling cron on `main`. GitHub Actions runs can be delayed, or skipped.
- After the official torikumi publication around November 6, run `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main`, watch the run, then verify the published commit, the JSON on `main`, and production JSON. If both divisions are empty before the official announcement, the run ends without publishing new data.
- If cron is enabled for the basho, remove both schedules in a separate PR after the November 22 final results and next-day verification. Verify the published commit and deployment separately from the workflow summary.
- `preflight:current-data` is a transition-only safety gate that requires paused workflows, not an in-tournament readiness check. The validator permits only the precise fusen exception and generation preserves old data on partial fetch failure.
- The news workflow remains scheduled twice daily at JST 09:05 and 19:05.
- Manual runs can be started with `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main`, `gh workflow run realtime-torikumi-direct-update.yml -R dai/o-sumo --ref main`, or `gh workflow run news-feed-update.yml -R dai/o-sumo --ref main`.
- The realtime workflow uses `--torikumi-only --torikumi-scope result --skip-rikishi-fetch`, so it is limited to torikumi results.
- If results still look stale, triage in this order: run history -> run logs (`event.schedule`, JST time, updatedAt fields) -> upstream `judge` values.
- Keep the cache policy in `public/_headers` unchanged to control Cloudflare usage:
  - `/assets/*`: `public, max-age=31536000, immutable`
  - `/manifest.webmanifest`: `public, max-age=3600`
  - `/sw.js`: `public, max-age=0, must-revalidate`
  - `/`: `public, max-age=300`
- Keep the PWA Service Worker on `registerType: "autoUpdate"` so updates are applied automatically.

## Important Files

- `app/main.tsx`: route definitions
- `app/page.tsx`: homepage
- `app/archives/page.tsx`: archives page
- `app/banzuke/page.tsx`: banzuke page
- `app/kimarite/page.tsx`: all 82 kimarite listing page
- `app/officials/page.tsx`: gyoji and yobidashi lists and profiles
- `app/torikumi/page.tsx`: monthly hubs for results and schedules
- `app/analytics/page.tsx`: basho analytics page
- `app/rikishi/MyRikishiPage.tsx`: My Rikishi page
- `app/rikishi/CompareRikishiPage.tsx`: Compare Rikishi page
- `app/components/TorikumiDayPage.tsx`: daily result and schedule pages
- `app/components/BanzukeTable.tsx`: banzuke table component
- `app/components/MyRikishiToggle.tsx`: My Rikishi toggle
- `app/components/ShareCurrentLink.tsx`: copy current URL to clipboard
- `app/components/NewsSection.tsx`: homepage news section (Japan Sumo Association + Sumo World News split sections)
- `app/components/GreetingSection.tsx`: homepage "From the Editor" callout (h3, uses `getLatestBlogPost()`, nested inside `MonomosuSection`)
- `app/components/MonomosuSection.tsx`: standalone "Have Your Say" section on homepage (visible h2 + zabuton reaction + textarea drawer + nested `GreetingSection`)
- `app/components/KimariteCard.tsx`: homepage kimarite entry card
- `app/components/WebMcpProvider.tsx`: WebMCP tool registration (prefers `document.modelContext.registerTool`)
- `app/components/PrimaryNavigation.tsx`: primary navigation
- `app/lib/archives-data.ts`: past basho dataset
- `app/lib/torikumi-routes.ts`: month-key URL resolution and navigation
- `app/lib/sumo-data.ts`: banzuke data (includes rikishi type definitions)
- `app/lib/torikumi-data.ts`: torikumi archive data
- `app/lib/news-data.ts`: static news feed data
- `app/lib/kimarite-data.ts`: master list of all 82 winning techniques
- `app/lib/official-profile.ts`: gyoji/yobidashi types, API fetching, and numeric-ID paths
- `app/lib/my-rikishi.ts`: My Rikishi registration state (localStorage sync)
- `app/lib/basho-status.ts`: basho status (live / upcoming / final) classification
- `app/lib/webmcp.ts`: WebMCP tool definitions (4 tools)
- `app/lib/july2026-data.ts`: immutable July 2026 (Nagoya) basho snapshot
- `app/lib/july2026-banzuke-data.ts`: immutable July 2026 banzuke snapshot
- `app/lib/september2026-data.ts`: immutable September 2026 (Aki) basho snapshot
- `app/lib/september2026-banzuke-data.ts`: immutable September 2026 banzuke snapshot
- `app/lib/archive-basho-data.ts`: aggregated past + current basho data
- `app/lib/blog-build.ts`: static HTML, RSS, and sitemap generation for Stories
- `app/lib/agent-skills.ts`: Agent Skills Index metadata
- `functions/mcp/[[path]].ts`: Streamable HTTP MCP server endpoint
- `mcp/`: multi-platform consumer MCP integration kit
- `scripts/update_sumo_data.py`: data generation script for banzuke, torikumi, and rikishi profiles
- `scripts/update_news_feed.py`: news feed generation script
- `scripts/update_official_profiles.py`: gyoji and yobidashi data generator
- `scripts/build_blog.ts`: Stories output and `blog.json` generator

## Contact

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## License

MIT

## Download

- [July 2026 basho rikishi dictionary](https://github.com/dai/shikona)
- [Dictionary registration guide](https://x.com/daisuke/status/2027263585244889097)
