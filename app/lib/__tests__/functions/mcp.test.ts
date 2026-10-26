import { describe, expect, it, vi } from 'vitest';
import {
  getAllowedHostnames,
  onRequestGet,
  onRequestOptions,
  onRequestPost,
} from '../../../../functions/mcp/[[path]]';
import { createSumoMcpServer } from '../../../../functions/lib/mcp/server';
import { MCP_SERVER_CARD } from '../../../../functions/lib/mcp/server-card';

const sampleRikishiIndex = {
  updatedAt: '2026-09-27',
  rikishi: [
    {
      id: 4227,
      name: '大の里',
      yomi: 'おおのさと',
      currentRank: '横綱',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/',
    },
    {
      id: 3842,
      name: '豊昇龍',
      yomi: 'ほうしょうりゅう',
      currentRank: '横綱',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
    },
  ],
};

const sampleProfile4227 = {
  id: 4227,
  name: '大の里',
  yomi: 'おおのさと',
  currentRank: '横綱',
  height: '192cm',
  weight: '182kg',
};

const sampleBanzuke = {
  bashoName: '九月場所',
  year: '令和八年',
  updatedAt: '2026-09-27',
  makuuchi: [],
  juryo: [],
};

const sampleTorikumi = {
  bashoName: '九月場所',
  resultDays: [
    {
      pathDate: '20260927',
      status: 'completed',
      dayHead: '千秋楽',
      data: { makuuchi: { matches: [] } },
    },
  ],
  scheduleDays: [],
};

