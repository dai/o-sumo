# Cloudflare Pages Functions

This directory contains Cloudflare Pages Functions for o-sumo:

- [`_middleware.ts`](./_middleware.ts) — catch-all middleware that powers
  the **Markdown for Agents** dynamic content negotiation.
- [`a2a/[[path]].ts`](./a2a/[[path]].ts) — JSON-RPC 2.0 endpoint
  advertised in the A2A Agent Card's `supportedInterfaces[0].url`
  (`/.well-known/agent-card.json` → `https://osada.us/a2a`).

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
```

The plain `npm run dev` (Vite dev server) does **not** exercise
`_middleware.ts` or `a2a/[[path]].ts` because Pages Functions only run on
the Cloudflare Pages runtime.

## Deployment

- The `functions/` directory is detected automatically by Cloudflare
  Pages — no `wrangler.toml` or other configuration is required.
- The Free plan supports Pages Functions, so this works on the same
  plan as the rest of o-sumo.
