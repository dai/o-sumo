import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { searchRikishi, getRikishiProfile, getBanzuke, getTorikumi, listBasho } from './tools';

export interface SumoServerContext {
  env?: { ASSETS?: { fetch: typeof fetch } };
  request: Request;
}

export function createDataFetcher(ctx: SumoServerContext): (path: string) => Promise<unknown | null> {
  return async (path: string): Promise<unknown | null> => {
    const url = new URL(path, ctx.request.url);
    try {
      const res = ctx.env?.ASSETS?.fetch
        ? await ctx.env.ASSETS.fetch(url)
        : await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };
}

export function createSumoMcpServer(ctx: SumoServerContext): McpServer {
  const server = new McpServer({
    name: 'us.osada/o-sumo',
    version: '1.0.0',
    title: 'o-sumo (大相撲アーカイブ)',
    description: 'Grand Sumo banzuke, torikumi results, and rikishi profile data.',
  });

  const fetcher = createDataFetcher(ctx);

  server.registerTool(
    'search_rikishi',
    {
      description: 'Search Grand Sumo rikishi by 四股名 (shikona) or 読み (yomi). Returns up to 20 matching rikishi with their ID, name, reading, current rank, and profile URLs.',
      inputSchema: z.object({
        query: z.string().min(1).describe('Search query for rikishi name or reading (e.g. "大の里", "おおのさと")'),
      }),
    },
    async ({ query }) => {
      const result = await searchRikishi(query, fetcher);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_rikishi_profile',
    {
      description: 'Get detailed profile and career record for a specific rikishi by numeric ID.',
      inputSchema: z.object({
        id: z.number().int().positive().describe('Official rikishi ID (e.g. 4227)'),
      }),
    },
    async ({ id }) => {
      const result = await getRikishiProfile(id, fetcher);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_banzuke',
    {
      description: 'Get official Grand Sumo banzuke (rankings for makuuchi and juryo divisions). Optionally specify monthKey (YYYYMM, e.g. "202609") for historical basho, or omit for the latest basho.',
      inputSchema: z.object({
        monthKey: z.string().regex(/^\d{6}$/).optional().describe('Basho month key in YYYYMM format (e.g. "202609"). Defaults to current basho.'),
      }),
    },
    async ({ monthKey }) => {
      const result = await getBanzuke(monthKey, fetcher);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_torikumi',
    {
      description: 'Get torikumi match results or schedule for a specific day (pathDate in YYYYMMDD format).',
      inputSchema: z.object({
        pathDate: z.string().regex(/^\d{8}$/).describe('Date key in YYYYMMDD format (e.g. "20260927")'),
        mode: z.enum(['result', 'schedule']).optional().default('result').describe('Whether to fetch "result" (completed bouts) or "schedule" (scheduled bouts). Defaults to "result".'),
      }),
    },
    async ({ pathDate, mode }) => {
      const result = await getTorikumi(pathDate, mode, fetcher);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'list_basho',
    {
      description: 'List current and archived Grand Sumo basho available in o-sumo, along with their page URLs and API endpoints.',
      inputSchema: z.object({}),
    },
    async () => {
      const result = listBasho();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}
