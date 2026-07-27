# July 2026 Official Basho Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the incorrect July 2026 analytics results with literal values from the Nihon Sumo Kyokai's finalized announcement.

**Architecture:** Keep the results panel in `app/analytics/page.tsx`, but replace the inferred division leaders and unannounced special-prize placeholders with one immutable, source-faithful array. Render one row per award recipient so that each rikishi remains paired with the correct record, including the three separate Kanto-sho recipients.

**Tech Stack:** React 19, TypeScript, react-i18next, Vitest, Testing Library

## Global Constraints

- Work only in the existing `feat-aug` worktree at `C:\dai\GitHub\copilot-worktrees\o-sumo\dai-laughing-funicular`.
- Preserve the workflow, banner, and development-document changes already committed on `feat-aug`.
- Treat `https://sumo.or.jp/EnHonbashoMain/champions/1000/` as the source of truth for the finalized July 2026 champions and special prizes.
- Use the finalized Nihon Sumo Kyokai values exactly: Aonishiki 12-3 (Makuuchi champion and Gino-sho), Fujinokawa 8-7 (Shukun-sho), Atamifuji 12-3, Kotoeiho 11-4, and Takayasu 11-4 (Kanto-sho), and Shonannoumi 11-4 (Juryo champion).
- Display the Japanese shikona and records as `安青錦 12勝3敗`, `藤ノ川 8勝7敗`, `熱海富士 12勝3敗`, `琴栄峰 11勝4敗`, `高安 11勝4敗`, and `湘南乃海 11勝4敗`.
- Do not derive champions or special-prize winners from `sumo-data` or `torikumi-data`.
- Do not add dependencies or alter analytics styling unless the additional Kanto-sho rows expose a verified layout defect.

---

## File Map

- Modify `app/analytics/page.tsx`: define and render the finalized literal results; remove inference-only imports and helpers.
- Modify `app/analytics/page.test.tsx`: assert every official recipient and record, including all three Kanto-sho rows.
- Modify `src/locales/ja/common.json`: remove the now-unused `analytics.results.tba` text.
- Modify `src/locales/en/common.json`: remove the now-unused `analytics.results.tba` text.
- Modify `tasks/todo.md`: track implementation and record verification evidence in a Review section.

### Task 1: Replace inferred results with the official finalized announcement

**Files:**
- Modify: `app/analytics/page.test.tsx:6-96`
- Modify: `app/analytics/page.tsx:4-128,135,186-192`
- Modify: `src/locales/ja/common.json:94-109`
- Modify: `src/locales/en/common.json:94-109`
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes: `t('analytics.results.category.<category>')` for the existing localized category labels.
- Produces: internal `JULY_2026_BASHO_RESULTS`, a readonly array of `{ id, category, rikishi, record }` rows rendered directly by `AnalyticsDashboardPage`.

- [x] **Step 1: Replace placeholder-oriented tests with exact official-result assertions**

Remove the `buildBashoResultsRows` import from `app/analytics/page.test.tsx`, then replace the placeholder assertions with consumer-visible row assertions equivalent to:

```tsx
expect(screen.getByRole('row', { name: '幕内最高優勝 安青錦 12勝3敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '殊勲賞 藤ノ川 8勝7敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '敢闘賞 熱海富士 12勝3敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '敢闘賞 琴栄峰 11勝4敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '敢闘賞 高安 11勝4敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '技能賞 安青錦 12勝3敗' })).toBeInTheDocument();
expect(screen.getByRole('row', { name: '十両優勝 湘南乃海 11勝4敗' })).toBeInTheDocument();
expect(screen.queryByText('発表前')).not.toBeInTheDocument();
```

In the rendered-panel test, assert that `発表前` is absent and that rows such as `敢闘賞 熱海富士 12勝3敗`, `敢闘賞 琴栄峰 11勝4敗`, and `敢闘賞 高安 11勝4敗` are present.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- --run app/analytics/page.test.tsx
```

Expected: FAIL because `JULY_2026_BASHO_RESULTS` does not exist and the current panel still renders inferred champions plus `発表前` special-prize rows.

- [x] **Step 3: Add the finalized literal results and remove inference logic**

In `app/analytics/page.tsx`, remove the `juryo` and `torikumiData` imports, `topDivisionRikishi`, `formatRecord`, `buildBashoResultsRows`, and the `announced` property. Define this internal readonly array next to `ResultsRow`:

```tsx
const JULY_2026_BASHO_RESULTS = [
  { id: 'makuuchi-yusho-aonishiki', category: 'makuuchiYusho', rikishi: '安青錦', record: '12勝3敗' },
  { id: 'shukun-fujinokawa', category: 'shukun', rikishi: '藤ノ川', record: '8勝7敗' },
  { id: 'kanto-atamifuji', category: 'kanto', rikishi: '熱海富士', record: '12勝3敗' },
  { id: 'kanto-kotoeiho', category: 'kanto', rikishi: '琴栄峰', record: '11勝4敗' },
  { id: 'kanto-takayasu', category: 'kanto', rikishi: '高安', record: '11勝4敗' },
  { id: 'gino-aonishiki', category: 'gino', rikishi: '安青錦', record: '12勝3敗' },
  { id: 'juryo-yusho-shonannoumi', category: 'juryoYusho', rikishi: '湘南乃海', record: '11勝4敗' },
] as const satisfies readonly ResultsRow[];
```

Render `JULY_2026_BASHO_RESULTS` directly, use `row.id` as the React key, and render `row.rikishi` and `row.record` unconditionally. Remove `analytics.results.tba` from both locale files because no result row remains pending.

- [x] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- --run app/analytics/page.test.tsx
```

Expected: all analytics page tests pass in Japanese and English modes, with no `発表前` output.

- [x] **Step 5: Run the full verification stack**

Run:

```powershell
npm run typecheck
npm test -- --run
npm run build
git diff --check
```

Expected: typecheck, all tests, and build pass; `git diff --check` prints no errors. The existing Vite large-chunk warning is acceptable if no new warning appears.

- [x] **Step 6: Review the final diff against the official values**

Run:

```powershell
git diff -- app/analytics/page.tsx app/analytics/page.test.tsx src/locales/ja/common.json src/locales/en/common.json
```

Confirm that the seven rows and six unique rikishi/record pairs exactly match the Nihon Sumo Kyokai announcement and that no workflow, banner, documentation, route, or analytics aggregation code changed as part of this correction.

- [x] **Step 7: Record evidence and commit the correction**

Append the focused-test, typecheck, full-test, build, and diff-check results to the Review section in `tasks/todo.md`, then run:

```powershell
git add app/analytics/page.tsx app/analytics/page.test.tsx src/locales/ja/common.json src/locales/en/common.json tasks/todo.md docs/superpowers/plans/2026-07-27-july-2026-official-basho-results.md
git commit -m "fix: use official July basho results"
```

Expected: one focused correction commit on `feat-aug`; pushing remains a separate user-approved endpoint.