function createMockAssetFetch() {
  return vi.fn().mockImplementation(async (url: URL | RequestInfo) => {
    const pathname = typeof url === 'string' ? new URL(url).pathname : url instanceof URL ? url.pathname : new URL(url.url).pathname;
    if (pathname === '/api/v1/rikishi.json') {
      return new Response(JSON.stringify(sampleRikishiIndex), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/v1/rikishi/4227.json') {
      return new Response(JSON.stringify(sampleProfile4227), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/v1/banzuke.json') {
      return new Response(JSON.stringify(sampleBanzuke), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/v1/torikumi.json') {
      return new Response(JSON.stringify(sampleTorikumi), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not Found', { status: 404 });
  });
}

describe('MCP Server Card (SEP-2127)', () => {
  it('serves the Server Card at /mcp/server-card with SEP-2127 media type and CORS', async () => {
    const request = new Request('https://osada.us/mcp/server-card', {
      method: 'GET',
      headers: {
        Accept: 'application/mcp-server-card+json',
      },
    });

    const response = await onRequestGet({ request, params: { path: ['server-card'] } });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/mcp-server-card+json; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('ETag')).toBe(`"sc-${MCP_SERVER_CARD.version}"`);

    const card = await response.json() as typeof MCP_SERVER_CARD;
    expect(card.$schema).toBe('https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json');
    expect(card.name).toBe('us.osada/o-sumo');
    expect(card.remotes).toEqual([
      {
        type: 'streamable-http',
        url: 'https://osada.us/mcp',
      },
      {
        type: 'streamable-http',
        url: 'https://ask.osada.us/mcp',
      },
    ]);
  });
  it('supports ETag caching with 304 Not Modified', async () => {
    const etag = `"sc-${MCP_SERVER_CARD.version}"`;
    const request = new Request('https://osada.us/mcp/server-card', {
      method: 'GET',
      headers: {
        'If-None-Match': etag,
      },
    });

    const response = await onRequestGet({ request, params: { path: ['server-card'] } });
    expect(response.status).toBe(304);
    expect(response.headers.get('ETag')).toBe(etag);
  });

  it('responds with 204 to OPTIONS requests', async () => {
    const response = await onRequestOptions();
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('responds with 405 Method Not Allowed to GET /mcp per MCP spec', async () => {
    const request = new Request('https://osada.us/mcp', {
      method: 'GET',
      headers: { Host: 'osada.us' },
    });

    const response = await onRequestGet({ request, params: { path: [] } });
    expect(response.status).toBe(405);
  });
});

describe('Host & Origin validation', () => {
  it('allows standard hosts and pages.dev preview domains', () => {
    const req1 = new Request('https://osada.us/mcp');
    expect(getAllowedHostnames(req1)).toContain('osada.us');

    const req2 = new Request('https://preview-123.o-sumo.pages.dev/mcp');
    expect(getAllowedHostnames(req2)).toContain('preview-123.o-sumo.pages.dev');
  });

  it('rejects POST with forbidden Host header with 403', async () => {
    const request = new Request('https://evil.com/mcp', {
      method: 'POST',
      headers: {
        Host: 'evil.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });

    const response = await onRequestPost({ request });
    expect(response.status).toBe(403);
  });

  it('rejects POST with forbidden Origin header with 403', async () => {
    const request = new Request('https://osada.us/mcp', {
      method: 'POST',
      headers: {
        Host: 'osada.us',
        Origin: 'https://evil.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });

    const response = await onRequestPost({ request });
    expect(response.status).toBe(403);
  });

  it('allows POST without Origin header (CLI, agent runners, curl)', async () => {
    const request = new Request('https://osada.us/mcp', {
      method: 'POST',
      headers: {
        Host: 'osada.us',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });

    const mockFetch = createMockAssetFetch();
    const response = await onRequestPost({
      request,
      env: { ASSETS: { fetch: mockFetch } },
    });
    expect(response.status).toBe(200);
  });
});

describe('MCP Tools execution', () => {
  const toolsContext = {
    request: new Request('https://osada.us/mcp'),
    env: { ASSETS: { fetch: createMockAssetFetch() } },
  };

  it('registers all 5 Grand Sumo tools', () => {
    const server = createSumoMcpServer(toolsContext);
    expect(server).toBeDefined();
  });

  async function callMcpTool(method: string, params: Record<string, unknown> = {}) {
    const request = new Request('https://osada.us/mcp', {
      method: 'POST',
      headers: {
        Host: 'osada.us',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-call',
        method,
        params,
      }),
    });

    const response = await onRequestPost({
      request,
      env: toolsContext.env,
    });
    expect(response.status).toBe(200);
    const text = await response.text();
    const dataLine = text.split('\n').find((line) => line.startsWith('data: '));
    expect(dataLine).toBeDefined();
    return JSON.parse(dataLine!.slice(6)) as {
      result?: {
        tools?: Array<{ name: string; description: string }>;
        content?: Array<{ type: string; text: string }>;
      };
      error?: unknown;
    };
  }

  it('returns the 5 sumo tools from tools/list', async () => {
    const res = await callMcpTool('tools/list');
    expect(res.result).toBeDefined();
    const toolNames = res.result?.tools?.map((t) => t.name);
    expect(toolNames).toContain('search_rikishi');
    expect(toolNames).toContain('get_rikishi_profile');
    expect(toolNames).toContain('get_banzuke');
    expect(toolNames).toContain('get_torikumi');
    expect(toolNames).toContain('list_basho');
  });

  it('executes search_rikishi and returns matching rikishi', async () => {
    const res = await callMcpTool('tools/call', {
      name: 'search_rikishi',
      arguments: { query: '大の里' },
    });
    expect(res.result?.content?.[0]?.text).toBeDefined();
    const data = JSON.parse(res.result!.content![0].text) as { count: number; matches: Array<{ name: string; id: number }> };
    expect(data.count).toBe(1);
    expect(data.matches[0].name).toBe('大の里');
    expect(data.matches[0].id).toBe(4227);
  });

  it('executes get_rikishi_profile by ID', async () => {
    const res = await callMcpTool('tools/call', {
      name: 'get_rikishi_profile',
      arguments: { id: 4227 },
    });
    expect(res.result?.content?.[0]?.text).toBeDefined();
    const profile = JSON.parse(res.result!.content![0].text) as { id: number; name: string };
    expect(profile.id).toBe(4227);
    expect(profile.name).toBe('大の里');
  });

  it('executes get_banzuke for current basho', async () => {
    const res = await callMcpTool('tools/call', {
      name: 'get_banzuke',
      arguments: {},
    });
    expect(res.result?.content?.[0]?.text).toBeDefined();
    const banzuke = JSON.parse(res.result!.content![0].text) as { bashoName: string };
    expect(banzuke.bashoName).toBe('九月場所');
  });

  it('executes get_torikumi by pathDate', async () => {
    const res = await callMcpTool('tools/call', {
      name: 'get_torikumi',
      arguments: { pathDate: '20260927', mode: 'result' },
    });
    expect(res.result?.content?.[0]?.text).toBeDefined();
    const torikumi = JSON.parse(res.result!.content![0].text) as { pathDate: string; dayHead: string };
    expect(torikumi.pathDate).toBe('20260927');
    expect(torikumi.dayHead).toBe('千秋楽');
  });

  it('executes list_basho returning current and archive basho', async () => {
    const res = await callMcpTool('tools/call', {
      name: 'list_basho',
      arguments: {},
    });
    expect(res.result?.content?.[0]?.text).toBeDefined();
    const basho = JSON.parse(res.result!.content![0].text) as { current: { id: string }; archive: Array<{ id: string }> };
    expect(basho.current.id).toBe('202611');
    expect(basho.archive.length).toBeGreaterThan(0);
  });
});
