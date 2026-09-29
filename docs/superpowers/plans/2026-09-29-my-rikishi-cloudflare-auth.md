# My Rikishi Cloudflare Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional Google OAuth login and cross-device My Rikishi synchronization using Cloudflare Pages Functions and a dedicated D1 database while preserving anonymous `localStorage` behavior.

**Architecture:** Keep the public SPA and public JSON API unchanged. Add a small authentication and synchronization API under `functions/api/auth/*` and `functions/api/my-rikishi.ts`; store users, hashed sessions, and selected rikishi IDs in D1. The browser uses an adapter boundary so anonymous users continue using `localStorage`, while authenticated users use the remote store and merge their local selections once at sign-in.

**Tech Stack:** React 19, TypeScript, Vite, Cloudflare Pages Functions, Cloudflare D1, Cloudflare KV only for the existing OGP cache, Google OAuth 2.0, Web Crypto API, Vitest, Playwright, and the `cf` CLI.

**Spec:** `C:\dai\GitHub\o-sumo\tasks\plans\2026-09-my-rikishi-auth-provider-options.md`

## Global Constraints

- Anonymous use remains fully functional without an account.
- Existing `o-sumo:my-rikishi:v1` local storage behavior and the maximum of 20 IDs remain compatible.
- Store only stable `rikishi_id` values; names, ranks, results, and schedules remain sourced from existing public JSON.
- Do not reuse `COMPARE_OG_CACHE` for user data or sessions.
- Do not implement password authentication in the first release.
- Never log OAuth client secrets, session tokens, authorization codes, email addresses, or full provider responses.
- All user-data endpoints must authenticate with an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie and authorize by the session's user ID.
- All new user-facing copy must be added to both `src/locales/ja/common.json` and `src/locales/en/common.json`.
- Do not mutate production Cloudflare resources until the resource names, bindings, OAuth redirect URL, and rollback path are reviewed.

## Review Focus

- OAuth callback replay or forged `state` must fail with no session created; test in Task 2.
- A session for user A must never read or write user B's rows; test in Task 3.
- Local and remote selections must merge without duplicates and without silently exceeding 20 IDs; test in Task 4.
- Network failure, expired session, and offline navigation must preserve the usable local selection; test in Task 4.
- Preview and production must use separate OAuth redirect URLs and D1 bindings; test in Task 6.

---

## Task 1: Define the Cloudflare resource boundary and local runtime

**Files:**
- Create: `wrangler.toml` only if Pages local development cannot bind D1 through the existing project configuration; otherwise document the Pages binding in `functions/README.md`.
- Modify: `functions/README.md`
- Modify: `package.json` only if a dedicated local auth or D1 test script is needed.
- Test: `scripts/verify_my_rikishi_auth.ps1`

**Interfaces:**
- Produces the binding names `MY_RIKISHI_DB` and `AUTH_SESSION_TTL_SECONDS` for later tasks.
- Keeps the existing `COMPARE_OG_CACHE` binding unchanged.

- [ ] **Step 1: Capture current resource state with `cf` CLI**

Run read-only discovery and inspection commands:

```powershell
cf cli search "list Cloudflare Pages projects"
cf pages projects list
cf cli search "list Cloudflare D1 databases"
cf d1 list
cf cli search "show Cloudflare Workers account usage"
cf billing usage get-account-usage-v2
```

Expected: the `o-sumo` Pages project is identified, the existing OGP KV is not treated as user storage, and the billing usage result is either available or explicitly recorded as permission-limited.

- [ ] **Step 2: Create a named D1 database only after review**

Use the discovered command and an explicit name such as `o-sumo-my-rikishi`. Do not reuse the unrelated existing D1 database. Record the returned database ID in the private deployment notes, never in source control.

- [ ] **Step 3: Configure the Pages binding for Preview and Production**

Use `cf cli search` to find the Pages project environment-variable/binding update command, then configure `MY_RIKISHI_DB` separately for Preview and Production. The binding must point to the new D1 database in both environments, while OAuth client IDs and secrets remain environment-specific.

- [ ] **Step 4: Add a local verification script**

The script must check that the local Pages runtime can start, `/api/auth/session` responds, and the D1 binding is present without printing secrets. It must fail if a production binding is accidentally used for local development.

- [ ] **Step 5: Run the local check**

Run:

```powershell
npm run build
npx wrangler pages dev ./dist --port 3002
pwsh ./scripts/verify_my_rikishi_auth.ps1
```

Expected: the existing Markdown and Pages Function routes still work, and the auth route returns an unauthenticated response rather than a runtime error.

- [ ] **Step 6: Commit the resource-boundary documentation**

