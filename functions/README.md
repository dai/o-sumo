# Cloudflare Pages Functions

This directory contains the catch-all middleware that powers the
**Markdown for Agents** dynamic content negotiation.

## How it works

[`_middleware.ts`](./_middleware.ts) runs for every incoming request:

1. Reads the `Accept` header.
2. If the request advertises `text/markdown`, fetches the pre-built
   `<route>/index.md` from the Pages static assets and returns it with
   `Content-Type: text/markdown; charset=utf-8` plus `Vary: Accept`.
3. Otherwise, falls back to the normal SPA routing.

The pre-built `.md` files are generated at build time by
`scripts/build_markdown_views.ts` (`vite.config.ts` / `markdownViewsPlugin`).
For the configured route list, see `MARKDOWN_ROUTES` exported from that
script.

## Local development

```bash
npm run build
npx wrangler pages dev ./dist --port 3002
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/rikishi/
curl -H 'Accept: text/markdown' http://127.0.0.1:3002/202607-banzuke/
```

Each of those should return `Content-Type: text/markdown; charset=utf-8`
with `Vary: Accept` and the body of the corresponding
`dist/<route>/index.md`.

The plain `npm run dev` (Vite dev server) does **not** exercise
`_middleware.ts` because Pages Functions only run on the Cloudflare
Pages runtime.

## Deployment

- The `functions/` directory is detected automatically by Cloudflare
  Pages — no `wrangler.toml` or other configuration is required.
- The Free plan supports Pages Functions, so this works on the same
  plan as the rest of o-sumo.
