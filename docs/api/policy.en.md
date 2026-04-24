# o-sumo API Policy

[日本語版](./policy.md)

## Service Policy

The o-sumo API is operated on a best-effort basis by an individual maintainer. No commercial SLA is provided.

## Update Schedule

Current automated update flows:

- Daily update for banzuke and torikumi schedules: currently paused (`workflow_dispatch` only)
- Realtime update for torikumi results only: paused until May 1, 2026 (`workflow_dispatch` only)

After the May 2026 banzuke release on April 27, 2026, the maintainer manually syncs `banzuke.json` and `torikumi.json` to the May basho.

See the GitHub Actions workflows for the exact implementation.

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
