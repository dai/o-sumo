# My Rikishi Cloudflare operations

## Resource model

Use two dedicated D1 databases:

- Preview: `o-sumo-my-rikishi-preview`
- Production: `o-sumo-my-rikishi-production`

Both Pages environments use the binding name `MY_RIKISHI_DB`, but each binding
must resolve to its own database. Keep `COMPARE_OG_CACHE` unchanged. Never commit
database IDs, OAuth secrets, session signing secrets, or `.dev.vars` files.

Required runtime values are `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`AUTH_SESSION_SECRET`, `AUTH_ORIGIN`, and optionally
`AUTH_SESSION_TTL_SECONDS`. Treat both `GOOGLE_CLIENT_SECRET` and
`AUTH_SESSION_SECRET` as secrets.

## Current state

Preview is configured and browser-verified as of 2026-09-29:

- Preview D1 database: `o-sumo-my-rikishi-preview`
- Pages Preview binding: `MY_RIKISHI_DB`
- Stable Preview URL:
  `https://codex-my-rikishi-auth-previe.o-sumo.pages.dev`
- Preview-only variables: `AUTH_ORIGIN`, `AUTH_SESSION_SECRET`,
  `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`
- Applied migration: `0001_my_rikishi_auth.sql` (no unapplied migrations)

The Google callback uses the stable Preview URL. Login, local-to-D1 sync, and
logout passed in Chrome: rikishi ID `4227` was retained locally, synchronized
to D1 after login, and remained available after logout while the D1 session was
revoked. Production bindings and variables remain unchanged. Account usage
lookup is permission-limited, so subscription coverage is not claimed from
unavailable usage data.

## Preview setup

1. Create the Preview D1 database and record its returned ID in a private
   deployment note.
2. Register a Preview Google OAuth client with the exact callback URL
   `https://<preview-host>/api/auth/callback/google`.
3. Configure the Preview `MY_RIKISHI_DB` binding and runtime values in the Pages
   Preview environment. Do not put secrets in a command line that will be saved
   in shell history; use the Cloudflare secret input flow or dashboard.
4. List unapplied migrations, then apply `migrations/0001_my_rikishi_auth.sql`
   with the private Preview database ID:

   ```powershell
   cf d1 migrations list <PREVIEW_DATABASE_ID> --dir migrations
   cf d1 migrations apply <PREVIEW_DATABASE_ID> --dir migrations
   ```

5. Redeploy Preview, then run:

   ```powershell
   pwsh ./scripts/verify_my_rikishi_preview.ps1 -BaseUrl https://<preview-host>
   ```

Complete browser login separately because OAuth requires user interaction. Check
that local IDs `[1, 2]` and account IDs `[2, 3]` become `[1, 2, 3]`, a second
browser sees the synchronized list, and logout leaves local mode usable.

The first Preview acceptance run also found that the generated service worker
treated `/api/auth/google` as an SPA navigation and returned the application's
404 page. `navigateFallbackDenylist: [/^\/api\//]` now keeps every `/api/`
navigation on the network path. Preserve this rule when changing PWA settings.

## Production gate

Do not create or bind the Production D1 database until Preview has passed the
automated and browser checklists. Production requires a separate Google OAuth
client whose callback is exactly
`https://osada.us/api/auth/callback/google`, a separate D1 database, and fresh
secrets. Review the complete Pages project update payload before applying it so
existing bindings and variables are preserved.

## Rollback

Remove or hide the login control, leaving anonymous local storage active. Remove
the auth environment configuration or binding only after the login control is
disabled. To force sign-out, delete the rows in `sessions`; do not delete users
or My Rikishi rows unless a separate data-deletion decision has been approved.
Public pages, public JSON APIs, Markdown responses, A2A, and OGP behavior do not
depend on the authentication database.
