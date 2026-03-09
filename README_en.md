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

This repository does not commit a lockfile, so dependency installation is intentionally based on `npm install`.

Run the dev server:

```bash
npm run dev
```

Useful URLs:

- `http://localhost:3001/`
- `http://localhost:3001/202603-banduke`
- `http://localhost:3001/202603-torikumi`
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

## Data Update

Update datasets with:

```bash
python scripts/update_sumo_data.py
```

This updates:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- 21 makuuchi bouts + 14 juryo bouts
- Result archive generated from day 1 through the current day
- Schedule archive generated from day 1 through the next day

## Automated Update

GitHub Actions updates the data every day at 19:00 JST.

- Workflow: `.github/workflows/daily-data-update.yml`
- Changes are proposed by pull request instead of pushing directly to `main`

## Testing

A minimal automated test setup is included.

- test runner: Vitest
- component testing: Testing Library
- workflow: `.github/workflows/test.yml`

Current coverage:

- routing helpers in `app/lib/torikumi-routes.ts`
- main navigation on the home page
- smoke coverage for the daily torikumi page

GitHub Actions runs the following on pull requests and on pushes to `main` and `codex/**`:

- `npm install`
- `npm test`
- `npm run build`

## Cloudflare Pages

Production:

- `https://osada.us`

Example branch preview:

- `https://codex-202603-ux-routing.o-sumo.pages.dev`

SPA fallback for direct date-based URLs is configured in `public/_redirects`.

## Important Files

- `app/main.tsx`: route definitions
- `app/page.tsx`: homepage
- `app/202603-o-sumo/page.tsx`: banzuke page
- `app/202603-torikumi/page.tsx`: torikumi hub pages
- `app/components/TorikumiDayPage.tsx`: daily result/schedule page
- `app/lib/torikumi-routes.ts`: date URL resolution and navigation
- `scripts/update_sumo_data.py`: banzuke and torikumi data generator

## Contact

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## License

ISC
