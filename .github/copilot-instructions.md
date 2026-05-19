# o-sumo: Copilot Cloud Agent Instructions

## Repository summary
- This repository is a static web app for sumo banzuke and torikumi archives.
- Stack: React 19 + TypeScript + Vite, tests with Vitest, data generation with Python.
- Deploy target: Cloudflare Pages.

## Required workflow
1. Start from a feature branch and open a pull request.
2. Keep changes minimal and scoped to the request.
3. Run required checks before asking for review.

## Required checks
- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Data update workflow
- Data generator: `python scripts/update_sumo_data.py`
- If only torikumi schedule is needed:
  - `python scripts/update_sumo_data.py --torikumi-only --torikumi-scope schedule`
- If torikumi result + banzuke sync is needed:
  - `python scripts/update_sumo_data.py --torikumi-scope result --skip-rikishi-fetch`
- When generated data changes, review these files carefully:
  - `app/lib/sumo-data.ts`
  - `app/lib/torikumi-data.ts`
  - `public/api/v1/banzuke.json`
  - `public/api/v1/torikumi.json`

## Guardrails
- Use Japanese or English only.
- Do not use Russian, Chinese, or Korean text in user-facing copy.
- Do not push directly to `main`; use PR-based delivery.
- Avoid broad refactors unless explicitly requested.
- Keep documentation in sync when behavior or operations change.