```powershell
git add functions/README.md scripts/verify_my_rikishi_auth.ps1 package.json wrangler.toml
git commit -m "docs: define Cloudflare auth resource boundary"
```

## Task 2: Implement Google OAuth state and callback handling

**Files:**
- Create: `functions/api/auth/google.ts`
- Create: `functions/api/auth/callback/google.ts`
- Create: `functions/api/auth/session.ts`
- Create: `functions/lib/auth.ts`
- Create: `functions/lib/oauth-state.ts`
- Create: `functions/lib/auth.test.ts`
- Create: `functions/lib/oauth-state.test.ts`

**Interfaces:**
- `createOAuthState(returnTo: string, secret: string): Promise<{ state: string; nonce: string; cookie: string }>`
- `consumeOAuthState(request: Request, secret: string): Promise<{ nonce: string; returnTo: string } | null>`
- `getSessionUser(request: Request, env: AuthEnv): Promise<AuthUser | null>`
- `setSessionCookie(response: Response, rawToken: string, expiresAt: string): Response`

- [ ] **Step 1: Write failing tests for OAuth state**

Cover valid state, tampered state, expired state, invalid `returnTo`, and replayed state. The test must assert that secrets and raw state tokens are never returned in error messages.

- [ ] **Step 2: Implement signed, short-lived OAuth state**

Use Web Crypto HMAC or an equivalent signed payload with a five-minute expiry. Store the nonce and return path in the state payload. Use a same-site, short-lived cookie to prevent callback replay. Allow only same-origin relative return paths such as `/my-rikishi/`.

- [ ] **Step 3: Write failing tests for the callback**

Mock Google's token and userinfo responses. Cover provider error, missing code, state mismatch, nonce mismatch, invalid profile subject, and successful user creation/update.

- [ ] **Step 4: Implement the Google callback**

The callback must exchange the code server-side, verify the returned identity, upsert the provider identity in D1, create a random session token, store only its SHA-256 hash, set the session cookie, and redirect to the validated `returnTo` path.

- [ ] **Step 5: Implement the session endpoint**

`GET /api/auth/session` returns `{ authenticated: false }` or a minimal user object containing an internal user ID and display name. Never return provider access tokens.

- [ ] **Step 6: Run focused tests**

```powershell
npx vitest run functions/lib/oauth-state.test.ts functions/lib/auth.test.ts
```

Expected: all OAuth state, callback, and session tests pass.

- [ ] **Step 7: Commit the auth core**

```powershell
git add functions/api/auth functions/lib/auth.ts functions/lib/oauth-state.ts functions/lib/*.test.ts
git commit -m "feat: add Cloudflare Google OAuth session core"
```

## Task 3: Add D1 schema, session storage, and authorized API

**Files:**
- Create: `migrations/0001_my_rikishi_auth.sql`
- Create: `functions/lib/db.ts`
- Create: `functions/api/my-rikishi.ts`
- Create: `functions/api/auth/logout.ts`
- Create: `functions/lib/db.test.ts`
- Create: `functions/api/my-rikishi.test.ts`

**Interfaces:**
- `GET /api/my-rikishi` returns `{ ids: number[] }`.
- `PUT /api/my-rikishi` accepts `{ ids: number[] }` and returns the normalized result.
- `DELETE /api/my-rikishi/:id` removes one ID for the authenticated user.
- `POST /api/auth/logout` revokes the current session and clears the cookie.

- [ ] **Step 1: Write the D1 migration**

Create `users`, `sessions`, and `my_rikishi` tables. Use a unique provider identity, a hashed session token primary key, foreign keys, an index on `(user_id, sort_order)`, and timestamps stored as ISO strings.

- [ ] **Step 2: Write failing API tests**

Cover unauthenticated 401 responses, authenticated read/write, malformed JSON, invalid IDs, duplicate IDs, the 20-ID limit, cross-user access attempts, session expiry, and logout revocation.

- [ ] **Step 3: Implement normalized D1 access**

Reuse the existing normalization rules from `app/lib/my-rikishi.ts` at the server boundary. Enforce the limit server-side even if the browser is modified.

- [ ] **Step 4: Apply the migration in a non-production D1 environment**

Use the discovered `cf d1 migrations apply` command with the exact database ID returned by `cf d1 create`. Verify the migration table and expected schema through the CLI without selecting user data.

- [ ] **Step 5: Run focused API tests**

```powershell
npx vitest run functions/lib/db.test.ts functions/api/my-rikishi.test.ts
```

Expected: authorization and data-isolation tests pass.

- [ ] **Step 6: Commit the API layer**

