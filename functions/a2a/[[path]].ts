/**
 * Cloudflare Pages Function that serves the A2A (Agent-to-Agent) JSON-RPC
 * endpoint advertised in `/.well-known/agent-card.json`'s
 * `supportedInterfaces[0].url`.
 *
 * o-sumo does not implement an A2A server — the site is a static archive
 * of sumo banzuke and torikumi data with no server-side state to mutate.
 * To honour the A2A v1.0.0 protocol section 6.1 (JSON-RPC 2.0 transport)
 * and section 6.4 (well-known URI discovery) we still expose a JSON-RPC
 * 2.0 surface that:
 *
 * - responds to every method with `-32601 Method not found` so that
 *   well-formed agents receive a spec-compliant error instead of an
 *   opaque 404, and
 * - rejects malformed bodies with `-32700 Parse error`, and
 * - rejects non-`application/json` POSTs with `415 Unsupported Media Type`.
 *
 * Any agent that wants to actually exchange data with o-sumo should use
 * the static discovery endpoints (Agent Card, MCP Server Card, Agent
 * Skills index, etc.) rather than this RPC surface.
 *
 * `GET` requests return the Agent Card itself so the URL published in
 * `supportedInterfaces[0].url` is also a useful resource on its own.
 */

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

const JSONRPC_VERSION = "2.0" as const;
const METHOD_NOT_FOUND: JsonRpcError = {
  code: -32601,
  message: "Method not found",
};
const INVALID_REQUEST: JsonRpcError = {
  code: -32600,
  message: "Invalid Request",
};
const PARSE_ERROR: JsonRpcError = {
  code: -32700,
  message: "Parse error",
};

const corsHeaders = new Headers({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
});

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Vary", "Accept");
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(
  id: JsonRpcRequest["id"] | null,
  error: JsonRpcError,
  status: number,
): Response {
  return jsonResponse(
    { jsonrpc: JSONRPC_VERSION, id, error },
    status,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (context: any): Promise<Response> => {
  // Self-discovery: GET /a2a returns the Agent Card so the URL published
  // in `supportedInterfaces[0].url` is also a useful resource on its own.
  const cardResponse = await context.env.ASSETS.fetch(
    new URL("/.well-known/agent-card.json", context.request.url),
  );
  if (!cardResponse.ok) {
    return jsonResponse(
      { error: "agent-card-not-found" },
      500,
    );
  }
  const body = await cardResponse.arrayBuffer();
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
  );
  return new Response(body, { status: 200, headers });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestPost = async (context: any): Promise<Response> => {
  const contentType =
    context.request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return new Response(
      JSON.stringify({
        jsonrpc: JSONRPC_VERSION,
        id: null,
        error: {
          code: -32700,
          message: "Unsupported Media Type",
          data: "Content-Type must be application/json",
        },
      }),
      {
        status: 415,
        headers: {
          ...Object.fromEntries(corsHeaders),
          "Content-Type": "application/json; charset=utf-8",
          "Accept-Post": "application/json",
        },
      },
    );
  }

  let raw: string;
  try {
    raw = await context.request.text();
  } catch {
    return errorResponse(null, PARSE_ERROR, 400);
  }

  let parsed: unknown;
  try {
    parsed = raw.length === 0 ? null : JSON.parse(raw);
  } catch {
    return errorResponse(null, PARSE_ERROR, 400);
  }

  if (!parsed || typeof parsed !== "object") {
    return errorResponse(null, INVALID_REQUEST, 400);
  }

  // Batch requests are not supported (per A2A section 6.1 servers may
  // choose not to implement batching). We handle only single requests.
  const req = parsed as Partial<JsonRpcRequest>;
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return errorResponse((req.id as JsonRpcRequest["id"]) ?? null, INVALID_REQUEST, 400);
  }

  // Every A2A method we don'"'"'t implement returns Method not found.
  return errorResponse(req.id ?? null, METHOD_NOT_FOUND, 200);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestOptions = async (_context: any): Promise<Response> => {
  return new Response(null, { status: 204, headers: corsHeaders });
};
