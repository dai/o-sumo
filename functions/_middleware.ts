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

function rewriteSocialMetadata(response: Response, metadata: ShareMetaOverride) {
  const rewriter = new HTMLRewriter()
    .on('title', { element: (element) => element.setInnerContent(metadata.title) })
    .on('meta[name="description"]', { element: (element) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:title"]', { element: (element) => element.setAttribute('content', metadata.title) })
    .on('meta[property="og:description"]', { element: (element) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:url"]', { element: (element) => element.setAttribute('content', metadata.socialUrl) })
    .on('meta[name="twitter:title"]', { element: (element) => element.setAttribute('content', metadata.title) })
    .on('meta[name="twitter:description"]', { element: (element) => element.setAttribute('content', metadata.description) });
  const transformed = rewriter.transform(response);
  const headers = prepareShareMetadataHeaders(transformed.headers);
  return new Response(transformed.body, { status: transformed.status, statusText: transformed.statusText, headers });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest = async (context: any): Promise<Response> => {
  const accept: string = context.request.headers.get('Accept') ?? '';
  if (prefersMarkdown(accept)) {
    const url = new URL(context.request.url);
    const basePath = url.pathname.replace(/\/$/, '') || '';
    const mdPath = `${basePath}/index.md`;
    const mdResponse = await context.env.ASSETS.fetch(new URL(mdPath, context.request.url));

    if (mdResponse.ok) {
      const body = await mdResponse.arrayBuffer();
      const headers = new Headers();
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Vary', 'Accept');
      return new Response(body, { status: 200, headers });
    }
  }

  const requestUrl = new URL(context.request.url);
  const collection = shareCollectionForPath(requestUrl.pathname);
  if (!collection) return context.next();

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
