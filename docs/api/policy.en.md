# o-sumo API Policy

[日本語版](./policy.md)

## Service Policy

The o-sumo API is operated on a best-effort basis by an individual maintainer. No commercial SLA is provided.

## Update Schedule

Current update flows:

- Daily update (torikumi schedule only): `daily-data-update.yml` is manual-only (`workflow_dispatch`) until the September banzuke is officially published
- Realtime update (torikumi results only): `realtime-torikumi-direct-update.yml` is manual-only (`workflow_dispatch`) until the September banzuke is officially published
- News update: run `news-feed-update.yml` every 2 hours from JST 09:00 through 19:00
- When files change, the workflows create or update the shared `automation/data-updates` PR
- News polling does not rewrite `news.json` when only `updatedAt` would change

The July basho is final. Keep current `banzuke.json` and `torikumi.json` data on July (`202607`) until the September banzuke is officially published. The next PR validates official data before restoring schedules, removing the closing notice, and switching current data.

See the GitHub Actions workflows for the exact implementation.

Stale-result triage order:

1. Run history (check whether realtime runs were executed)
2. Run logs (`event.schedule`, JST time, `resultUpdatedAt`, `scheduleUpdatedAt`)
3. Upstream API `judge` values (whether results are settled)

## Timestamp Ownership

`updatedAt` is not unified — each content unit owns its own timestamp. Generator, UI, Markdown, and CI all read the same field for the same purpose.

- Banzuke (`banzuke.json`): `updatedAt` is bound to results — equals `torikumi.json.resultUpdatedAt`. It does NOT advance on schedule-only updates
- Results (`torikumi.json.resultDays`, results hub/day): `resultUpdatedAt`
- Schedule (`torikumi.json.scheduleDays`, schedule hub/day): `scheduleUpdatedAt`
- Archives (`/202603/`, `/202605/`, `/202607/`): each snapshot's `BanzukeData.updatedAt` / `TorikumiData.updatedAt`
- Rikishi index / detail: each JSON's `updatedAt`. Detail takes precedence over the index when both exist
- Gyoji / yobidashi index / detail: each JSON's `retrievedAt`
- News articles: each article's `publishedAt`. The feed's own `updatedAt` is NOT shown in the UI

CI asserts these value contracts:

- `torikumi.updatedAt === max(resultUpdatedAt, scheduleUpdatedAt)`
- `banzuke.updatedAt === torikumi.resultUpdatedAt`

Static pages that do not carry timestamps (Archives index, Kimarite index, etc.) must not display unrelated timestamps.

## Compatibility Policy

- `/api/v1/*` prioritizes backward compatibility
- Breaking changes such as removing required keys or changing field types should be published under `/api/v2/*`
- Deprecation of `v1` should be announced in advance

## Deprecation Policy

1. Announce planned deprecation in the README, changelog, or an issue
2. Provide a migration window when reasonably possible
3. After deprecation, remove the version or replace it with a fixed response

## Incident And Change Notices

- Temporary outages or data gaps are announced through GitHub Issues
- Significant changes are recorded in `docs/api/changelog.en.md`
