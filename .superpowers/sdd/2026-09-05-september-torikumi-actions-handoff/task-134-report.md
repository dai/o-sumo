# Task 1/3/4 report: September workflow delivery and operations

## Outcome

- Implementation commits: `8d78e4a` (`ci: restore September torikumi schedules`) and `a1144ba` (`test: harden realtime conflict fixture`)
- No push, PR, merge, deployment, credential change, or external workflow run was performed.
- Existing uncommitted `tasks/todo.md` and `tasks/plans/2026-09-05-september-torikumi-actions-handoff.md` were not staged or changed by this task.

## Implemented

- Restored Daily cron `0 4,6,8,10 * * *` and Realtime cron `*/10 4-9 * * *`; retained manual dispatch and schedule/result scopes.
- Both workflows use `osumo-torikumi-update` with `cancel-in-progress: false`.
- Added timestamp and division-count summaries. Failed generator stderr is separate and preserved JSON is not described as newly generated.
- Daily records PR number, URL, operation, auto-merge request outcome, and observable PR/check/merge state (or unknown/link).
- Realtime distinguishes no-change from pushed and records commit SHA/push outcome.
- Replaced `git rebase -X theirs` with bounded ordinary rebase, abort-on-conflict, fresh-rerun guidance, and post-rebase validation.
- Added workflow mapping, summary behavior, and real bare-remote conflict tests. CI pins `PyYAML==6.0.3` and retains existing checks.
- Synced only the five named documentation files, including PR/merge/main/production and transition preflight/in-tournament distinctions.

## TDD evidence

RED:

```text
python -m unittest scripts.ci.workflow_summary_test scripts.ci.workflow_config_test
ERROR: workflow_summary.py missing; KeyError: schedule (5 errors)

C:/Git/bin/bash.exe scripts/ci/push_realtime_update_test.sh
FAIL: production push helper missing (fixture issue then corrected to clone main explicitly)
```

GREEN:

```text
python -m unittest scripts.ci.workflow_summary_test scripts.ci.workflow_config_test
Ran 5 tests ... OK

C:/Git/bin/bash.exe scripts/ci/push_realtime_update_test.sh
push conflict preserved remote schedule: OK
```

The conflict test uses two working repositories and a local bare remote. A schedule commit lands remotely after the realtime snapshot; realtime rebase conflicts, exits nonzero, and remote stays at two commits with `schedule=remote-new`.

## Fresh verification

```text
python -m unittest scripts.update_sumo_data_parser_test scripts.ci.validate_torikumi_test scripts.ci.workflow_summary_test scripts.ci.workflow_config_test
Ran 73 tests ... OK

C:/Git/bin/bash.exe -n scripts/ci/run_torikumi_generator.sh scripts/ci/push_realtime_update.sh scripts/ci/push_realtime_update_test.sh
exit 0

C:/Git/bin/bash.exe scripts/ci/push_realtime_update_test.sh
push conflict preserved remote schedule: OK

PyYAML safe_load for all three changed workflows
YAML_OK

npm run typecheck
exit 0

npm test -- --run
Test Files 68 passed; Tests 474 passed

npm run build
built in 3.04s; exit 0

git diff --check
git diff --cached --check
exit 0
```

Existing Vitest React act, localStorage, outdated Browserslist, and large-chunk warnings remain; there were no test failures. Local checks prove repository behavior only. Scheduled activation requires merge to default-branch `main`; merge, GitHub-hosted CI, Pages Preview, and production remain unverified and were intentionally not triggered.
