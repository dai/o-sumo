import { describe, expect, it, vi } from 'vitest';
import { onRequest, HOME_LINK_HEADERS, rewritePageMetadata } from '../../../../functions/_middleware';
import { installHtmlRewriterSpy } from '../../../test/html-rewriter-spy';

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

describe('rewritePageMetadata (SEO rewriter)', () => {
  it('registers handlers for title, meta tags, og tags, twitter tags, and canonical link', () => {
    const spy = installHtmlRewriterSpy();
    try {
      const response = new Response('<!DOCTYPE html><html><head></head><body></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
      rewritePageMetadata(response, {
        title: '大相撲 テスト',
        description: 'テスト用の説明',
        canonicalUrl: 'https://osada.us/kimarite/',
      });

      expect(spy.rewriters).toHaveLength(1);
      const selectors = spy.rewriters[0].registrations.map((registration) => registration.selector);
      expect(selectors).toEqual(expect.arrayContaining([
        'title',
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:url"]',
        'meta[name="twitter:title"]',
        'meta[name="twitter:description"]',
        'link[rel="canonical"]',
        'head',
      ]));
    } finally {
      spy.restore();
    }
  });

  it('writes the canonical link href via setAttribute when matched', () => {
    const spy = installHtmlRewriterSpy();
    try {
      const response = new Response('<html><body></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
      rewritePageMetadata(response, {
        title: 't',
        description: 'd',
        canonicalUrl: 'https://osada.us/archives/',
      });

      const titleRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'title');
      expect(titleRegistration?.handlers.element).toBeDefined();
      const metaRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'meta[name="description"]');
      expect(metaRegistration?.handlers.element).toBeDefined();
      const canonicalRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'link[rel="canonical"]');
      expect(canonicalRegistration?.handlers.element).toBeDefined();
    } finally {
      spy.restore();
    }
  });

  it('HTML-escapes the canonical URL when appending to head', () => {
    const spy = installHtmlRewriterSpy();
    try {
      const response = new Response('<html><body></body></html>', { status: 200 });
      rewritePageMetadata(response, {
        title: 't',
        description: 'd',
        canonicalUrl: 'https://osada.us/&"<path>/',
      });

      const headRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'head');
      expect(headRegistration?.handlers.element).toBeDefined();
      // The element handler is called by HTMLRewriter; in our stub we can
      // invoke it manually with a fake element to verify the append string
      // contains escaped HTML.
      let captured = '';
      const fakeElement = {
        setInnerContent: () => {},
        setAttribute: () => {},
        append: (content: string, _options?: { html?: boolean }) => {
          captured = content;
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (headRegistration!.handlers.element as any)(fakeElement);
      expect(captured).toContain('href="https://osada.us/&amp;&quot;&lt;path&gt;/"');
      expect(captured).not.toContain('href="https://osada.us/&"<path>/"');
    } finally {
      spy.restore();
    }
  });
});

