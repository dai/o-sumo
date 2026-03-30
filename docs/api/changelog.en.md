# API Changelog

[日本語版](./changelog.md)

## 2026-03-30

### New Features

- Rikishi profile page at `/rikishi/{id}` - click rikishi names on banzuke page to view
- Washin-modern UI refresh: Shippori Mincho font, refined color palette

### Data Model Extensions

- Extended `Rikishi` interface with: `birthDate`, `height`, `weight`, `shusshin`, `debut`, `careerStats`, `photoUrl`
- Added new `RikishiProfile` interface

### Python Script Updates

- Added `--rikishi-only` option: fetch rikishi profile data only
- Added `--profile-limit N` option: limit number of rikishi profiles to fetch (for testing)

## 2026-03-23

- Updated `README.md` and `README_en.md` to match the current route design, update commands, and GitHub Actions operations
- Updated `DEVELOPMENT.md` to match the current developer commands, update flows, and CI behavior
- Corrected the update schedule in `docs/api/policy.md` to match the workflow implementation
- Updated `docs/api/v1.md` to match live data for `winner`, `dayHead`, `resultUpdatedAt`, `scheduleUpdatedAt`, and `statusMessage`
- Updated the response examples in `docs/api/v1.md` to better reflect the current data in `public/api/v1/*.json`
- Added `docs/api/v1.en.md` as the English API v1 specification
- Added `docs/api/policy.en.md` as the English API policy
- Added `docs/api/changelog.en.md` as the English API changelog
- Added Japanese and English API documentation links to `SKILLS.md`
- Added `SKILLS_en.md` as the English skills index
- Added `DEVELOPMENT_en.md` as the English development guide
- Added a bilingual document index near the top of `README.md` and `README_en.md`
- Synced `skills/osumo-api/SKILL.md` and `skills/osumo-api/references/field-map.md` with the current API v1 specification

## 2026-03-11

- Added `docs/api/v1.md` to document the field specifications for `banzuke.json` and `torikumi.json`
- Added `docs/api/policy.md` to document update frequency, compatibility, and deprecation policy
- Added `skills/osumo-api/SKILL.md` as a Codex-facing usage guide
