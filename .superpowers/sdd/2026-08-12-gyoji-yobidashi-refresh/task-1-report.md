# Task 1 Implementation Report

## Result

Implemented the standard-library-only official profile generator and generated the current photo-free API snapshot from the Japan Sumo Association list pages and linked individual profile pages.

Implementation commit: `1a61d1f90fe790b0c9fd492e56fd173a0ccab769` (`feat: generate official gyoji and yobidashi profiles`).

## TDD evidence

### RED

Command:

```text
python scripts/update_official_profiles_test.py
```

Expected initial failure observed before `scripts/update_official_profiles.py` existed:

```text
FAIL: test_generates_validated_numeric_profiles_from_injected_fixture_fetch
AssertionError: 2 != 0: ... can't open file ... update_official_profiles.py: [Errno 2] No such file or directory
```

The rank-code extension was also driven by a failing fixture test after replacing the second fixture rank with the official current `三役行司`:

```text
AssertionError: 1 != 0: gyoji 1987 has unknown rank: 三役行司
```

The era-first-year regression similarly failed before support was added:

```text
AssertionError: 1 != 0: unsupported adopted date: 平成元年3月
```

### GREEN

Command:

```text
python scripts/update_official_profiles_test.py
```

Output:

```text
..
----------------------------------------------------------------------
Ran 2 tests in 0.274s

OK
```

The fixture suite injects its HTTP fetch through `--fixtures-dir`; it has no network dependency. It proves numerical IDs, rank codes, Showa and Heisei-first-year date normalization, optional history, photo-field exclusion, removal of stale slug JSON, and failure before any output is written for a mismatched profile detail.

## Generated snapshot

Command:

```text
python scripts/update_official_profiles.py --output-root public/api/v1
```

Output:

```text
gyoji=42 yobidashi=45
```

Post-generation checks confirmed:

- `gyoji`: 42 index records and 42 numeric profile files.
- `yobidashi`: 45 index records and 45 numeric profile files.
- Every index ID is a positive JSON number and exactly matches a `*.json` profile filename.
- Generated profile JSON contains no photo or image fields.
- The old name-slug profile files were removed.
- `git diff --check` passed for the Task 1 staged change.

Representative generated profile: `gyoji/1986.json` is 木村 庄之助, with `birthDate: "1961-10-30"`, `adoptedAt: "1977-10"`, and the full official profile URL as `sourceUrl`.

## Validation decisions

- The generator accepts only positive numerical IDs from official `/Profile/{kind}/{id}/` URLs.
- It requires name, yomi, real name, rank, affiliation, birth date, birthplace, and adoption month; list/detail name, yomi, rank, real name, and affiliation must agree.
- It converts Japanese era dates to ISO values, including the first year written as `元年`.
- It rejects unknown official rank labels instead of inventing a code.
- All pages are parsed and validated in memory before the staged output replaces `public/api/v1` targets.
- The production fetch is injectable and the fixture path is the test-only replacement; no external package is used.

## Changed files

- `scripts/update_official_profiles.py`
- `scripts/update_official_profiles_test.py`
- `scripts/fixtures/official_profiles/*`
- `public/api/v1/gyoji.json` and 42 numeric detail JSON files
- `public/api/v1/yobidashi.json` and 45 numeric detail JSON files
- Removed the 12 stale slug-named detail JSON files
- `tasks/todo.md`

## Self-review

The parser targets the official list/profile tables using `html.parser`, stores no HTML images or image URLs, and is intentionally strict on schema drift. Its JSON contract uses number IDs as required by the follow-up UI task. This Task does not change application or TypeScript files; the existing UI is therefore expected to be updated by Task 2 before an overall typecheck/build is considered meaningful.

## Review fix round 1

### RED

After adding four regression tests, the focused command failed as expected:

```text
python scripts/update_official_profiles_test.py
```

```text
FAIL: malformed list row returned exit code 0
FAIL: embedded nonidentical detail name returned exit code 0
FAIL: date-only, timezone-naive, and +09:00 retrievedAt values were accepted
ERROR: write_json_outputs() got an unexpected keyword argument 'replace_operation'
```

### Fixes

- A non-four-cell row in the selected official list table now raises a controlled `invalid row` error; it cannot be silently skipped.
- The profile heading is parsed into normalized name, known-rank label, and yomi fields. Each must exactly equal the corresponding list field.
- `retrievedAt` now requires a timezone-aware zero-offset ISO timestamp and is serialized canonically with `Z`.
- `write_json_outputs` accepts an injectable replacement operation, records each successfully installed target, removes those targets on failure, and restores every backup in reverse order.

### GREEN

```text
python scripts/update_official_profiles_test.py
```

```text
......
----------------------------------------------------------------------
Ran 6 tests in 1.516s

OK
```

The atomic rollback test creates a complete four-target old snapshot, injects an `OSError` during the second staged install, and verifies every old file is restored byte-for-byte.