describe('onRequest SEO routing for sitemap-targeted HTML routes', () => {
  function makeHtmlResponse(body = '<!DOCTYPE html><html><body></body></html>'): Response {
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  function makeContext(request: Request, mockNext: ReturnType<typeof vi.fn>): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    return {
      request,
      env: { ASSETS: { fetch: vi.fn().mockResolvedValue(new Response('null', { status: 200 })) } },
      next: mockNext,
    };
  }

  it.each([
    ['/archives/', '大相撲の場所別アーカイブ | o-sumo'],
    ['/rikishi/', '力士一覧 | o-sumo'],
    ['/gyoji/', '行司名鑑 | o-sumo'],
    ['/yobidashi/', '呼出名鑑 | o-sumo'],
    ['/kimarite/', '決まり手一覧 | o-sumo'],
    ['/analytics/', '大相撲データ分析 | o-sumo'],
    // /about/ is tested separately via `resolvePageMeta` so we don't have to
    // hand-type the long Japanese title into this list.
    ['/202609-banzuke/', '2026年9月場所 番付 | o-sumo'],
    ['/202609-yotei/', '2026年9月場所 取組予定 | o-sumo'],
    ['/202609-torikumi/', '2026年9月場所 取組・星取表 | o-sumo'],
    ['/20260913-yotei/', '2026年9月場所 初日 取組予定 | o-sumo'],
    ['/20260913-torikumi/', '2026年9月場所 初日 取組・星取表 | o-sumo'],
  ])('applies resolvePageMeta for %s', async (pathname, expectedTitle) => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request(`https://osada.us${pathname}`, {
        headers: { Accept: 'text/html' },
      });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      const response = await onRequest(makeContext(request, mockNext));

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
      // The rewriter must have been invoked with the title element handler
      // that sets the page-meta title.
      expect(spy.rewriters).toHaveLength(1);
      const titleRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'title');
      expect(titleRegistration?.handlers.element).toBeDefined();
      let capturedTitle = '';
      const fakeTitleElement = {
        setInnerContent: (content: string) => {
          capturedTitle = content;
        },
        setAttribute: () => {},
        append: () => {},
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (titleRegistration!.handlers.element as any)(fakeTitleElement);
      expect(capturedTitle).toBe(expectedTitle);
    } finally {
      spy.restore();
    }
  });

  it('skips rewritePageMetadata for the homepage', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/', { headers: { Accept: 'text/html' } });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      const response = await onRequest(makeContext(request, mockNext));

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
      // No rewriter calls for the homepage.
      expect(spy.rewriters).toHaveLength(0);
    } finally {
      spy.restore();
    }
  });

  it.each([
    '/unknown-route/',
    '/209901-banzuke/',
    '/20260731-yotei/',
    '/gyoji/not-a-number/',
  ])('skips rewritePageMetadata for notFound route %s', async (pathname) => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request(`https://osada.us${pathname}`, {
        headers: { Accept: 'text/html' },
      });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      expect(spy.rewriters).toHaveLength(0);
    } finally {
      spy.restore();
    }
  });

  it('still applies the SEO rewrite on /compare/ with the comparison fallback metadata', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/compare/', {
        headers: { Accept: 'text/html' },
      });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      // /compare/ maps to the rikishi collection. The middleware fetches
      // rikishi.json (already mocked) and falls back to the page-meta
      // comparison title.
      expect(spy.rewriters.length).toBeGreaterThanOrEqual(1);
      const last = spy.rewriters[spy.rewriters.length - 1];
      const titleRegistration = last.registrations.find((r) => r.selector === 'title');
      expect(titleRegistration?.handlers.element).toBeDefined();
      let capturedTitle = '';
      const fakeTitleElement = {
        setInnerContent: (content: string) => {
          capturedTitle = content;
        },
        setAttribute: () => {},
        append: () => {},
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (titleRegistration!.handlers.element as any)(fakeTitleElement);
      expect(capturedTitle).toBe('力士比較 | o-sumo');
    } finally {
      spy.restore();
    }
  });

  it('preserves profile-specific title on /rikishi/{id}/ via the share-collection path', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const rikishiPayload = { rikishi: [{ id: 4227, name: '大の里' }] };
      const request = new Request('https://osada.us/rikishi/4227/', {
        headers: { Accept: 'text/html' },
      });
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(rikishiPayload), { status: 200 }),
      );
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        request,
        env: { ASSETS: { fetch: mockFetch } },
        next: mockNext,
      };
      await onRequest(context);

      expect(mockFetch).toHaveBeenCalledWith(new URL('/api/v1/rikishi.json', 'https://osada.us/rikishi/4227/'));
      expect(spy.rewriters).toHaveLength(1);
      const titleRegistration = spy.rewriters[0].registrations.find((r) => r.selector === 'title');
      let capturedTitle = '';
      const fakeTitleElement = {
        setInnerContent: (content: string) => {
          capturedTitle = content;
        },
        setAttribute: () => {},
        append: () => {},
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (titleRegistration!.handlers.element as any)(fakeTitleElement);
      expect(capturedTitle).toBe('大の里 | 力士プロフィール | o-sumo');
    } finally {
      spy.restore();
    }
  });
});

