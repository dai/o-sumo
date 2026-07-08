# o-sumo API Policy

[日本語版](./policy.md)

## Service Policy

The o-sumo API is operated on a best-effort basis by an individual maintainer. No commercial SLA is provided.

## Update Schedule

Current update flows:

- Daily update (torikumi schedule only): run `daily-data-update.yml` at JST 13:00 / 19:00
- Realtime update (torikumi results only): run `realtime-torikumi-update.yml` every 10 minutes from JST 13:00 through 18:00
- News update: run `news-feed-update.yml` every 2 hours from JST 09:00 through 19:00
- When files change, the workflows create or update the shared `automation/data-updates` PR
- News polling does not rewrite `news.json` when only `updatedAt` would change

After the July 2026 banzuke release on June 29, 2026, the maintainer manually syncs `banzuke.json` to the July basho. In `torikumi.json`, `scheduleDays` move to the July basho while `resultDays` stay on the completed May archive (`202605`).

See the GitHub Actions workflows for the exact implementation.

Stale-result triage order:

1. Run history (check whether realtime runs were executed)
2. Run logs (`event.schedule`, JST time, `resultUpdatedAt`, `scheduleUpdatedAt`)
3. Upstream API `judge` values (whether results are settled)

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
