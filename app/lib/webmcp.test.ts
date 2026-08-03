import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEBMCP_TOOLS, hasWebMcpSupport, registerWebMcpTools } from './webmcp';

describe('webmcp tools', () => {
  it('exposes the expected tool names', () => {
    expect(WEBMCP_TOOLS.map((t) => t.name)).toEqual([
      'search_rikishi',
      'list_basho',
      'get_banzuke_for_month',
      'get_torikumi_for_day',
    ]);
  });

  it('declares JSON Schema objects for each tool', () => {
    for (const tool of WEBMCP_TOOLS) {
      expect(tool.inputSchema).toBeTypeOf('object');
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.description.length).toBeGreaterThan(0);
      expect(typeof tool.execute).toBe('function');
    }
  });
});

describe('list_basho execution', () => {
  it('returns current basho and archive', async () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'list_basho');
    if (!tool) throw new Error('list_basho missing');
    const result = await Promise.resolve(tool.execute({}));
    expect(result).toMatchObject({
      current: { banzukePath: expect.stringMatching(/^\/\d{6}-banzuke$/) },
    });
    expect(Array.isArray((result as { archive: unknown[] }).archive)).toBe(true);
  });
});

describe('get_banzuke_for_month execution', () => {
  it('accepts supported month keys', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_banzuke_for_month');
    if (!tool) throw new Error('get_banzuke_for_month missing');
    const result = tool.execute({ monthKey: '202603' }) as { monthKey: string };
    expect(result.monthKey).toBe('202603');
  });

  it('rejects unsupported month keys', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_banzuke_for_month');
    if (!tool) throw new Error('get_banzuke_for_month missing');
    const result = tool.execute({ monthKey: '209999' }) as { error: string };
    expect(result.error).toMatch(/Unsupported/);
  });

  it('rejects malformed month keys', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_banzuke_for_month');
    if (!tool) throw new Error('get_banzuke_for_month missing');
    const result = tool.execute({ monthKey: '20a603' }) as { error: string };
    expect(result.error).toMatch(/Unsupported/);
  });
});

describe('get_torikumi_for_day execution', () => {
  it('returns result URL by default', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_torikumi_for_day');
    if (!tool) throw new Error('get_torikumi_for_day missing');
    const result = tool.execute({ pathDate: '20260315' }) as { url: string; mode: string };
    expect(result.url).toMatch(/\/20260315-torikumi\/$/);
    expect(result.mode).toBe('result');
  });

  it('returns schedule URL when requested', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_torikumi_for_day');
    if (!tool) throw new Error('get_torikumi_for_day missing');
    const result = tool.execute({ pathDate: '20260315', mode: 'schedule' }) as { url: string; mode: string };
    expect(result.url).toMatch(/\/20260315-yotei\/$/);
    expect(result.mode).toBe('schedule');
  });

  it('rejects malformed pathDate', () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'get_torikumi_for_day');
    if (!tool) throw new Error('get_torikumi_for_day missing');
    const result = tool.execute({ pathDate: 'abc' }) as { error: string };
    expect(result.error).toMatch(/pathDate/);
  });
});

describe('search_rikishi execution', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty matches for empty query', async () => {
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'search_rikishi');
    if (!tool) throw new Error('search_rikishi missing');
    const result = await Promise.resolve(tool.execute({ query: '' }));
    expect(result).toEqual({ matches: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns matched rikishi when index is available', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        updatedAt: '2026-01-01',
        rikishi: [
          { id: 1, name: '照ノ富士', yomi: 'てるのふじ', currentRank: '横綱', profileUrl: 'https://example.com/1' },
          { id: 2, name: '霧島', yomi: 'きりしま', currentRank: '大関', profileUrl: 'https://example.com/2' },
        ],
      }),
    });
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'search_rikishi');
    if (!tool) throw new Error('search_rikishi missing');
    const result = (await Promise.resolve(tool.execute({ query: '照ノ' }))) as { matches: Array<{ id: number }> };
    expect(result.matches.map((m) => m.id)).toEqual([1]);
  });

  it('returns error when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));
    const tool = WEBMCP_TOOLS.find((t) => t.name === 'search_rikishi');
    if (!tool) throw new Error('search_rikishi missing');
    const result = (await Promise.resolve(tool.execute({ query: 'x' }))) as { error: string };
    expect(result.error).toMatch(/Failed to load/);
  });
});

describe('WebMCP browser integration helpers', () => {
  it('hasWebMcpSupport returns true when provideContext exists', () => {
    expect(hasWebMcpSupport({ modelContext: { provideContext: () => null } })).toBe(true);
  });

  it('hasWebMcpSupport returns false when missing', () => {
    expect(hasWebMcpSupport({})).toBe(false);
    expect(hasWebMcpSupport(undefined)).toBe(false);
  });

  it('registerWebMcpTools invokes provideContext when available', () => {
    const provideContext = vi.fn();
    const ok = registerWebMcpTools({ modelContext: { provideContext } }, WEBMCP_TOOLS);
    expect(ok).toBe(true);
    expect(provideContext).toHaveBeenCalledTimes(1);
    const arg = provideContext.mock.calls[0][0];
    expect(Array.isArray(arg.tools)).toBe(true);
    expect(arg.tools.length).toBe(WEBMCP_TOOLS.length);
  });

  it('registerWebMcpTools returns false when not supported', () => {
    expect(registerWebMcpTools({})).toBe(false);
    expect(registerWebMcpTools(undefined)).toBe(false);
  });
});