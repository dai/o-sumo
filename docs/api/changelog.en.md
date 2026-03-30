# API Changelog

[日本語版](./changelog.md)

## 2026-03-30

### New Features

- Added `GET /api/v1/rikishi.json` endpoint: list of basic rikishi information
- Added `GET /api/v1/rikishi/{id}.json` endpoint: detailed rikishi profile data
  - Includes birth date, height, weight, birthplace, debut, career stats, and profile photo URL
  - Photo data depends on sumo.or.jp availability

### Data Model Extensions

- Extended `Rikishi` interface with: `birthDate`, `height`, `weight`, `shusshin`, `debut`, `careerStats`, `photoUrl`
- Added new `RikishiProfile` interface

### Python Script Updates

- Added `--rikishi-only` option: fetch rikishi profile data only
- Added `--profile-limit N` option: limit number of rikishi profiles to fetch (for testing)

### Public API

- Added `public/api/v1/rikishi.json`
- Generated `public/api/v1/rikishi/{id}.json` for all rikishi

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
