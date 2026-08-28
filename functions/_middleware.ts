/**
 * Cloudflare Pages Functions middleware that powers the
 * **Markdown for Agents** dynamic content negotiation.
 *
 * The pre-rendered `dist/<route>/index.md` files are produced at build
 * time by `scripts/build_markdown_views.ts` (wired through
 * `vite.config.ts` / `markdownViewsPlugin`). When a request advertises
 * `text/markdown` in `Accept`, this middleware swaps the response body
 * for the matching `.md` file with `Content-Type: text/markdown`
 * and `Vary: Accept`, and strips the headers that conflict with a
 * regenerated body (so conditional requests no longer match).
 *
 * Non-markdown requests pass through to the normal SPA routing.
 *
 * The Cloudflare Pages Functions runtime supplies `Request`, `Response`,
 * `Headers`, `URL`, and `context.env.ASSETS` as ambient globals, so the
 * handler is written without an explicit `PagesFunction` annotation to
 * avoid pulling in `@cloudflare/workers-types` as a global type
 * provider (which would shadow `Element.append` in the host project).
 * `tsconfig.json` excludes this directory from the project's typecheck.
 */

import { prefersMarkdown } from '../app/lib/content-negotiation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest = async (context: any): Promise<Response> => {
  const accept: string = context.request.headers.get('Accept') ?? '';
  if (!prefersMarkdown(accept)) {
    return context.next();
  }

  const url = new URL(context.request.url);
  const basePath = url.pathname.replace(/\/$/, '') || '';
  const mdPath = `${basePath}/index.md`;
  const mdResponse = await context.env.ASSETS.fetch(new URL(mdPath, context.request.url));

  if (!mdResponse.ok) {
    // No matching `.md` was pre-rendered — fall back to SPA routing.
    return context.next();
  }

  const body = await mdResponse.arrayBuffer();
  const headers = new Headers();
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Vary', 'Accept');
  // Cloudflare's Markdown-for-Agents spec drops these because the
  // converted body cannot satisfy the original conditional headers.
  headers.delete('ETag');
  headers.delete('Last-Modified');
  headers.delete('Content-Encoding');
  headers.delete('Content-Range');
  return new Response(body, { status: 200, headers });
};
