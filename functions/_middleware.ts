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
import { resolvePageMeta, type ImageMeta } from '../app/lib/page-meta';
import { buildSeoNoscriptHtml, type SeoNoscriptContext } from '../app/lib/seo-noscript';

/**
 * Trailing-slash enforcement for SPA routes.
 *
 * Cloudflare Pages Functions don't support internal URL rewrites from
 * middleware (the `_redirects` 200 rules don't behave as documented), so we
 * normalize SPA paths to a trailing slash via a 308 Permanent Redirect here.
 * 308 preserves the request method and signals the canonical URL to both
 * crawlers (Googlebot records the redirect target as the canonical) and
 * browsers.
 */
const NON_SPA_PREFIXES = [
  '/api/',
  '/.well-known/',
  '/assets/',
  '/images/',
  '/fonts/',
  '/icons/',
];

const SPA_TRAILING_SLASH_PATTERN = /\.[a-z0-9]{1,8}$/i;

const SPA_ROUTE_PATTERNS: RegExp[] = [
  /^\/archives\/?$/,
  /^\/analytics\/?$/,
  /^\/about\/?$/,
  /^\/kimarite\/?$/,
  /^\/compare\/?$/,
  /^\/my-rikishi\/?$/,
  /^\/rikishi\/?$/,
  /^\/rikishi\/[1-9]\d*\/?$/,
  /^\/gyoji\/?$/,
  /^\/gyoji\/[1-9]\d*\/?$/,
  /^\/yobidashi\/?$/,
  /^\/yobidashi\/[1-9]\d*\/?$/,
  /^\/\d{6}-(?:banzuke|torikumi|yotei|banduke|o-sumo)\/?$/,
  /^\/\d{8}-(?:torikumi|yotei)\/?$/,
];

