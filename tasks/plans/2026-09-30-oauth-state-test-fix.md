# OAuth state CI failure

- [x] Inspect the failing commit and GitHub Actions logs.
- [x] Reproduce the signature encoding issue and confirm the fix scope.
- [x] Change the test to alter actual signature bits reliably.
- [x] Run the focused test, full suite, typecheck, build, and diff checks.

## Specification

The tampered-state fixture must always change the decoded HMAC signature.
Keep production OAuth behavior unchanged and preserve the existing expiry,
cookie, and return-path assertions. Work from origin/main in an isolated
worktree because the primary checkout has unrelated local changes.

## Review

Focused tests: 2 passed. Full suite: 90 files / 723 tests passed.
Typecheck, build, and diff checks passed. A deterministic 256-signature
experiment reproduced 15 false tampering cases using the old fixture and
zero using the corrected fixture. No production code changes were needed.
