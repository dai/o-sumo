# Rikishi Comparison Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh `/compare/` for exactly two rikishi and publish verified official-history head-to-head records.

**Architecture:** Extend the existing profile generator with raw shikona and bout-history parsing, then resolve and validate normalized active-rikishi pairs into one static JSON endpoint. Refactor the comparison page around two local combobox drafts while preserving ordered `ids` in the URL and loading profiles plus the matchup endpoint only for a complete pair.

**Tech Stack:** Python 3 standard library, React 19, TypeScript, React Router, i18next, Vitest, Testing Library, Vite, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-17-rikishi-comparison-refresh-design.md`

## Global Constraints

- Compare exactly two active makuuchi or juryo rikishi; legacy URLs with three IDs normalize to the first two unique positive IDs.
- Head-to-head uses all bout history published on official Japan Sumo Association profiles and resolves historical shikona to current rikishi IDs.
- Publish `GET /api/v1/rikishi-matchups.json` with unique records shaped as `{ rikishi1Id, rikishi2Id, rikishi1Wins, rikishi2Wins }`, where `rikishi1Id < rikishi2Id` and wins are non-negative integers.
- Never replace the last known good matchup file after partial generation, unresolved active aliases, or conflicting mirrored records.
- Add no UI dependency; use existing React, i18n, search normalization, design tokens, and trailing-slash conventions.
- Follow strict TDD: record focused RED before production changes and focused GREEN after them.

---

### Task 1: Official history parser and matchup API

**Files:**
- Modify: `scripts/update_sumo_data.py`
- Modify: `scripts/update_sumo_data_parser_test.py`
- Create: `public/api/v1/rikishi-matchups.json`

**Interfaces:**
- Produce a validated matchup JSON document with `updatedAt` and normalized `matchups` records for Task 2.
- Keep existing profile JSON output backward compatible.

- [ ] Add failing parser tests for shikona history, place/day/opponent/outcome extraction, duplicate desktop/mobile rows, rest/no-bout exclusion, and historical-name resolution.
- [ ] Add failing generator tests for normalized pair ordering, mirrored-record consistency, the `4230/4279 = 6-2` fixture, and last-known-good preservation on partial/conflicting input.
- [ ] Run `python scripts/update_sumo_data_parser_test.py` and record expected RED failures caused by missing matchup behavior.
- [ ] Implement the smallest two-pass parser/resolver and atomic validated matchup writer needed to pass the tests.
- [ ] Run the Python suite GREEN, generate the live full dataset, validate pair uniqueness and the representative `6-2` record, then commit.

### Task 2: Two-rikishi accessible comparison UI

**Files:**
- Modify: `app/lib/rikishi-profile.ts`
- Modify: `app/rikishi/CompareRikishiPage.tsx`
- Modify: `app/rikishi/CompareRikishiPage.test.tsx`
- Modify: `app/rikishi/MyRikishiPage.tsx`
- Modify: `app/rikishi/page.css`
- Modify: `src/locales/ja/common.json`
- Modify: `src/locales/en/common.json`
- Modify: `public/_redirects`

**Interfaces:**
- Consume `/api/v1/rikishi-matchups.json` from Task 1.
- Preserve `/compare/?ids=<rikishi1>,<rikishi2>` as the shareable ordered selection.

- [ ] Add failing UI/helper tests for two-ID normalization, legacy three-ID URLs, one-ID prefill, independent combobox selection/replacement/duplicate prevention/clear, four-form search, keyboard behavior, zero results, stale-state suppression, errors, profile links, seven table rows, and reversed matchup display.
- [ ] Run the focused Vitest file and record expected RED failures.
- [ ] Add typed matchup fetching and refactor profile loading to reuse the already-fetched index.
- [ ] Implement both comboboxes with standard ARIA relationships and keyboard behavior, exact clear semantics, request-keyed loading state, seven-row table, responsive sticky metric column, and bilingual copy.
- [ ] Limit My Rikishi comparison selection to two, add `/compare` redirect coverage, run focused tests GREEN plus typecheck, then commit.

### Task 3: Public documentation and end-to-end verification

**Files:**
- Modify: `docs/api/v1.md`
- Modify: `docs/api/v1.en.md`
- Modify: `README.md`
- Modify: `README_en.md`
- Modify: `public/.well-known/api-catalog`
- Modify: `tasks/todo.md`

**Interfaces:**
- Document the exact endpoint and generation/update behavior delivered by Tasks 1 and 2.

- [ ] Update Japanese/English API docs and README endpoint lists, and add the matchup endpoint to the API catalog.
- [ ] Run Python tests, focused and full Vitest, `npm run typecheck`, `npm run build`, and `git diff --check`.
- [ ] Run Impeccable detection on changed UI files and fix blocking findings with covering tests.
- [ ] Verify Japanese/English, light/dark, keyboard interaction, and 360px layout in a real browser.
- [ ] Serve `dist` with Wrangler and prove `/compare` 301, `/compare/` 200, and the matchup JSON 200 with `application/json`.
- [ ] Record commands and results in the `tasks/todo.md` Review section, self-review the complete diff, and commit.

