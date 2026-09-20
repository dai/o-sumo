# osada.us `/analytics` live dashboard — design

Date: 2026-09-20  
Repo: `dai/o-sumo`  
Primary file today: `app/analytics/page.tsx`  
Status: approved in chat (Phase 1 + Phase 2); awaiting user review of this written spec before implementation plan

## Goal

Make `/analytics/` useful **during** a basho as a live status dashboard, not only after the basho ends. Keep the same page for post-basho championship / sanshō results.

Out of scope for this design: prerender/SSR for AdSense, matchup heatmaps, deep compare-page integration (Phase 3+).

## Current behavior (problem)

- `getBashoStatus(...).kind === 'final'` gates almost the whole main content.
- While the basho is in progress, users mostly see a “not final yet” notice.
- When final, championship / sanshō / jūryō yūshō rows are **hardcoded** for July 2026 (`JULY_2026_BASHO_RESULTS`).
- Metrics, win leaders, and kimarite already exist as pure helpers (`buildDashboardMetrics`, `topRikishiByWins`, `topKimarite`) but only render behind that gate.
- Data is bundled (`sumo-data` / `torikumi-data`), not read from public JSON on the page.

## Approach (hybrid C)

Ship in two phases: ungate first (fast UX win on current bundled data), then switch the page to public JSON and add jūryō + real post-basho results.

---

## Phase 1 — Mid-basho dashboard (bundled data)

### Behavior

1. Stop hiding metrics / leaders / kimarite behind `isFinal`.
2. Mid-basho layout (top to bottom):
   - Header unchanged (eyebrow, title, description, links to current result / schedule).
   - Summary metrics: makuuchi count, total W-L + win rate, undefeated count (+ short name note), max wins.
   - Win leaders: top 8 by wins (then fewer losses).
   - Kimarite ranking: top 6 from makuuchi matches in the current `torikumiArchive`.
3. Do **not** show the championship / sanshō table mid-basho.
4. Leave `JULY_2026_BASHO_RESULTS` in place for now; only show that block when `isFinal` (unchanged content, still July hardcode until Phase 2).
5. No jūryō panels in Phase 1.
6. No switch to `fetch` / public JSON in Phase 1.

### Data

- Continue using existing imports: `makuuchiData`, `torikumiArchive`, `torikumiMonthKey`, `getBashoStatus`, `CURRENT_*_PATH`.
- Assumes current basho bundles are already switched (e.g. September 2026) by the normal data pipeline.

### Success criteria

- Opening `/analytics/` during an in-progress basho shows the three live blocks with real numbers, not only the pending notice.
- Final basho still shows the (still-hardcoded) results table plus the same three blocks.
- No change to other routes.

### Non-goals (Phase 1)

- API fetch, jūryō parity, fixing yūshō/sanshō hardcode, markdown enrichment beyond what already exists.

---

## Phase 2 — Public JSON + jūryō + real finals

### Behavior

1. Page loads `https://osada.us/api/v1/banzuke.json` and `https://osada.us/api/v1/torikumi.json` (same shapes already published). Prefer relative `/api/v1/...` in-app if that matches existing fetch patterns.
2. Reuse the same aggregation helpers; change their inputs to JSON-derived makuuchi / jūryō wrestler lists and torikumi day matches.
3. Add **jūryō** blocks with the same three panels (summary, leaders, kimarite), below makuuchi.
4. When basho is final, show championship / sanshō / jūryō yūshō table from **per-basho result data** (new or extended archive field / JSON). No July hardcode.
5. If result data is missing for that basho, omit the table (do not invent winners).
6. Fetch failure: short soft-fail message in main; keep header and nav links.
7. Agent markdown view: keep API links; add one line that mid-basho = live aggregates, post-basho = results table when available.

### Data notes

- `banzuke.json`: `makuuchi` / `juryo` groups with `wins` / `losses` / `results` — enough for summary + leaders.
- `torikumi.json`: `resultDays[].data.makuuchi.matches` / `juryo.matches` with `kimarite` — enough for technique counts; treat `pending` days as empty.
- Yusho / sanshō are **not** in current torikumi JSON; Phase 2 must add a small explicit source (e.g. `basho-results` map keyed by `YYYYMM`, or fields on an existing archive module). Exact file name is an implementation detail; the contract is: keyed by basho month, categories `makuuchiYusho | shukun | kanto | gino | juryoYusho`, rikishi name + record string (or structured wins/losses).

### Success criteria

- Mid-basho dashboard tracks published JSON after a data refresh without editing page hardcode.
- Jūryō panels appear with the same structure as makuuchi.
- After a basho ends and result data exists, the awards table shows that basho’s winners, not July 2026.
- Failed fetch does not blank the whole chrome of the page.

### Non-goals (Phase 2)

- Matchup heatmaps (`rikishi-matchups.json`), compare-page deep links as a product feature, SSR/prerender.

---

## UI / UX notes

- Keep existing i18n keys under `analytics.*` where possible; add keys for jūryō section headings and soft-fail.
- Visual language stays with current `page.css` cards / tables / technique bars.
- Breadcrumb and home link unchanged.

## Testing (both phases)

- Mid-basho fixture: `bashoStatus.kind !== 'final'` → three makuuchi blocks visible; awards table hidden.
- Final fixture: awards table visible when result data present.
- Kimarite helper ignores matches without `kimarite`.
- Phase 2: mock fetch error → soft-fail copy shown.

## Rollout

1. Implement Phase 1 → PR → verify on production mid-September basho.
2. Implement Phase 2 → PR (JSON wiring + jūryō + results source) → verify live + one archived final month.

## Open points (resolved in chat)

- Primary goal: live mid-basho dashboard.
- Scope: all listed panels eventually; Phase 1 = makuuchi three blocks ungated.
- Approach: hybrid C (ungate, then JSON).
