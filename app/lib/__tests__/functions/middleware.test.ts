import { describe, expect, it, vi } from 'vitest';
import { onRequest, HOME_LINK_HEADERS } from '../../../../functions/_middleware';

describe('Cloudflare Pages Functions _middleware', () => {
  it('exports valid HOME_LINK_HEADERS containing RFC 8288 / RFC 9727 relation types', () => {
    expect(HOME_LINK_HEADERS).toContain('</.well-known/api-catalog>; rel="api-catalog"');
    expect(HOME_LINK_HEADERS).toContain('</.well-known/ai-catalog.json>; rel="ai-catalog"');
    expect(HOME_LINK_HEADERS).toContain('</.well-known/agent-card.json>; rel="describedby"');
    expect(HOME_LINK_HEADERS).toContain('</.well-known/mcp/server-card.json>; rel="service-desc"');
    expect(HOME_LINK_HEADERS).toContain('</.well-known/agent-skills/index.json>; rel="agent-skills"');
    expect(HOME_LINK_HEADERS).toContain('</index.md>; rel="alternate"; type="text/markdown"; title="Markdown version"');
    expect(HOME_LINK_HEADERS).toContain('</auth.md>; rel="auth.md"');
  });

  it('serves HTML and attaches Link headers for homepage requests with Accept: */*', async () => {
    const request = new Request('https://osada.us/', {
      headers: { Accept: '*/*' },
    });
    const mockNext = vi.fn().mockResolvedValue(
      new Response('<!DOCTYPE html><html><body>o-sumo</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = {
      request,
      env: { ASSETS: { fetch: vi.fn() } },
      next: mockNext,
    };

    const response = await onRequest(context);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    const linkHeader = response.headers.get('Link');
    expect(linkHeader).toBeTruthy();
    expect(linkHeader).toContain('rel="api-catalog"');
    expect(linkHeader).toContain('rel="describedby"');
    expect(linkHeader).toContain('rel="service-desc"');
  });

  it('serves HTML for browser document navigation with text/html Accept header', async () => {
    const request = new Request('https://osada.us/archives/', {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const mockNext = vi.fn().mockResolvedValue(
      new Response('<!DOCTYPE html><html><body>archives</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = {
      request,
      env: { ASSETS: { fetch: vi.fn() } },
      next: mockNext,
    };

    const response = await onRequest(context);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  it('serves Markdown with private cache-control and Link headers when Accept: text/markdown is explicitly requested on homepage', async () => {
    const mdContent = '# o-sumo\nHome Markdown';
    const request = new Request('https://osada.us/', {
      headers: { Accept: 'text/markdown' },
    });
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(new TextEncoder().encode(mdContent), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown' },
      }),
    );
    const mockNext = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: any = {
      request,
      env: { ASSETS: { fetch: mockFetch } },
      next: mockNext,
    };

    const response = await onRequest(context);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(new URL('/index.md', 'https://osada.us/'));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Vary')).toBe('Accept');
    expect(response.headers.get('Cache-Control')).toBe('private, no-cache, no-transform');
    const linkHeader = response.headers.get('Link');
    expect(linkHeader).toBeTruthy();
    expect(linkHeader).toContain('rel="api-catalog"');
    expect(linkHeader).toContain('rel="describedby"');
    expect(linkHeader).toContain('rel="service-desc"');
    const text = await response.text();
    expect(text).toBe(mdContent);
  });
});