```powershell
git add migrations functions/api/my-rikishi.ts functions/api/auth/logout.ts functions/lib/db.ts functions/**/*.test.ts
git commit -m "feat: add D1-backed My Rikishi API"
```

## Task 4: Replace direct storage access with an auth-aware store

**Files:**
- Modify: `app/lib/my-rikishi.ts`
- Create: `app/lib/my-rikishi-store.ts`
- Create: `app/lib/my-rikishi-store.test.ts`
- Modify: `app/lib/my-rikishi.test.ts`
- Modify: `app/components/MyRikishiToggle.tsx`
- Modify: `app/rikishi/MyRikishiPage.tsx`

**Interfaces:**
- `MyRikishiStore.load(): Promise<number[]>`
- `MyRikishiStore.replace(ids: number[]): Promise<number[]>`
- `MyRikishiStore.remove(id: number): Promise<number[]>`
- `mergeMyRikishiIds(localIds: number[], remoteIds: number[]): { ids: number[]; truncated: boolean }`

- [ ] **Step 1: Write failing store tests**

Cover local-only mode, authenticated remote mode, first-login union, duplicate removal, truncation at 20, remote 401 fallback, network failure fallback, and no data loss when an optimistic remote write fails.

- [ ] **Step 2: Implement local and remote adapters**

Keep the existing local storage key and browser event behavior. The remote adapter calls the Pages Function API with credentials included and never stores the session token in JavaScript-accessible storage.

- [ ] **Step 3: Implement session-aware hook behavior**

Load `/api/auth/session` once, use local storage while unauthenticated, and perform the merge exactly once after authentication becomes available. Keep the UI usable while the remote request is pending.

- [ ] **Step 4: Add explicit sync status**

Expose `authenticated`, `syncing`, and `syncError` to the page and toggle components. Add Japanese and English messages for sign-in required, sync failed, and local changes retained.

- [ ] **Step 5: Run store and existing My Rikishi tests**

```powershell
npx vitest run app/lib/my-rikishi.test.ts app/lib/my-rikishi-store.test.ts app/rikishi/MyRikishiPage.test.tsx
```

Expected: old local storage tests and new remote synchronization tests pass together.

- [ ] **Step 6: Commit the adapter integration**

```powershell
git add app/lib/my-rikishi.ts app/lib/my-rikishi-store.ts app/lib/*.test.ts app/components/MyRikishiToggle.tsx app/rikishi/MyRikishiPage.tsx src/locales/ja/common.json src/locales/en/common.json
git commit -m "feat: sync My Rikishi through authenticated store"
```

## Task 5: Add login, logout, and account-linking UI

**Files:**
- Create: `app/components/AuthControls.tsx`
- Create: `app/components/AuthControls.test.tsx`
- Modify: `app/components/PrimaryNavigation.tsx`
- Modify: `app/rikishi/MyRikishiPage.tsx`
- Modify: `src/locales/ja/common.json`
- Modify: `src/locales/en/common.json`

**Interfaces:**
- Unauthenticated users see an optional Google sign-in action.
- Authenticated users see a minimal account state and logout action.
- Existing My Rikishi add/remove/filter actions remain available without login.

- [ ] **Step 1: Write failing UI tests**

Cover anonymous rendering, login redirect, authenticated rendering, logout, sync indicator, and preservation of local selections when the API fails.

- [ ] **Step 2: Implement the minimal controls**

Use a normal link to `/api/auth/google?returnTo=/my-rikishi/` for login. Do not add a modal, password form, or provider SDK to the SPA.

- [ ] **Step 3: Add localized copy**

Add exact paired keys for sign in, sign out, sync in progress, sync failure, and local changes retained. Keep the existing Digital Washi visual rules: square controls, no decorative borders, and existing typography.

- [ ] **Step 4: Run UI tests and typecheck**

```powershell
npx vitest run app/components/AuthControls.test.tsx app/components/PrimaryNavigation.test.tsx app/rikishi/MyRikishiPage.test.tsx
npm run typecheck
```

Expected: the login UI does not change anonymous behavior.

- [ ] **Step 5: Commit the UI**

```powershell
git add app/components/AuthControls.tsx app/components/AuthControls.test.tsx app/components/PrimaryNavigation.tsx app/rikishi/MyRikishiPage.tsx src/locales/ja/common.json src/locales/en/common.json
git commit -m "feat: add optional My Rikishi login controls"
```

## Task 6: Configure Preview and Production safely with `cf`

**Files:**
- Modify: `functions/README.md`
- Create: `docs/auth/my-rikishi-cloudflare-operations.md`
- Create: `scripts/verify_my_rikishi_preview.ps1`

