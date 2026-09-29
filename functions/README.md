# Cloudflare Pages Functions

This directory contains Cloudflare Pages Functions for o-sumo:

- [`_middleware.ts`](./_middleware.ts) — catch-all middleware that powers
  **Markdown for Agents** content negotiation and server-rendered social metadata.
- [`a2a/[[path]].ts`](./a2a/[[path]].ts) — JSON-RPC 2.0 endpoint
  advertised in the A2A Agent Card's `supportedInterfaces[0].url`
  (`/.well-known/agent-card.json` → `https://osada.us/a2a`).
- [`.well-known/http-message-signatures-directory.ts`](./.well-known/http-message-signatures-directory.ts)
  — serves the Web Bot Auth signature directory (RFC 9421).
- [`api/auth/`](./api/auth/) and [`api/my-rikishi.ts`](./api/my-rikishi.ts)
  — optional Google login and D1-backed My Rikishi synchronization. Anonymous
  browser storage remains available when no account is used.

## My Rikishi authentication boundary

The authentication Functions require a dedicated D1 binding named
`MY_RIKISHI_DB`. Do not point this binding at `COMPARE_OG_CACHE` or at an
unrelated D1 database. Runtime configuration consists of:

- `GOOGLE_CLIENT_ID` and `AUTH_ORIGIN`: environment-specific configuration;
- `GOOGLE_CLIENT_SECRET` and `AUTH_SESSION_SECRET`: environment-specific secrets;
- `AUTH_SESSION_TTL_SECONDS`: optional session lifetime, defaulting to 30 days.

OAuth access tokens are used only for the server-side Google userinfo request.
They are not stored. D1 stores only the SHA-256 hash of the random session token,
and the browser receives the raw token only as an `HttpOnly`, `Secure`,
`SameSite=Lax` cookie. Preview and Production must use separate D1 databases and
OAuth credentials.

## Markdown for Agents — `_middleware.ts`

`_middleware.ts` runs for every incoming request:

1. Reads the `Accept` header.
2. If `text/markdown` is preferred according to the Accept header, fetches the pre-built
   `<route>/index.md` from the Pages static assets and returns it with
   `Content-Type: text/markdown; charset=utf-8` plus `Vary: Accept`.
3. Otherwise, falls back to the normal SPA routing.

For comparison URLs and named rikishi, gyoji, and yobidashi detail pages,
the same middleware reads the public API indexes and rewrites the initial HTML
`title`, description, Open Graph, and Twitter metadata. This lets social crawlers
see page-specific Japanese metadata without running JavaScript. Unknown or
unavailable records use the existing route fallback. Rewritten HTML is cached for
60 seconds, varies on `Accept`, and drops validators invalidated by transformation.

The pre-built `.md` files are generated at build time by
`scripts/build_markdown_views.ts` (`vite.config.ts` / `markdownViewsPlugin`).
`MARKDOWN_ROUTES` lists the main/monthly routes. Daily routes are additionally generated
from each configured dataset, including pending days. A 200 HTML asset fallback is
not treated as Markdown. See [coverage and policy](../docs/agent-ready.md).

## A2A JSON-RPC stub — `a2a/[[path]].ts`

The A2A Agent Card advertises `https://osada.us/a2a` so the discovery
surface is well-formed (the A2A v1.0.0 spec requires a non-empty
`supportedInterfaces`). o-sumo is a static archive with no task state,
so the Function is a minimal JSON-RPC 2.0 surface:

- every A2A method (`message/send`, `tasks/get`, `tasks/cancel`, ...)
  returns `-32601 Method not found`
- malformed JSON returns `-32700 Parse error`
- non-`application/json` POSTs return `415 Unsupported Media Type`
- `GET /a2a` returns the Agent Card itself (self-discovery)

`[[path]].ts` makes the Function match any path under `/a2a/*`, so the
endpoint URL exposed in the card can evolve (e.g. `/a2a/v1`,
`/a2a/messages`) without rewriting the card.

## Web Bot Auth directory — `.well-known/http-message-signatures-directory.ts`

Per the [IETF WebBotAuth WG](https://datatracker.ietf.org/wg/webbotauth/about/),
o-sumo publishes a JWKS plus a self-signed
[`application/http-message-signatures-directory+json`](https://www.rfc-editor.org/rfc/rfc9421)
response so peers can verify outbound bot/agent requests by referring
to the public key set advertised in this directory.

The signing keypair is generated out-of-band by
`scripts/generate_web_bot_auth_keys.mjs` and inlined as a module
constant in `.well-known/_web-bot-auth-keys.ts` (Cloudflare Pages
Functions run on the Workers runtime and cannot read arbitrary files at
request time). The public JWK is also checked into
`.web-bot-auth/public.jwk.json` for offline tooling.

The Function signs each response with a fresh
`created`/`expires`/`nonce` triple and returns:

- `Content-Type: application/http-message-signatures-directory+json`
- `Signature: sig1=:...:`   *(RFC 9421 base64-encoded Ed25519 signature)*
- `Signature-Input: sig1=("@authority");alg="ed25519";keyid="...";tag="http-message-signatures-directory";created=...;expires=...;nonce="..."`
- `Signature-Agent: "https://osada.us/.well-known/http-message-signatures-directory"`

`created`/`expires` are 60 seconds apart, matches the 60-second
`Cache-Control` set in `public/_headers`.

The shared RFC 9421 primitives live in
[`app/lib/web-bot-auth/rfc9421.ts`](../app/lib/web-bot-auth/rfc9421.ts)
and are exercised by the Vitest suite
(`app/lib/web-bot-auth/rfc9421.test.ts`,
`app/lib/web-bot-auth/signer.test.ts`). End-to-end verification of the
live signature uses:

```bash
TARGET_URL=http://127.0.0.1:3002 node scripts/verify_web_bot_auth_signature.mjs
```

## Local development

```bash
npm run build
npx wrangler d1 migrations apply MY_RIKISHI_DB --local
npx wrangler pages dev ./dist --port 3002 \
  --binding AUTH_ORIGIN=http://127.0.0.1:3002 \
  --binding AUTH_SESSION_SECRET=local-development-only
pwsh ./scripts/verify_my_rikishi_auth.ps1
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/rikishi/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/20260926-yotei/

# A2A JSON-RPC stub
curl -i http://127.0.0.1:3002/a2a
curl -i http://127.0.0.1:3002/a2a/ -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send"}'

# Web Bot Auth directory (note the +json Content-Type and Signature headers)
curl -i http://127.0.0.1:3002/.well-known/http-message-signatures-directory
```

The plain `npm run dev` (Vite dev server) does **not** exercise
`_middleware.ts` or `a2a/[[path]].ts` because Pages Functions only run on
the Cloudflare Pages runtime.

The checked-in `wrangler.toml` is deliberately minimal and local-only: it has no
`pages_build_output_dir`, uses a non-production placeholder ID, and declares a
`preview_database_id` for Wrangler's local D1 emulator. Do not add a real D1 ID
to source control. The verification request includes a fake session cookie so
`/api/auth/session` must execute a D1 query; a missing binding or migration fails
the check instead of producing a false pass.

## Deployment

- The `functions/` directory is detected automatically by Cloudflare
  Pages — no `wrangler.toml` or other configuration is required.
- Production deployment remains gated on the Preview checklist in
  [`docs/auth/my-rikishi-cloudflare-operations.md`](../docs/auth/my-rikishi-cloudflare-operations.md).
