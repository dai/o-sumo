import {
  createMcpHandler,
  hostHeaderValidationResponse,
  originValidationResponse,
} from '@modelcontextprotocol/server';
import { createSumoMcpServer, type SumoServerContext } from '../lib/mcp/server';
import { MCP_SERVER_CARD } from '../lib/mcp/server-card';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag',
};

export function getAllowedHostnames(request: Request): string[] {
  const host = new URL(request.url).hostname;
  const defaults = ['osada.us', 'localhost', '127.0.0.1'];
  if (host.endsWith('.pages.dev') || host.endsWith('.workers.dev')) {
    return [...defaults, host];
  }
  return defaults;
}
interface McpPagesContext {
  request: Request;
  env?: { ASSETS?: { fetch: typeof fetch } };
  params?: { path?: string | string[] };
}

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet = async (context: McpPagesContext): Promise<Response> => {
  const request = context.request;
  const requestUrl = new URL(request.url);
  const pathParam = Array.isArray(context.params?.path)
    ? context.params.path.join('/')
    : String(context.params?.path ?? '');

  // Serve Server Card at /mcp/server-card (canonical SEP-2127 location)
  if (pathParam === 'server-card' || requestUrl.pathname.endsWith('/server-card')) {
    const card = MCP_SERVER_CARD;
    const body = JSON.stringify(card, null, 2);
    const etag = `"sc-${card.version}"`;
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ...corsHeaders,
          ETag: etag,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', 'application/mcp-server-card+json; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('ETag', etag);
    return new Response(body, { status: 200, headers });
  }

  // GET /mcp is handled by the MCP handler (returns 405 Method Not Allowed per MCP spec)
  const ctx: SumoServerContext = { env: context.env, request };
  const handler = createMcpHandler(() => createSumoMcpServer(ctx));
  const res = await handler.fetch(request);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) {
    headers.set(k, v);
  }
  return new Response(res.body, { status: res.status, headers });
};

export const onRequestPost = async (context: McpPagesContext): Promise<Response> => {
  const request = context.request;
  const allowedHosts = getAllowedHostnames(request);

  const hostValidation = hostHeaderValidationResponse(request, allowedHosts);
  if (hostValidation) return hostValidation;

  const originValidation = originValidationResponse(request, allowedHosts);
  if (originValidation) return originValidation;

  const ctx: SumoServerContext = { env: context.env, request };
  const handler = createMcpHandler(() => createSumoMcpServer(ctx));
  const res = await handler.fetch(request);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) {
    headers.set(k, v);
  }
  return new Response(res.body, { status: res.status, headers });
};
