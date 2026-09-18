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
        imageUrl: 'https://osada.us/images/og-default.jpg?v=20260913',
        imageWidth: 1200,
        imageHeight: 630,
        imageAlt: 'テスト用OGP画像',
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
        imageUrl: 'https://osada.us/images/og-default.jpg?v=20260913',
        imageWidth: 1200,
        imageHeight: 630,
        imageAlt: 'テスト用OGP画像',
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
        imageUrl: 'https://osada.us/images/og-default.jpg?v=20260913',
        imageWidth: 1200,
        imageHeight: 630,
        imageAlt: 'テスト用OGP画像',
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

describe('onRequest trailing-slash enforcement', () => {
  function makeHtmlResponse(body = '<!DOCTYPE html><html><body></body></html>'): Response {
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeContext(
    request: Request,
    mockNext: ReturnType<typeof vi.fn>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchImpl?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    return {
      request,
      env: {
        ASSETS: {
          fetch:
            fetchImpl ?? vi.fn().mockResolvedValue(new Response('null', { status: 200 })),
        },
      },
      next: mockNext,
    };
  }

  it.each([
    '/archives',
    '/analytics',
    '/about',
    '/kimarite',
    '/compare',
    '/my-rikishi',
    '/rikishi',
    '/rikishi/2565',
    '/gyoji',
    '/gyoji/4227',
    '/yobidashi',
    '/yobidashi/4227',
    '/202609-banzuke',
    '/202609-torikumi',
    '/20260913-torikumi',
  ])('returns 308 redirect for SPA path %s without trailing slash', async (pathname) => {
    const request = new Request(`https://osada.us${pathname}`, {
      headers: { Accept: 'text/html' },
    });
    const mockNext = vi.fn();
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe(`https://osada.us${pathname}/`);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('preserves query string in the redirect Location', async () => {
    const request = new Request('https://osada.us/archives?page=2&sort=date', {
      headers: { Accept: 'text/html' },
    });
    const mockNext = vi.fn();
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://osada.us/archives/?page=2&sort=date');
  });

  it('does not redirect when the trailing slash is already present', async () => {
    const request = new Request('https://osada.us/archives/', {
      headers: { Accept: 'text/html' },
    });
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).toBe(200);
    expect(mockNext).toHaveBeenCalled();
  });

  it('does not redirect for the homepage', async () => {
    const request = new Request('https://osada.us/', {
      headers: { Accept: 'text/html' },
    });
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('does not redirect for static files (e.g. /index.html)', async () => {
    const request = new Request('https://osada.us/index.html', {
      headers: { Accept: 'text/html' },
    });
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    await onRequest(makeContext(request, mockNext));

    expect(mockNext).toHaveBeenCalled();
  });

  it('does not redirect for /api/* paths', async () => {
    const request = new Request('https://osada.us/api/v1/rikishi/2565.json', {
      headers: { Accept: 'application/json' },
    });
    const mockNext = vi
      .fn()
      .mockResolvedValue(
        new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
      );
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).not.toBe(308);
  });

  it('does not redirect for /sitemap.xml', async () => {
    const request = new Request('https://osada.us/sitemap.xml', {
      headers: { Accept: 'application/xml' },
    });
    const mockNext = vi
      .fn()
      .mockResolvedValue(
        new Response('<urlset/>', { status: 200, headers: { 'Content-Type': 'application/xml' } }),
      );
    const response = await onRequest(makeContext(request, mockNext));

    expect(response.status).not.toBe(308);
  });
});

describe('onRequest invalid rikushi ID handling', () => {
  function makeHtmlResponse(body = '<!DOCTYPE html><html><body></body></html>'): Response {
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeContext(request: Request, mockNext: ReturnType<typeof vi.fn>, fetchImpl: any): any {
    return {
      request,
      env: { ASSETS: { fetch: fetchImpl } },
      next: mockNext,
    };
  }

  it('returns 404 with the custom noindex 404 page for unknown numeric IDs', async () => {
    const notFoundHtml =
      '<!DOCTYPE html><html><head><title>404</title><meta name="robots" content="noindex"></head><body>not found</body></html>';
    const request = new Request('https://osada.us/rikishi/9999999/', {
      headers: { Accept: 'text/html' },
    });
    const mockFetch = vi
      .fn()
      .mockImplementation(async (url: URL, init?: RequestInit) => {
        if (url.pathname === '/404.html') {
          return new Response(notFoundHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        if (init?.method === 'HEAD' && url.pathname === '/api/v1/rikishi/9999999.json') {
          return new Response(null, { status: 404 });
        }
        return new Response('null', { status: 404 });
      });
    const mockNext = vi.fn();
    const response = await onRequest(makeContext(request, mockNext, mockFetch));

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(mockNext).not.toHaveBeenCalled();
    const text = await response.text();
    expect(text).toContain('404');
  });

  it('marks the 404 response as cacheable for 5 minutes', async () => {
    const notFoundHtml = '<!DOCTYPE html><html><body>404</body></html>';
    const request = new Request('https://osada.us/rikishi/9999999/', {
      headers: { Accept: 'text/html' },
    });
    const mockFetch = vi
      .fn()
      .mockImplementation(async (url: URL, _init?: RequestInit) => {
        if (url.pathname === '/404.html') {
          return new Response(notFoundHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        return new Response(null, { status: 404 });
      });
    const mockNext = vi.fn();
    const response = await onRequest(makeContext(request, mockNext, mockFetch));

    expect(response.status).toBe(404);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, must-revalidate');
  });

  it('issues a HEAD request to /api/v1/rikishi/{id}.json to verify existence', async () => {
    const request = new Request('https://osada.us/rikishi/4227/', {
      headers: { Accept: 'text/html' },
    });
    const headCalls: Array<{ pathname: string; method: string | undefined }> = [];
    const mockFetch = vi
      .fn()
      .mockImplementation(async (url: URL, init?: RequestInit) => {
        if (init?.method === 'HEAD') {
          headCalls.push({ pathname: url.pathname, method: init.method });
          return new Response(null, { status: 200 });
        }
        if (url.pathname === '/api/v1/rikishi.json') {
          return new Response(
            JSON.stringify({ rikishi: [{ id: 4227, name: '大の里' }] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response('null', { status: 200 });
      });
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    const response = await onRequest(makeContext(request, mockNext, mockFetch));

    expect(response.status).toBe(200);
    expect(headCalls).toEqual([
      { pathname: '/api/v1/rikishi/4227.json', method: 'HEAD' },
    ]);
  });

  it('does not perform the HEAD check for non-numeric rikushi IDs', async () => {
    const request = new Request('https://osada.us/rikishi/not-a-number/', {
      headers: { Accept: 'text/html' },
    });
    const mockFetch = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    const response = await onRequest(makeContext(request, mockNext, mockFetch));

    expect(response.status).toBe(200);
    const headCalls = mockFetch.mock.calls.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (call: any[]) => (call[1] as RequestInit | undefined)?.method === 'HEAD',
    );
    expect(headCalls).toHaveLength(0);
  });

  it('does not perform the HEAD check for gyoji or yobidashi IDs', async () => {
    // The 404 enforcement is intentionally limited to /rikushi/{id}/ per the
    // design — gyoji and yobidashi paths should not trigger an ASSETS.fetch.
    const request = new Request('https://osada.us/gyoji/9999999/', {
      headers: { Accept: 'text/html' },
    });
    const mockFetch = vi.fn().mockResolvedValue(new Response('null', { status: 200 }));
    const mockNext = vi.fn().mockResolvedValue(makeHtmlResponse());
    const response = await onRequest(makeContext(request, mockNext, mockFetch));

    expect(response.status).toBe(200);
    const headCalls = mockFetch.mock.calls.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (call: any[]) => (call[1] as RequestInit | undefined)?.method === 'HEAD',
    );
    expect(headCalls).toHaveLength(0);
  });
});