**Interfaces:**
- Preview and Production have separate Google OAuth credentials and separate redirect URLs.
- Secrets are configured through Cloudflare secrets, never committed to source control.

- [x] **Step 1: Register the Google OAuth application**

Create separate credentials for Preview and Production. Use the exact URLs:

```text
https://<preview-host>/api/auth/callback/google
https://osada.us/api/auth/callback/google
```

Store client IDs as non-secret configuration only when the Pages environment requires it; store client secrets and the session signing secret as Cloudflare secrets.

- [x] **Step 2: Configure D1 and secrets with discovered `cf` commands**

Before each mutating command, run `cf cli search` with an anonymous description, then use the returned command. Required values are:

```text
MY_RIKISHI_DB
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SESSION_SECRET
AUTH_ORIGIN
```

Use separate Preview and Production values. Do not print any secret in command output or logs.

- [x] **Step 3: Apply migrations to Preview D1 and verify**

Run the exact discovered `cf d1 migrations apply` command against the Preview database. Verify only table names and migration status.

- [ ] **Step 4: Run the Preview verification script**

The script must verify:

```text
anonymous session -> unauthenticated response
Google login -> callback -> authenticated session
local IDs [1, 2] + remote IDs [2, 3] -> [1, 2, 3]
logout -> unauthenticated response
cross-user request -> 401 or empty own-user result
```

- [ ] **Step 5: Record the production gate**

Production migration and secret setup require a separate explicit confirmation after Preview browser verification. The operations document must include rollback: disable login link, preserve local storage, leave existing public pages and API untouched, and revoke sessions if required.

- [ ] **Step 6: Commit only operational documentation**

```powershell
git add functions/README.md docs/auth/my-rikishi-cloudflare-operations.md scripts/verify_my_rikishi_preview.ps1
git commit -m "docs: define Cloudflare auth operations"
```

## Task 7: Full verification, observability, and release decision

**Files:**
- Modify: `functions/README.md`
- Modify: `docs/auth/my-rikishi-cloudflare-operations.md`
- Create: `app/lib/__tests__/my-rikishi-auth.e2e.ts` if the existing Playwright setup supports the Pages Preview runtime.
- Modify: `tasks/todo.md` with the final review section and exact evidence.

**Interfaces:**
- No new product behavior; this task proves the seven-point flow in local and Preview environments.

- [ ] **Step 1: Run the complete automated suite**

```powershell
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: all existing tests remain green, the build succeeds, and no whitespace errors are introduced.

- [ ] **Step 2: Run Pages Preview locally**

```powershell
npx wrangler pages dev ./dist --port 3002
```

Exercise anonymous browsing, login, sync, logout, reload, and offline fallback in the browser. Confirm that Markdown negotiation, A2A, OGP, and existing public API routes still work.

- [ ] **Step 3: Inspect Cloudflare logs**

Use the discovered `cf` logs or observability read command to inspect authentication failures. Confirm that logs contain route, status, and request identifiers but no authorization code, cookie, secret, or email address.

- [ ] **Step 4: Inspect account usage when permissions allow**

Retry `cf billing usage get-account-usage-v2` after granting only the minimum billing-read permission if the user chooses to do so. If it remains unavailable, record that usage proof is incomplete rather than claiming it.

- [ ] **Step 5: Run the browser acceptance checklist**

Verify on at least one desktop and one mobile viewport:

- anonymous user can add, remove, filter, and reload My Rikishi;
- Google login preserves local selections;
- a second browser sees the same selections;
- logout keeps local behavior available;
- expired sessions do not expose another user's data;
- the UI remains Japanese/English consistent;
- no authentication control blocks public pages.

- [ ] **Step 6: Write the final review record**

In `tasks/todo.md`, record exact commands, test counts, Preview URL, D1 migration state, Cloudflare resource names without secrets, and any remaining production gate. Do not mark the feature complete until Preview and production configuration are independently verified.

- [ ] **Step 7: Commit the verification record**

```powershell
git add functions/README.md docs/auth/my-rikishi-cloudflare-operations.md tasks/todo.md app/lib/__tests__/my-rikishi-auth.e2e.ts
git commit -m "test: verify Cloudflare My Rikishi authentication flow"
```

## Plan Self-Review

- The seven requested concrete areas are covered: Google OAuth, D1, auth endpoints, store abstraction, UI, `cf`-based environment configuration, and full verification.
- Existing production KV is explicitly excluded from user data.
- The plan does not require passwords, a third-party auth subscription, or a production mutation before Preview proof.
- Account usage was not claimed as verified because the current `cf` billing usage token returned a permission error.
