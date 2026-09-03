/**
 * Cloudflare Pages Functions middleware for Markdown-for-Agents and
 * server-rendered social metadata on named detail pages.
 */

import { prefersMarkdown } from '../app/lib/content-negotiation';
import {
  prepareShareMetadataHeaders,
  resolveShareMetadataForPayload,
  shareCollectionForPath,
  type ShareCollection,
} from '../app/lib/share-meta-response';
import type { ShareMetaOverride } from '../app/lib/share-meta';

async function loadSharePayload(context: any, requestUrl: URL, collection: ShareCollection) {
  const assetUrl = new URL(`/api/v1/${collection}.json`, requestUrl);
  const response = await context.env.ASSETS.fetch(assetUrl);
  if (!response.ok) return null;
  return response.json();
}

// HTMLRewriter is provided as an ambient global in the Cloudflare Pages Functions runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const HTMLRewriter: any;

function rewriteSocialMetadata(response: Response, metadata: ShareMetaOverride) {
  const rewriter = new HTMLRewriter()
    .on('title', { element: (element: any) => element.setInnerContent(metadata.title) })
    .on('meta[name="description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[property="og:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:url"]', { element: (element: any) => element.setAttribute('content', metadata.socialUrl) })
    .on('meta[name="twitter:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[name="twitter:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) });
  const transformed = rewriter.transform(response);
  const headers = prepareShareMetadataHeaders(transformed.headers);
  return new Response(transformed.body, { status: transformed.status, statusText: transformed.statusText, headers });
}

export const HOME_LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/agent-card.json>; rel="describedby"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"',
  '</index.md>; rel="alternate"; type="text/markdown"; title="Markdown version"',
  '</auth.md>; rel="auth.md"',
];

function ensureHomeLinkHeaders(headers: Headers) {
  for (const link of HOME_LINK_HEADERS) {
    headers.append('Link', link);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest = async (context: any): Promise<Response> => {
  const requestUrl = new URL(context.request.url);
  const isHomePage = requestUrl.pathname === '/' || requestUrl.pathname === '';
  const accept: string = context.request.headers.get('Accept') ?? '';

  if (prefersMarkdown(accept)) {
    const basePath = requestUrl.pathname.replace(/\/$/, '') || '';
    const mdPath = `${basePath}/index.md`;
    const mdResponse = await context.env.ASSETS.fetch(new URL(mdPath, context.request.url));

    if (mdResponse.ok) {
      const body = await mdResponse.arrayBuffer();
      const headers = new Headers();
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Vary', 'Accept');
      // Prevent CDN/browser cache collisions from serving Markdown to HTML visitors
      headers.set('Cache-Control', 'private, no-cache, no-transform');
      if (isHomePage) {
        ensureHomeLinkHeaders(headers);
      }
      return new Response(body, { status: 200, headers });
    }
  }

  const collection = shareCollectionForPath(requestUrl.pathname);
  if (!collection) {
    const response = await context.next();
    if (isHomePage && !response.headers.has('Link')) {
      const headers = new Headers(response.headers);
      ensureHomeLinkHeaders(headers);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  }

  const response = await context.next();
  try {
    const payload = await loadSharePayload(context, requestUrl, collection);
    return rewriteSocialMetadata(
      response,
      resolveShareMetadataForPayload(requestUrl, collection, payload),
    );
  } catch {
    return rewriteSocialMetadata(
      response,
      resolveShareMetadataForPayload(requestUrl, collection, null),
    );
  }
};
