import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('PWA smoke config', () => {
  it('keeps the custom 404 page under source control', () => {
    const notFoundHtml = join(process.cwd(), 'public/404.html');

    expect(existsSync(notFoundHtml)).toBe(true);
    const html = readFileSync(notFoundHtml, 'utf-8');
    expect(html).toContain('<title>404 - ページが見つかりません</title>');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });

  it('canonicalizes the analytics route before serving the SPA fallback', () => {
    const redirects = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf-8');

    expect(redirects).toContain('/analytics /analytics/ 301');
    expect(redirects).toContain('/analytics/ / 200');
  });

  it('canonicalizes the kimarite route before serving the SPA fallback', () => {
    const redirects = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf-8');

    expect(redirects).toContain('/kimarite /kimarite/ 301');
    expect(redirects).toContain('/kimarite/ / 200');
  });

  it('advertises the API catalog from the homepage response headers', () => {
    const headers = readFileSync(join(process.cwd(), 'public/_headers'), 'utf-8');

    expect(headers).toContain('Link: </.well-known/api-catalog>; rel="api-catalog"');
    expect(headers).toContain(
      [
        '/.well-known/api-catalog',
        '  Cache-Control: public, max-age=300',
        '  Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
        '  Link: </.well-known/api-catalog>; rel="api-catalog"',
      ].join('\n'),
    );
  });

  it('publishes a machine-readable API catalog under .well-known', () => {
    const catalogPath = join(process.cwd(), 'public/.well-known/api-catalog');

    expect(existsSync(catalogPath)).toBe(true);
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
    expect(catalog).toEqual({
      linkset: [
        {
          anchor: 'https://osada.us/.well-known/api-catalog',
          item: [
            { href: 'https://osada.us/api/v1/banzuke.json' },
            { href: 'https://osada.us/api/v1/gyoji.json' },
            { href: 'https://osada.us/api/v1/news.json' },
            { href: 'https://osada.us/api/v1/torikumi.json' },
            { href: 'https://osada.us/api/v1/rikishi.json' },
            { href: 'https://osada.us/api/v1/yobidashi.json' },
          ],
        },
        {
          anchor: 'https://osada.us/',
          rel: 'https://a2a-protocol.org/latest/specification/#441-agentcard',
          href: 'https://osada.us/.well-known/agent-card.json',
          title: 'A2A Agent Card (discovery only)',
        },
      ],
    });
  });

  it('keeps auto-update strategy and API-only runtime caching', () => {
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf-8');

    expect(viteConfig).toContain("registerType: 'autoUpdate'");
    expect(viteConfig).toContain("urlPattern: ({ url }) => url.pathname.startsWith('/api/')");
    expect(viteConfig).toContain("handler: 'NetworkFirst'");
    expect(viteConfig).toContain('networkTimeoutSeconds: 3');
    expect(viteConfig).toContain('maxAgeSeconds: 900');
  });

  it('exposes icon links from index.html and delegates manifest injection to VitePWA', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');

    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
    expect(html).toContain('rel="icon" type="image/svg+xml" href="/favicon.svg"');
    expect(html).toContain('rel="icon" type="image/x-icon" href="/favicon.ico"');

    // manifest.webmanifest は VitePWA がビルド時に自動注入するため index.html には含まれない
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf-8');
    expect(viteConfig).toContain('VitePWA(');
    expect(viteConfig).not.toContain('injectManifest');
  });

  it('keeps only the AdSense site verification loader in the document head', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
    const document = new DOMParser().parseFromString(html, 'text/html');
    const loaderSelector =
      'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8799329944122822"]';

    const [loader] = document.head.querySelectorAll(loaderSelector);

    expect(document.head.querySelectorAll(loaderSelector)).toHaveLength(1);
    expect(loader.hasAttribute('async')).toBe(true);
    expect(loader.getAttribute('crossorigin')).toBe('anonymous');
    expect(document.body.querySelectorAll(loaderSelector)).toHaveLength(0);
    expect(document.querySelectorAll('ins.adsbygoogle')).toHaveLength(0);
    expect(document.querySelectorAll('[data-ad-slot="2339683870"]')).toHaveLength(0);
    expect(
      Array.from(document.scripts).filter(
        (script) => !script.src && script.textContent?.includes('adsbygoogle'),
      ),
    ).toHaveLength(0);
    expect(html).not.toContain('rectangle-o-sumo');
  });

  it('verifies VitePWA injects manifest link into built index.html (post-build only)', () => {
    const distHtml = join(process.cwd(), 'dist/index.html');
    if (!existsSync(distHtml)) {
      // dist が存在しない場合（テストがビルド前に実行される CI 等）はスキップ
      return;
    }
    const html = readFileSync(distHtml, 'utf-8');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
  });
});
