# Task 1 report: current-data preflight

## Scope

Implemented the read-only current-data switch preflight with default arguments `--current-month 202607 --target-month 202609`. The implementation does not run a generator and does not write tracked data, routes, sitemap entries, redirects, or workflow schedules.

## TDD evidence

RED was run before `scripts/preflight_current_basho.py` existed:

```text
$ python scripts/preflight_current_basho_test.py
FileNotFoundError: ... scripts\preflight_current_basho.py
exit_code=1
```

The focused fixture suite was then run after the minimal implementation:

```text
$ python scripts/preflight_current_basho_test.py
.....
----------------------------------------------------------------------
Ran 5 tests in 0.018s

OK
exit_code=0
```

The fixtures cover the official 15-day schedule and 42/28 banzuke counts, unpublished/mismatched official data, local day contracts, duplicate archive/day failure, target source absence, and workflow manual-only checks.

## Verification

```text
$ npm test
Test Files  58 passed (58)
Tests  411 passed (411)
exit_code=0

$ npm run typecheck
exit_code=0

$ npm run build
exit_code=0

$ git diff --check
exit_code=0
```

The build retained existing large-chunk and stale Browserslist warnings; no build error occurred.

Live preflight on 2026-08-27:

```text
$ npm run preflight:current-data
[OK] official schedule fetched and parsed ... source=https://sumo.or.jp/Admission/schedule/
[OK] official banzuke fetched and parsed ... source=https://sumo.or.jp/ResultBanzuke/table/
[OK] official target month ... actual=202609
[OK] official schedule days ... actual=15 days 2026-09-13..2026-09-27
[OK] official banzuke month ... actual=202609
[OK] official banzuke makuuchi count ... actual=42
[OK] official banzuke juryo count ... actual=28
[OK] local banzuke month ... actual=七月場所
[OK] local banzuke counts ... actual=makuuchi=42 juryo=28
[OK] local torikumi month ... actual=七月場所
[OK] local banzuke/torikumi identity ...
[OK] local result day contract ...
[OK] local schedule day contract ...
[OK] outgoing archive uniqueness ... actual=ids=3 paths=9
[OK] simulated target route uniqueness ... actual=33
[OK] simulated target sitemap uniqueness ... actual=33
[OK] target absent from current route/sitemap/redirect sources ... actual=none
[OK] data workflows manual-only ... actual=both workflows manual-only
READY
exit_code=0
```

## Files changed

- `scripts/preflight_current_basho.py`
- `scripts/preflight_current_basho_test.py`
- `scripts/fixtures/preflight/annual-schedule-202609.html`
- `scripts/fixtures/preflight/banzuke-202609.json`
- `package.json`
- `README.md`
- `README_en.md`
- `tasks/todo.md`

## Self-review

- Official schedule fetch/parse and official banzuke fetch/parse failures are fatal and never replaced with local values.
- All gates use `[OK]`/`[FAIL] expected=... actual=... source=...`; only an all-OK result exits 0.
- The source scan excludes this documentation and only checks current route, sitemap, redirect, archive, and build configuration sources for target references.
- No 202609 generated data, route definitions, sitemap entries, redirects, or workflow schedules were added.

## Commit

Implementation commit after verification: `22239ce7a6a07e97cfe03833c9b447e8ad997144`.
