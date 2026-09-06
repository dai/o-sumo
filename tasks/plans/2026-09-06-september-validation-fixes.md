# PR #550 follow-up implementation plan

Goal: Fix the five reviewed gaps and deliver a new PR, without merge or production workflow dispatch.
Approved by user: Implement the proposed plan.
Base at start: origin/main 1f68df77b67bbcb2b038686e29732c0308c09645.
Branch: fix/sep-scheduling-validation.
Architecture: Retain existing generator and public schema. Validate official records before discarding rows, compare canonical public payloads, preserve playoff provenance, share failure diagnostics. No broad restructuring.
Tech: Python stdlib/unittest, Bash/jq, GitHub Actions, existing Vitest/TypeScript/Vite.

## Global constraints

- All implementation is in this isolated worktree. Original checkout/sep-scheduling/other worktrees and their dirty files remain untouched.
- Keep cron expressions, Daily PR delivery, Realtime direct push, scope isolation and existing conflict safety.
- No UI, news behavior, historical archives, generated public JSON or actual match-data changes. Existing isPlayoff?: true and boutNo suffice; no new required public fields.
- Tests use fixtures and temp output; no official network or real Discord sends. Use apply_patch to edit sources. No force push, reset-hard, stash, merge, auto-merge enablement or manual workflow dispatch.
- Python-related regression tests must run in CI. Do not force-add ignored reports or unrelated files.

## Task 1: Implement and test the five coordinated fixes

### A. Reject partial malformed official responses

- In scripts/update_sumo_data.py, normalize collection wrappers without silently discarding malformed bout candidates. Any record with east/west participation keys is a bout candidate; missing/null/non-object sides fail even if other records are valid.
- Retain valid list/object wrapper handling, metadata-only wrappers and legitimate division filtering. Invalid target/missing-division records must not become harmless metadata or wrong-division exclusions.
- Only genuinely empty valid collections mean unpublished; transport and malformed structure are errors. Report day/division and fail before ALL output writers; existing successful outputs stay byte-identical.
- Test normal+malformed mixed responses through real parser, dataset builder, main write boundary and validator, not just parse_torikumi_match with a mock failure.

### B. Make no-op truly immutable

- Build candidate and writer output from the same canonical public payload representation including bashoId, bashoName, year.
- Apply scope preservation before substantive comparison; ignore only timestamps, not actual metadata changes. Candidate missing metadata must not create false differences with checked-in JSON.
- On no substantive change preserve all three timestamps and skip torikumi JSON/TS output writes; full-mode independent banzuke/profile work is not unintentionally suppressed.
- Test initial unpublished and repeated identical published schedule with realistic full metadata using temp output byte comparisons. Test actual schedule changes preserve result array/timestamp and vice versa.

### C. Preserve genuine playoffs without allowing normal corruption

- Distinguish regular TorikumiData vs FinalMuch provenance; keep existing optional isPlayoff and sequential public boutNo.
- Do not deduplicate a distinct playoff only by participant pair. Exact same official record mirrored across collections is emitted once; distinct official bout number/result/etc. means a different bout and is retained. Preserve phase and original order internally before assigning public sequential numbers.
- Validator rejects duplicate ordinary participants/pairs. Day15 explicitly marked playoffs may repeat regular pair regardless east/west orientation, and later distinct playoff bouts may repeat a pair with different boutNo. Reject duplicate boutNo, non-day15 playoff, invalid flag types, illegal cross-division reappearance and unchanged invalid fusen overlap.
- Normal bout limits remain21/14; playoffs are not truncated by the parser or sanitize_division_day. Test a full normal card plus playoff through parser -> normalization -> public output -> validator.
- Tests: identical same-record mirrored response (one bout), regular plus different same-pair playoff in same and reversed orientations (two), multiple playoffs, invalid normal repeats, cross-division repeats, duplicate numbers, fusen loser active elsewhere.

### D. Deliver meaningful failure notifications

- Add shared bounded diagnostic extraction used by both Daily/Realtime summary and Discord. Include failed day, division, error category and run link; unknown diagnostics explicitly say unknown and link to run.
- Extract only allowlisted day/division/category fields from generator diagnostics, never forward arbitrary logs/tracebacks/secrets. Existing stderr capture can remain. Keep detail bounded below Discord embed description limit.
- Fix scripts/ci/notify_discord.sh: read -d '' with set-e currently aborts before curl, and shell @Q is not valid JSON quoting. Build entire JSON via jq -n --arg, keep optional secrets unset => exit0, curl bounded timeout, and notification failure never obscures primary workflow failure.
- Test actual script with PATH-stub curl (no real network), inspect valid JSON including quotes/newlines, fields, no-secret no-op, HTTP failure; ensure both workflows actually wire shared diagnostics and retain failure condition.

### E. Synchronize operations docs

- Update Japanese/English README and DEVELOPMENT plus scripts/ci README to remove current manual-only/news-only claims; label retained historical material by period.
- Keep exact JST times, Sept12 manual fallback, PR/main/production verification distinctions, post-Sep27 plus next-day confirmation cron removal in separate PR, transition-only preflight pause rule.
- Do not change news workflow behavior or cron.

### Implementation process and evidence

- Use TDD: write focused regressions, observe RED, implement minimal fix, observe GREEN. Commit in ingestion/no-op, playoffs, notification/docs logical groups if practical.
- Run Python parser/validator/summary/config/new tests, standalone torikumi logic, shell conflict and notification tests, YAML/shell syntax, Vitest all, typecheck, build, blog-feed drift and git diff --check.
- Independent read-only review must have no unresolved P1+ before delivery.
- Owned task files: generator + its tests, CI validator/helpers/tests, Daily/Realtime/Test workflows, five docs above. Do not edit controller tasks/todo or this plan. Reports remain ignored scratch.

## Delivery (controller)

- Recheck latest main, incorporate safely if required and retest. Stage only task files.
- Push new branch and create PR to main titled: fix: harden September torikumi ingestion and notifications.
- PR body links #550, maps all5 findings to fixes/tests, explains compatibility and unverified production operations. Do not copy stale handoff status wholesale.
- Wait for Test and both Cloudflare Pages checks; fix branch-caused failures and update same PR without force push.
- Report PR URL and checks. No merge/auto-merge/manual workflows/real Discord.
- Leave post-merge no-op observation and Sept12 actual publication checks as explicit unchecked operational items.
