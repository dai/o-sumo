# Cloudflare Pages Functions

This directory contains Cloudflare Pages Functions for o-sumo:

- [`_middleware.ts`](./_middleware.ts) — catch-all middleware that powers
  the **Markdown for Agents** dynamic content negotiation.
- [`a2a/[[path]].ts`](./a2a/[[path]].ts) — JSON-RPC 2.0 endpoint
  advertised in the A2A Agent Card's `supportedInterfaces[0].url`
  (`/.well-known/agent-card.json` → `https://osada.us/a2a`).
- [`.well-known/http-message-signatures-directory.ts`](./.well-known/http-message-signatures-directory.ts)
  — serves the Web Bot Auth signature directory (RFC 9421).

## Markdown for Agents — `_middleware.ts`

`_middleware.ts` runs for every incoming request:

1. Reads the `Accept` header.
2. If the request advertises `text/markdown`, fetches the pre-built
   `<route>/index.md` from the Pages static assets and returns it with
   `Content-Type: text/markdown; charset=utf-8` plus `Vary: Accept`.
3. Otherwise, falls back to the normal SPA routing.

The pre-built `.md` files are generated at build time by
`scripts/build_markdown_views.ts` (`vite.config.ts` / `markdownViewsPlugin`).
For the configured route list, see `MARKDOWN_ROUTES` exported from that
script.

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
npx wrangler pages dev ./dist --port 3002
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/rikishi/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/202607-banzuke/

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

## Deployment

- The `functions/` directory is detected automatically by Cloudflare
  Pages — no `wrangler.toml` or other configuration is required.
- The Free plan supports Pages Functions, so this works on the same
  plan as the rest of o-sumo.