describe('onRequest SEO noscript injection', () => {
  function makeHtmlResponse(body = '<!DOCTYPE html><html><body></body></html>'): Response {
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  function makeContext(request: Request, mockNext: ReturnType<typeof vi.fn>): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    return {
      request,
      env: {
        ASSETS: {
          fetch: vi.fn().mockImplementation(async (_url: URL) => {
            // Stub the per-month banzuke.json (and anything else) as empty so
            // the noscript builder takes its fixture-driven code paths.
            return new Response('null', { status: 200, headers: { 'Content-Type': 'application/json' } });
          }),
        },
      },
      next: mockNext,
    };
  }

  it('registers a body handler that appends <noscript> for /kimarite/', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/kimarite/', { headers: { Accept: 'text/html' } });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      expect(spy.rewriters).toHaveLength(1);
      const bodyRegistrations = spy.rewriters[0].registrations.filter((r) => r.selector === 'body');
      expect(bodyRegistrations).toHaveLength(1);
      let appended = '';
      const fakeBody = {
        setInnerContent: () => {},
        setAttribute: () => {},
        append: (content: string, options?: { html?: boolean }) => {
          if (options?.html) appended = content;
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (bodyRegistrations[0].handlers.element as any)(fakeBody);
      expect(appended).toContain('<noscript');
      expect(appended).toContain('決まり手一覧');
      expect(appended).toContain('寄り切り');
    } finally {
      spy.restore();
    }
  });

  it('does not register a body handler for the homepage', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/', { headers: { Accept: 'text/html' } });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      expect(spy.rewriters).toHaveLength(0);
    } finally {
      spy.restore();
    }
  });

  it('does not register a body handler for notFound routes', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/this-route-does-not-exist/', { headers: { Accept: 'text/html' } });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      expect(spy.rewriters).toHaveLength(0);
    } finally {
      spy.restore();
    }
  });

  it('injects a body noscript on /archives/ listing all archived months', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const request = new Request('https://osada.us/archives/', { headers: { Accept: 'text/html' } });
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      await onRequest(makeContext(request, mockNext));

      expect(spy.rewriters).toHaveLength(1);
      const bodyReg = spy.rewriters[0].registrations.find((r) => r.selector === 'body');
      let appended = '';
      const fakeBody = {
        setInnerContent: () => {},
        setAttribute: () => {},
        append: (content: string, options?: { html?: boolean }) => {
          if (options?.html) appended = content;
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (bodyReg!.handlers.element as any)(fakeBody);
      expect(appended).toContain('2026年9月場所');
      expect(appended).toContain('2026年7月場所');
      expect(appended).toContain('/202609-banzuke/');
    } finally {
      spy.restore();
    }
  });

  it('injects a profile noscript on /rikishi/{id}/ using the share payload', async () => {
    const spy = installHtmlRewriterSpy();
    try {
      const payload = { rikishi: [{ id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱' }] };
      const request = new Request('https://osada.us/rikishi/4227/', { headers: { Accept: 'text/html' } });
      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
      const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        request,
        env: { ASSETS: { fetch: mockFetch } },
        next: mockNext,
      };
      await onRequest(context);

      expect(spy.rewriters).toHaveLength(1);
      const bodyReg = spy.rewriters[0].registrations.find((r) => r.selector === 'body');
      let appended = '';
      const fakeBody = {
        setInnerContent: () => {},
        setAttribute: () => {},
        append: (content: string, options?: { html?: boolean }) => {
          if (options?.html) appended = content;
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (bodyReg!.handlers.element as any)(fakeBody);
      expect(appended).toContain('<noscript');
      expect(appended).toContain('大の里');
      expect(appended).toContain('力士プロフィール');
    } finally {
      spy.restore();
    }
  });
});
