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
  - Archives: `/archives`
  - Rikishi list: `/rikishi`
  - Rikishi profile: `/rikishi/{id}`
  - Banzuke: `/{YYYYMM}-banduke`
  - Results hub: `/{YYYYMM}-torikumi`
  - Schedule hub: `/{YYYYMM}-yotei`
  - Daily result: `/{YYYYMMDD}-torikumi`
  - Daily schedule: `/{YYYYMMDD}-yotei`
  - Kimarite: `/kimarite`
- Current route examples:
  - `/202607-banduke`
  - `/202607-torikumi`
  - `/20260712-yotei`
  - `/kimarite`
- The legacy banzuke URL `/{YYYYMM}-o-sumo` redirects to the current banzuke URL.
- Public APIs:
  - `/api/v1/banzuke.json`
  - `/api/v1/torikumi.json`
  - `/api/v1/rikishi.json`
  - `/api/v1/rikishi/{id}.json`
  - `/api/v1/news.json`

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

- Direct navigation from the homepage to `Banzuke / Schedule / Results / Rikishi Profiles`
- Banzuke pages for makuuchi and juryo rankings and records, with MiniMax I2I Generation processed rikishi profile images and links to rikishi profiles
- Monthly hub pages listing all 15 daily pages
- Daily pages for makuuchi and juryo torikumi, with profile links on wrestler names
- `ascending / descending` sorting on banzuke, hub, and daily pages
- Unpublished days remain available as `pending` pages with empty-state messaging
- The month key is derived dynamically from generated data in `app/lib/torikumi-data.ts`
- Homepage **Latest News** section split into two sub-sections: Japan Sumo Association announcements and Sumo World News (latest 5 from dmenu Sports)
- Homepage **Kimarite** card links to the `/kimarite` index page that lists all 82 winning techniques, grouped by category with bilingual Japanese/English commentary
- News JSON is regenerated automatically by the `daily-data-update` GitHub Actions workflow via the Python scraper (`/api/v1/news.json`)

## Tech Stack

- Frontend: React 19, TypeScript, React Router, Vite
- Testing: Vitest, Testing Library, jsdom
- Data generation: Python (`scripts/update_sumo_data.py`)
- Hosting: Cloudflare Pages
- Data source: Nihon Sumo Kyokai Ajax endpoints
- Rikishi imagery: local PNG illustrations processed with MiniMax I2I Generation from Japan Sumo Association profile photos
- News sources: Japan Sumo Association announcements page and dmenu Sports (`https://sumo.sports.smt.docomo.ne.jp/news/`)

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
- `http://localhost:3001/archives`
- `http://localhost:3001/rikishi`
- `http://localhost:3001/rikishi/{id}`
- `http://localhost:3001/{YYYYMM}-banduke`
- `http://localhost:3001/{YYYYMM}-torikumi`
- `http://localhost:3001/{YYYYMM}-yotei`
- `http://localhost:3001/{YYYYMMDD}-torikumi`
- `http://localhost:3001/{YYYYMMDD}-yotei`
- `http://localhost:3001/kimarite`
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

For the July 2026 banzuke release on June 29, 2026, first confirm that the upstream source has switched to the July basho, then run:

```bash
git pull --ff-only origin main
python scripts/update_sumo_data.py --torikumi-scope schedule
npm run typecheck
npm test
npm run build
```

Before publishing to `main`, verify that `banzuke.json` has `bashoName: "七月場所"`, `year: "令和八年"`, 42 makuuchi rikishi, and 28 juryo rikishi. Also verify that `torikumi.json` keeps `resultDays[0].pathDate = "20260510"` while switching `scheduleDays[0].pathDate` to `"20260712"`.

Generated outputs:

- `app/lib/sumo-data.ts`
- `app/lib/torikumi-data.ts`
- `app/lib/news-data.ts`
- `public/api/v1/banzuke.json`
- `public/api/v1/torikumi.json`
- `public/api/v1/rikishi.json`
- `public/api/v1/rikishi/{id}.json` (one file per rikishi, including `name`, `yomi`, `currentRank`, `sourceUrl`, and `updatedAt`)
- `public/api/v1/news.json`
- `public/images/rikishi/{id}.png` (processed profile illustrations for all rikishi, used permanently on both profile and banzuke pages)

Key validations:

- 42 makuuchi rikishi
- 28 juryo rikishi
- 15-day archives for both results and schedules
- Published days are populated from source data when available
- Unpublished days remain as `pending` placeholders

## Automated Updates

GitHub Actions uses separate workflows for torikumi schedules, torikumi results, and news. When files change, each workflow creates or updates the shared `automation/*-updates` PR.

Shared helpers under `scripts/ci/`:

- `run_torikumi_generator.sh` — runs `update_sumo_data.py` with up to two retries
- `validate_torikumi.py` — schema check for `public/api/v1/torikumi.json`
- `validate_news.py` — schema check for `public/api/v1/news.json`
- `notify_discord.sh` — posts a Discord notification when `DISCORD_WEBHOOK_URL` is configured

Workflows:

- Daily update: `.github/workflows/daily-data-update.yml`
  - schedule: JST 13:00 / 19:00
  - updates torikumi schedules only (`--torikumi-only --torikumi-scope schedule`)
- Realtime results update: `.github/workflows/realtime-torikumi-direct-update.yml`
  - schedule: every 10 minutes from JST 13:00 through 18:50
  - updates torikumi results only (`--torikumi-only --torikumi-scope result --skip-rikishi-fetch --strict-torikumi-fetch`)
  - logs: GitHub Actions job summary aggregates step results, commit state, and the run URL
- News update: `.github/workflows/news-feed-update.yml`
  - schedule: every 2 hours from JST 09:05 through 19:05
  - updates Japan Sumo Association and dmenu Sports news (`python scripts/update_news_feed.py`)
  - skips rewriting `news.json` when fetched items and source states are unchanged
  - newly created PRs are auto-merged with `gh pr merge --auto --squash` once the `test` workflow passes

### Discord notifications (optional)

Set `DISCORD_WEBHOOK_URL` as a repository secret to send failure notifications to a Discord channel from the three automated workflows. The workflows continue to work normally when the secret is absent.

Setup:

1. In Discord open the target channel → `Edit channel` → `Integrations` → `Webhooks` → `New webhook`, then copy the URL.
2. Open the GitHub repository → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.
3. Name: `DISCORD_WEBHOOK_URL`, Value: the webhook URL from step 1 → `Add secret`.

See `scripts/ci/notify_discord.sh` for the embedded payload structure.

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

GitHub Actions runs the following on pull requests and pushes to `main`, `codex/**`, and `automation/data-updates`:

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Cloudflare Pages

- Production URL: `https://osada.us`
- SPA fallback file: `public/_redirects` (app routes only; `/api/v1/*` serves static JSON as-is)
- Direct access to date-based URLs falls back to `index.html`

## Operations Policy For The July 2026 Basho

- GitHub Actions daily/realtime/news refreshes create or update the shared `automation/data-updates` PR when files change.
- Schedules refresh at JST 13:00 / 19:00, results refresh every 10 minutes from JST 13:00 through 18:00, and news polls every 2 hours from JST 09:05 through 19:05.
- Manual runs can be started with `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main`, `gh workflow run realtime-torikumi-update.yml -R dai/o-sumo --ref main`, or `gh workflow run news-feed-update.yml -R dai/o-sumo --ref main`.
- The realtime workflow uses `--torikumi-only --torikumi-scope result --skip-rikishi-fetch`, so it is limited to torikumi results.
- If results still look stale, triage in this order: run history -> run logs (`event.schedule`, JST time, updatedAt fields) -> upstream `judge` values.
- Keep the cache policy in `public/_headers` unchanged to control Cloudflare usage.
- Keep the PWA Service Worker on `registerType: "autoUpdate"` so updates are applied automatically.

## Important Files

- `app/main.tsx`: route definitions
- `app/page.tsx`: homepage
- `app/archives/page.tsx`: archives page
- `app/banzuke/page.tsx`: banzuke page
- `app/kimarite/page.tsx`: all 82 kimarite listing page
- `app/torikumi/page.tsx`: monthly hubs for results and schedules
- `app/components/TorikumiDayPage.tsx`: daily result and schedule pages
- `app/components/BanzukeTable.tsx`: banzuke table component
- `app/components/NewsSection.tsx`: homepage news section (Japan Sumo Association + Sumo World News split sections)
- `app/components/KimariteCard.tsx`: homepage kimarite entry card
- `app/lib/archives-data.ts`: past basho dataset
- `app/lib/torikumi-routes.ts`: month-key URL resolution and navigation
- `app/lib/sumo-data.ts`: banzuke data (includes rikishi type definitions)
- `app/lib/torikumi-data.ts`: torikumi archive data
- `app/lib/news-data.ts`: static news feed data
- `app/lib/kimarite-data.ts`: master list of all 82 winning techniques
- `scripts/update_sumo_data.py`: data generation script for banzuke, torikumi, and rikishi profiles
- `scripts/update_news_feed.py`: news feed generation script

## Contact

- X: https://x.com/daisuke
- GitHub: https://github.com/dai/o-sumo

## License

MIT

## Download

- [May 2026 basho rikishi dictionary `rikishi-202605.txt`](./rikishi-202605.txt)
- [Dictionary registration guide](https://x.com/daisuke/status/2027263585244889097)
