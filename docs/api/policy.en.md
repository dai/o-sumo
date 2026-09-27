# o-sumo API Policy

[日本語版](./policy.md)

## Service Policy

The o-sumo API is operated on a best-effort basis by an individual maintainer. No commercial SLA is provided.

## AI usage

Anonymous read-only access requires no API key. Search and query-time grounding are permitted (`search=yes, ai-input=yes`); training/fine-tuning is not (`ai-train=no`). Cite source URLs and their timestamps. The policy is maintained in `public/robots.txt`; deployment verification is in [agent-ready.md](../agent-ready.md).

## Update Schedule

Current update flows:

- Daily update (torikumi schedule only): `daily-data-update.yml` runs at JST 13:00, 15:00, 17:00 and 19:00 (also supports manual dispatch)
- Realtime update (torikumi results only): `realtime-torikumi-direct-update.yml` is scheduled every 3 minutes during UTC 06:00–09:59 / JST 15:00–18:59 (also supports manual dispatch)
- News update: run `news-feed-update.yml` every 2 hours from JST 09:05 through 19:05
- Updates use the serialized `data-update.yml` workflow and `scripts/ci/run_data_update.py`.
- News acquisition state is kept on `automation/news-state`; the selected validated snapshot is published to `main` according to `scripts/ci/news_state.py`. See those files for publication and retry rules.

The current JSON APIs serve September 2026. July is an immutable archive. Scheduled runs may be delayed by GitHub Actions; use the payload timestamps and publication status to assess freshness.

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