function needsTrailingSlash(pathname: string): boolean {
  if (pathname === '/' || pathname.endsWith('/')) return false;
  if (NON_SPA_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;
  if (SPA_TRAILING_SLASH_PATTERN.test(pathname)) return false;
  return SPA_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

async function rikishiIdProfileExists(context: any, id: string, requestUrl: URL): Promise<boolean> {
  try {
    const profileUrl = new URL(`/api/v1/rikishi/${id}.json`, requestUrl);
    const response = await context.env.ASSETS.fetch(profileUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function buildNotFoundResponse(context: any, requestUrl: URL): Promise<Response> {
  try {
    const asset = await context.env.ASSETS.fetch(new URL('/404.html', requestUrl));
    if (asset.ok) {
      return new Response(asset.body, {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, must-revalidate',
        },
      });
    }
  } catch {
    // fall through to plain-text response below
  }
  return new Response('Not Found', {
    status: 404,
    statusText: 'Not Found',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function loadSharePayload(context: any, requestUrl: URL, collection: ShareCollection) {
  const assetUrl = new URL(`/api/v1/${collection}.json`, requestUrl);
  const response = await context.env.ASSETS.fetch(assetUrl);
  if (!response.ok) return null;
  const payload = await response.json();
  if (requestUrl.pathname !== '/compare/' || !payload || typeof payload !== 'object') return payload;
  const matchupResponse = await context.env.ASSETS.fetch(new URL('/api/v1/rikishi-matchups.json', requestUrl));
  if (!matchupResponse.ok) return payload;
  const matchupPayload = await matchupResponse.json();
  const matchups = matchupPayload && typeof matchupPayload === 'object'
    ? (matchupPayload as Record<string, unknown>).matchups
    : null;
  return { ...(payload as Record<string, unknown>), matchups };
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
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
}

export function rewritePageMetadata(response: Response, metadata: PageMetadataForRewrite) {
  return rewritePageMetadataWithNoscript(response, metadata, null);
}

export function rewritePageMetadataWithNoscript(
  response: Response,
  metadata: PageMetadataForRewrite,
  noscriptHtml: string | null,
) {
  const canonicalHref = escapeHtmlAttribute(metadata.canonicalUrl);
  const imageAlt = escapeHtmlAttribute(metadata.imageAlt);
  const imageWidth = String(metadata.imageWidth);
  const imageHeight = String(metadata.imageHeight);
  const rewriter = new HTMLRewriter()
    .on('title', { element: (element: any) => element.setInnerContent(metadata.title) })
    .on('meta[name="description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[property="og:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[property="og:url"]', { element: (element: any) => element.setAttribute('content', metadata.canonicalUrl) })
    .on('meta[property="og:image"]', { element: (element: any) => element.setAttribute('content', metadata.imageUrl) })
    .on('meta[property="og:image:secure_url"]', { element: (element: any) => element.setAttribute('content', metadata.imageUrl) })
    .on('meta[property="og:image:width"]', { element: (element: any) => element.setAttribute('content', imageWidth) })
    .on('meta[property="og:image:height"]', { element: (element: any) => element.setAttribute('content', imageHeight) })
    .on('meta[property="og:image:alt"]', { element: (element: any) => element.setAttribute('content', imageAlt) })
    .on('meta[name="twitter:title"]', { element: (element: any) => element.setAttribute('content', metadata.title) })
    .on('meta[name="twitter:description"]', { element: (element: any) => element.setAttribute('content', metadata.description) })
    .on('meta[name="twitter:image"]', { element: (element: any) => element.setAttribute('content', metadata.imageUrl) })
    .on('meta[name="twitter:image:alt"]', { element: (element: any) => element.setAttribute('content', imageAlt) })
    .on('link[rel="canonical"]', { element: (element: any) => element.setAttribute('href', metadata.canonicalUrl) })
    .on('head', {
      element: (element: any) =>
        element.append(`<link rel="canonical" href="${canonicalHref}" data-o-sumo-seo="canonical" />`, { html: true }),
    });
  if (noscriptHtml) {
    rewriter.on('body', {
      element: (element: any) => element.append(noscriptHtml, { html: true }),
    });
  }
  const transformed = rewriter.transform(response);
  const headers = prepareShareMetadataHeaders(transformed.headers);
  return new Response(transformed.body, { status: transformed.status, statusText: transformed.statusText, headers });
}

function shareOverrideToMetadata(metadata: ShareMetaOverride, image: ImageMeta): PageMetadataForRewrite {
  return {
    title: metadata.title,
    description: metadata.description,
    canonicalUrl: metadata.socialUrl,
    imageUrl: image.primary,
    imageWidth: image.width,
    imageHeight: image.height,
    imageAlt: image.alt,
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
  const pathname = requestUrl.pathname;

  // Trailing-slash enforcement: rewrite SPA paths to their canonical form.
  // See the `needsTrailingSlash` helper above for the full rationale.
  if (needsTrailingSlash(pathname)) {
    const redirectUrl = new URL(pathname + '/' + requestUrl.search, requestUrl);
    return new Response(null, {
      status: 308,
      headers: {
        Location: redirectUrl.href,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // Invalid rikushi ID → 404.
  // For numeric rikushi IDs, verify the profile JSON exists before
  // continuing. This eliminates the soft-404 (200 with generic meta) that
  // previously applied to unknown IDs, which caused Googlebot to index
  // duplicate generic pages.
  const rikishiIdMatch = pathname.match(/^\/rikishi\/([1-9]\d*)\/?$/);
  if (rikishiIdMatch) {
    const id = rikishiIdMatch[1];
    const exists = await rikishiIdProfileExists(context, id, requestUrl);
    if (!exists) {
      return buildNotFoundResponse(context, requestUrl);
    }
  }

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

  const noscriptContext: SeoNoscriptContext = {
    fetchJson: async (path: string) => {
      const r = await context.env.ASSETS.fetch(new URL(path, requestUrl));
      if (!r.ok) return null;
      return r.json();
    },
  };

  const collection = shareCollectionForPath(requestUrl.pathname);
  if (!collection) {
    const response = await context.next();
    let headers: Headers | null = null;
    if (isHomePage && !response.headers.has('Link')) {
      headers = new Headers(response.headers);
      ensureHomeLinkHeaders(headers);
    }

    const pageMeta = resolvePageMeta(requestUrl.pathname);
    if (!pageMeta.isNotFound) {
      const noscriptHtml = await buildSeoNoscriptHtml(requestUrl.pathname, pageMeta.title, noscriptContext);
      const responseForRewrite = headers
        ? new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
        : response;
      return rewritePageMetadataWithNoscript(
        responseForRewrite,
        {
          title: pageMeta.title,
          description: pageMeta.description,
          canonicalUrl: pageMeta.canonicalUrl,
          imageUrl: pageMeta.image.primary,
          imageWidth: pageMeta.image.width,
          imageHeight: pageMeta.image.height,
          imageAlt: pageMeta.image.alt,
        },
        noscriptHtml,
      );
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
  let override: ShareMetaOverride;
  let payload: unknown = null;
  try {
    payload = await loadSharePayload(context, requestUrl, collection);
    override = resolveShareMetadataForPayload(requestUrl, collection, payload);
  } catch {
    override = resolveShareMetadataForPayload(requestUrl, collection, null);
  }
  const profileMatch = requestUrl.pathname.match(/^\/(rikishi|gyoji|yobidashi)\/[1-9]\d*\/?$/);
  const noscriptContextForProfile: SeoNoscriptContext = profileMatch
    ? {
        fetchJson: async (path: string) => {
          // Reuse the share payload we already fetched for this profile route
          // to avoid a duplicate `/api/v1/*.json` request on every bot hit.
          const expected = `/api/v1/${collection}.json`;
          if (path === expected) return payload;
          const r = await context.env.ASSETS.fetch(new URL(path, requestUrl));
          if (!r.ok) return null;
          return r.json();
        },
      }
    : noscriptContext;
  const noscriptHtml = await buildSeoNoscriptHtml(requestUrl.pathname, override.title, noscriptContextForProfile);
  const pageMeta = resolvePageMeta(requestUrl.pathname);
  return rewritePageMetadataWithNoscript(
    response,
    shareOverrideToMetadata(override, pageMeta.image),
    noscriptHtml,
  );
};
