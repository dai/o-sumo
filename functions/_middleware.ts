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
import { resolvePageMeta } from '../app/lib/page-meta';

async function loadSharePayload(context: any, requestUrl: URL, collection: ShareCollection) {
  const assetUrl = new URL(`/api/v1/${collection}.json`, requestUrl);
  const response = await context.env.ASSETS.fetch(assetUrl);
  if (!response.ok) return null;
  return response.json();
}

// HTMLRewriter is provided as an ambient global in the Cloudflare Pages Functions runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const HTMLRewriter: any;

function escapeHtmlAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

interface PageMetadataForRewrite {
  title: string;
  description: string;
  canonicalUrl: string;
}

export function rewritePageMetadata(response: Response, metadata: PageMetadataForRewrite) {
  const canonicalHref = escapeHtmlAttribute(metadata.canonicalUrl);
  const rewriter = new HTMLRewriter()
    .on('title', { element: (element: any) => element.setInnerContent(metadata.title) })
    .on('meta[name="description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[property="og:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:url"]', { element: (element: any) => element.setAttribute('content', metadata.canonicalUrl) })
    .on('meta[name="twitter:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[name="twitter:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('link[rel="canonical"]', { element: (element: any) => element.setAttribute('href', metadata.canonicalUrl) })
    .on('head', {
      element: (element: any) =>
        element.append(`<link rel="canonical" href="${canonicalHref}" data-o-sumo-seo="canonical" />`, { html: true }),
    });
  const transformed = rewriter.transform(response);
  const headers = prepareShareMetadataHeaders(transformed.headers);
  return new Response(transformed.body, { status: transformed.status, statusText: transformed.statusText, headers });
}

function shareOverrideToMetadata(metadata: ShareMetaOverride): PageMetadataForRewrite {
  return {
    title: metadata.title,
    description: metadata.description,
    canonicalUrl: metadata.socialUrl,
  };
}

export const HOME_LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/ai-catalog.json>; rel="ai-catalog"',
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
    let headers: Headers | null = null;
    if (isHomePage && !response.headers.has('Link')) {
      headers = new Headers(response.headers);
      ensureHomeLinkHeaders(headers);
    }

    if (!isHomePage) {
      const pageMeta = resolvePageMeta(requestUrl.pathname);
      if (!pageMeta.isNotFound) {
        const responseForRewrite = headers
          ? new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            })
          : response;
        return rewritePageMetadata(responseForRewrite, {
          title: pageMeta.title,
          description: pageMeta.description,
          canonicalUrl: pageMeta.canonicalUrl,
        });
      }
    }

    if (headers) {
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
    return rewritePageMetadata(
      response,
      shareOverrideToMetadata(resolveShareMetadataForPayload(requestUrl, collection, payload)),
    );
  } catch {
    return rewritePageMetadata(
      response,
      shareOverrideToMetadata(resolveShareMetadataForPayload(requestUrl, collection, null)),
    );
  }
};
