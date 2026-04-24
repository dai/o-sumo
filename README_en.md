# o-sumo

[![DeepWiki](https://img.shields.io/badge/DeepWiki-dai%2Fo--sumo-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/dai/o-sumo)


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
- Current route examples:
  - `/202605-banduke`
  - `/202605-torikumi`
  - `/20260524-yotei`
- The legacy banzuke URL `/{YYYYMM}-o-sumo` redirects to the current banzuke URL.
- Public APIs:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`

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

## Data Updates

Full refresh (banzuke + torikumi):

```bash
python scripts/update_sumo_data.py
```


```bash
```


```bash
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

For the May 2026 banzuke release on April 27, 2026, first confirm that the upstream source has switched to the May basho, then run:

```bash
git pull --ff-only origin main
python scripts/update_sumo_data.py --torikumi-scope schedule
npm run typecheck
npm test
npm run build
```

Before publishing to `main`, verify that `banzuke.json` has `bashoName: "五月場所"`, `year: "令和八年"`, 42 makuuchi rikishi, and 28 juryo rikishi.

Generated outputs:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- 15-day archives for both results and schedules
- Published days are populated from source data when available
- Unpublished days remain as `pending` placeholders

## Automated Updates

GitHub Actions uses separate daily and results-refresh workflows.

- Daily update: `.github/workflows/daily-data-update.yml`
  - schedule: currently paused (`workflow_dispatch` only)
  - updates banzuke and torikumi schedules
  - commits and pushes directly to `main` when files change
- Realtime results update: `.github/workflows/realtime-torikumi-update.yml`
  - schedule: paused until May 1, 2026 (`workflow_dispatch` only)
  - updates torikumi results only
  - commits and pushes directly to `main` when files change

## Operations Policy For The May 2026 Basho

- Both `daily-data-update.yml` and `realtime-torikumi-update.yml` remain `workflow_dispatch`-only until May 1, 2026.
- After the April 27, 2026 banzuke release, manually run `python scripts/update_sumo_data.py --torikumi-scope schedule` to sync the May banzuke, schedule placeholders, and static API files.
- Keep the cache policy in `public/_headers` unchanged to control Cloudflare usage.
- Keep the PWA Service Worker on `registerType: "prompt"` so updates are not applied without user confirmation.

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
