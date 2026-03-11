# o-sumo

[日本語 README](./README.md)

o-sumo is a static web app for publishing sumo banzuke and torikumi information. It is built with React, TypeScript, and Vite, and hosted on Cloudflare Pages.

## Overview

- Banzuke page: `/202603-banduke`
- Monthly torikumi results hub: `/202603-torikumi`
- Monthly torikumi schedule hub: `/202603-yotei`
- Daily result pages: `/20260308-torikumi`, `/20260309-torikumi`
- Daily schedule pages: `/20260308-yotei`, `/20260309-yotei`
- Public APIs:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`

API docs:

- `docs/api/v1.md`
- `docs/api/policy.md`
- `docs/api/changelog.md`

Skill publishing:

- `SKILLS.md`
- `skills/osumo-api/SKILL.md`

Key UX:

- The homepage main navigation is `Banzuke / Schedule / Results`
- Banzuke, monthly hub pages, and daily pages support `ascending / descending` sorting
- Result and schedule pages are pre-generated for all 15 tournament days
- Unpublished days stay available with empty-state messaging

## Tech Stack

- Frontend: React 19, TypeScript, React Router, Vite
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

`package-lock.json` is committed. Use `npm install` for the initial setup, and use `npm ci` for reproducible reinstalls and CI.

Run the dev server:

```bash
npm run dev
```

Useful URLs:

- `http://localhost:3001/`
- `http://localhost:3001/202603-banduke`
- `http://localhost:3001/202603-torikumi`
- `http://localhost:3001/202603-yotei`
- `http://localhost:3001/20260308-torikumi`
- `http://localhost:3001/20260308-yotei`

Production-style local check:

```bash
npm run build
npm run preview
```

Run tests:

```bash
npm test
```

Run type checks:

```bash
npm run typecheck
```

## Data Update

Update datasets with:

```bash
python scripts/update_sumo_data.py
```

For high-frequency torikumi-only refresh:

```bash
python scripts/update_sumo_data.py --torikumi-only
```

This updates:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- Result and schedule archives generated for all 15 days
- Published days are filled with source data when available
- Unpublished days are emitted as pending placeholders

## Automated Update

GitHub Actions uses separate normal and high-frequency update flows.

- Daily update: `.github/workflows/daily-data-update.yml`
  - runs every day at 19:00 JST
  - refreshes banzuke and torikumi data
- Realtime torikumi update: `.github/workflows/realtime-torikumi-update.yml`
  - runs every 5 minutes from 15:00 to 18:55 JST
  - refreshes torikumi results and schedules only
- Both flows open pull requests instead of pushing directly to `main`

## Testing

A minimal automated test setup is included.

- test runner: Vitest
- component testing: Testing Library
- workflow: `.github/workflows/test.yml`

Current coverage:

- routing helpers in `app/lib/torikumi-routes.ts`
- sorting helpers in `app/lib/sorting.ts`
- main navigation on the home page
- banzuke sort behavior
- 15-day monthly hub rendering and sort behavior
- daily torikumi sort and pending-state behavior

GitHub Actions runs the following on pull requests and on pushes to `main` and `codex/**`:

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `python scripts/update_sumo_data.py`
- `git diff --exit-code`

If the generated files differ after running the update script, CI fails so that missing generated output cannot be merged.

## Cloudflare Pages

Production:

- `https://osada.us`

Example branch preview:

- `https://codex-ux-15day-sort-live.o-sumo.pages.dev`

SPA fallback for direct date-based URLs is configured in `public/_redirects`.

## Important Files

- `app/main.tsx`: route definitions
- `app/page.tsx`: homepage
- `app/banzuke/page.tsx`: banzuke page
- `app/torikumi/page.tsx`: torikumi hub pages
- `app/components/TorikumiDayPage.tsx`: daily result/schedule page
- `app/lib/torikumi-routes.ts`: date URL resolution and navigation
- `scripts/update_sumo_data.py`: banzuke and torikumi data generator
- `docs/api/v1.md`: API specification
- `skills/osumo-api/SKILL.md`: API usage skill

## Contact

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## License

ISC
