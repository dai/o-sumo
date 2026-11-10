import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PRECACHE_BYTE_LIMIT = 3 * 1024 * 1024;

function precacheUrls(serviceWorkerSource: string): string[] {
  const marker = 'precacheAndRoute(';
  const start = serviceWorkerSource.indexOf(marker);
  if (start < 0) {
    throw new Error('precacheAndRoute( was not found in service worker source');
  }

  const arrayStart = serviceWorkerSource.indexOf('[', start);
  if (arrayStart < 0) {
    throw new Error('precache manifest array was not found');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let quote = '';
  for (let index = arrayStart; index < serviceWorkerSource.length; index += 1) {
    const char = serviceWorkerSource[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        const body = serviceWorkerSource.slice(arrayStart, index + 1);
        return [...body.matchAll(/url\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
      }
    }
  }

  throw new Error('precache manifest array was not closed');
}

describe('PWA smoke config', () => {
  it('keeps the custom 404 page under source control', () => {
    const notFoundHtml = join(process.cwd(), 'public/404.html');

    expect(existsSync(notFoundHtml)).toBe(true);
    const html = readFileSync(notFoundHtml, 'utf-8');
    expect(html).toContain('<title>404 - ページが見つかりません</title>');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });

  it('rewrites the analytics route to its trailing-slash form (200, not 301)', () => {
    const redirects = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf-8');

    expect(redirects).toContain('/analytics /analytics/ 200');
    expect(redirects).toContain('/analytics/ / 200');
  });

  it('rewrites the kimarite route to its trailing-slash form (200, not 301)', () => {
    const redirects = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf-8');

    expect(redirects).toContain('/kimarite /kimarite/ 200');
    expect(redirects).toContain('/kimarite/ / 200');
  });

  it('rewrites the November 2026 banzuke routes to the SPA', () => {
    const redirects = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf-8');

    expect(redirects).toContain('/202611-banzuke /202611-banzuke/ 200');
    expect(redirects).toContain('/202611-banzuke/ / 200');
    expect(redirects).toContain('/202611-banduke /202611-banzuke/ 200');
    expect(redirects).toContain('/202611-banduke/ /202611-banzuke/ 200');
    expect(redirects).toContain('/202611-o-sumo /202611-banzuke/ 200');
    expect(redirects).toContain('/202611-o-sumo/ /202611-banzuke/ 200');
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
            { href: 'https://osada.us/api/v1/rikishi-matchups.json' },
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

  it('declares UTF-8 for public API JSON responses', () => {
    const headers = readFileSync(join(process.cwd(), 'public/_headers'), 'utf-8');

    expect(headers).toContain('/api/v1/*.json\n  Content-Type: application/json; charset=utf-8');
  });

  it('keeps auto-update strategy and public API runtime caching', () => {
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf-8');

    expect(viteConfig).toContain("registerType: 'autoUpdate'");
    expect(viteConfig).toContain('navigateFallbackDenylist: [');
    expect(viteConfig).toContain('/^\\/api\\//');
    expect(viteConfig).toContain('/^\\/agents(?:\\/|$)/');
    expect(viteConfig).toContain('/^\\/mcp(?:\\/|$)/');
    expect(viteConfig).toContain('/^\\/auth\\.md$/');
    expect(viteConfig).toContain('/^\\/\\.well-known\\//');
    expect(viteConfig).toContain('urlPattern: ({ url }) => shouldCachePublicApi(url)');
    expect(viteConfig).toContain("handler: 'NetworkFirst'");
    expect(viteConfig).toContain('networkTimeoutSeconds: 3');
    expect(viteConfig).toContain('maxAgeSeconds: 900');
  });

  it('reads precache urls out of a workbox manifest', () => {
    const source = `precacheAndRoute([{url:"images/rikishi/1.png",revision:"abc"},{url:'index.html',revision:null}], {});`;

    expect(precacheUrls(source)).toEqual(['images/rikishi/1.png', 'index.html']);
  });

  it('excludes heavy images from precache and caches rikishi portraits at runtime', () => {
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf-8');

    expect(viteConfig).toContain("globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']");
    expect(viteConfig).toContain('globIgnores: [');
    expect(viteConfig).toContain("'images/rikishi/**'");
    expect(viteConfig).toContain("'images/matchups/**'");
    expect(viteConfig).toContain("'images/og-*'");
    expect(viteConfig).toContain("'images/twitter-header.png'");
    expect(viteConfig).toContain("'fonts/**'");
    expect(viteConfig).toContain('/^\\/images\\/rikishi\\/\\d+(?:-\\d+)?\\.(?:png|jpe?g|webp|avif|svg)$/i');
    expect(viteConfig).toContain("handler: 'CacheFirst'");
    expect(viteConfig).toContain("cacheName: 'rikishi-images'");
    expect(viteConfig).toContain('maxEntries: 200');
    expect(viteConfig).toContain('maxAgeSeconds: 60 * 60 * 24 * 30');
  });

  it('keeps the built precache free of rikishi images and under 3MB (post-build only)', () => {
    const swPath = join(process.cwd(), 'dist/sw.js');
    if (!existsSync(swPath)) {
      // dist が存在しない場合（テストがビルド前に実行される CI 等）はスキップ
      return;
    }

    const serviceWorker = readFileSync(swPath, 'utf-8');
    const urls = precacheUrls(serviceWorker);
    const totalBytes = urls.reduce((sum, url) => {
      const relativeUrl = url.replace(/^\//, '');
      return sum + statSync(join(process.cwd(), 'dist', relativeUrl)).size;
    }, 0);

    expect(serviceWorker).not.toContain('shouldCacheRikishiImage');
    expect(serviceWorker).toContain('webp|avif');
    expect(serviceWorker).not.toContain('images/rikishi');
    expect(urls.some((url) => url.includes('images/rikishi/'))).toBe(false);
    expect(urls.some((url) => url.includes('images/matchups/'))).toBe(false);
    expect(urls.some((url) => url.startsWith('images/og-'))).toBe(false);
    expect(urls).not.toContain('images/twitter-header.png');
    expect(urls.some((url) => url.startsWith('fonts/'))).toBe(false);
    expect(totalBytes).toBeLessThan(PRECACHE_BYTE_LIMIT);
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

  it('does not include any Google AdSense loader in index.html', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
    const document = new DOMParser().parseFromString(html, 'text/html');
    const loaderSelector =
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

    expect(document.querySelectorAll(loaderSelector)).toHaveLength(0);
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
