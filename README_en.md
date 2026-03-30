# o-sumo

[日本語 README](./README.md)

o-sumo is a static web app for publishing sumo banzuke and torikumi information. It is built with React 19, TypeScript, and Vite, and serves both a static site and static JSON APIs from Cloudflare Pages.

## Document Index

- README: `README.md` / `README_en.md`
- Development guide: `DEVELOPMENT.md` / `DEVELOPMENT_en.md`
- Skills index: `SKILLS.md` / `SKILLS_en.md`
- API spec: `docs/api/v1.md` / `docs/api/v1.en.md`
- API policy: `docs/api/policy.md` / `docs/api/policy.en.md`
- API changelog: `docs/api/changelog.md` / `docs/api/changelog.en.md`

## Overview

- Web routes:
  - Homepage: `/`
  - Banzuke: `/{YYYYMM}-banduke`
  - Results hub: `/{YYYYMM}-torikumi`
  - Schedule hub: `/{YYYYMM}-yotei`
  - Daily result: `/{YYYYMMDD}-torikumi`
  - Daily schedule: `/{YYYYMMDD}-yotei`
  - Rikishi profile: `/rikishi/{id}`
- Current route examples:
  - `/202603-banduke`
  - `/202603-torikumi`
  - `/20260322-yotei`
  - `/rikishi/3842`
- The legacy banzuke URL `/{YYYYMM}-o-sumo` redirects to the current banzuke URL.
- Public APIs:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`
  - `/api/v1/rikishi.json`
  - `/api/v1/rikishi/{id}.json`

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
- `skills/osumo-api/SKILL.md`

## Key Features

- Direct navigation from the homepage to `Banzuke / Schedule / Results`
- Banzuke pages for makuuchi and juryo rankings and records
- Click rikishi names to view their profile pages at `/rikishi/{id}`
- Monthly hub pages listing all 15 daily pages
- Daily pages for makuuchi and juryo torikumi
- `ascending / descending` sorting on banzuke, hub, and daily pages
- Unpublished days remain available as `pending` pages with empty-state messaging
- The month key is derived dynamically from generated data in `app/lib/torikumi-data.ts`

## Tech Stack

- Frontend: React 19, TypeScript, React Router, Vite
- Testing: Vitest, Testing Library, jsdom
- Data generation: Python (`scripts/update_sumo_data.py`)
- Hosting: Cloudflare Pages
- Data source: Nihon Sumo Kyokai Ajax endpoints

## Local Development

Requirements:

- Node.js 18+
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

# Local preview of the built app
npm run preview
```

Useful local URLs:

- `http://localhost:3001/`
- `http://localhost:3001/{YYYYMM}-banduke`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`
- `http://localhost:3001/rikishi/{id}`

## Data Updates

Full refresh (banzuke + torikumi + rikishi profiles):

```bash
python scripts/update_sumo_data.py
```

Rikishi profile data only:

```bash
python scripts/update_sumo_data.py --rikishi-only
```

Limit rikishi profile fetch to first 10 (for testing):

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

Generated outputs:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`
- `public/api/v1/rikishi.json`
- `public/api/v1/rikishi/{id}.json` (per rikishi)

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- 15-day archives for both results and schedules
- Published days are populated from source data when available
- Unpublished days remain as `pending` placeholders

## Automated Updates

GitHub Actions uses separate daily and results-refresh workflows.

- Daily update: `.github/workflows/daily-data-update.yml`
  - schedule: 10:00 JST and 18:00 JST every day
  - updates banzuke and torikumi schedules
  - commits and pushes directly to `main` when files change
- Realtime results update: `.github/workflows/realtime-torikumi-update.yml`
  - schedule: every 30 minutes from 15:00 JST through 19:30 JST, plus 20:00 JST
  - updates torikumi results only
  - commits and pushes directly to `main` when files change

## Testing

- test runner: Vitest
- component testing: Testing Library
- workflow: `.github/workflows/test.yml`

Current main coverage:

- routing helpers in `app/lib/torikumi-routes.ts`
- sorting helpers in `app/lib/sorting.ts`
- homepage navigation
- banzuke sorting
- 15-day hub rendering and sorting
- daily torikumi sorting and pending-state rendering

GitHub Actions runs the following on pull requests and pushes to `main` and `codex/**`:

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Cloudflare Pages

- Production URL: `https://osada.us`
- SPA fallback file: `public/_redirects`
- Direct access to date-based URLs falls back to `index.html`

## Important Files

- `app/main.tsx`: route definitions
- `app/page.tsx`: homepage
- `app/banzuke/page.tsx`: banzuke page
- `app/torikumi/page.tsx`: monthly hubs for results and schedules
- `app/rikishi/[id]/page.tsx`: rikishi profile page
- `app/components/TorikumiDayPage.tsx`: daily result and schedule pages
- `app/components/BanzukeTable.tsx`: banzuke table component
- `app/lib/torikumi-routes.ts`: month-key URL resolution and navigation
- `app/lib/sumo-data.ts`: banzuke data (includes rikishi type definitions)
- `app/lib/torikumi-data.ts`: torikumi archive data
- `scripts/update_sumo_data.py`: data generation script

## Contact

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## License

ISC
