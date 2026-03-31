import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('PWA smoke config', () => {
  it('keeps prompt-based update strategy and API-only runtime caching', () => {
    const viteConfig = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf-8');

    expect(viteConfig).toContain("registerType: 'prompt'");
    expect(viteConfig).toContain("urlPattern: ({ url }) => url.pathname.startsWith('/api/')");
    expect(viteConfig).toContain("handler: 'NetworkFirst'");
    expect(viteConfig).toContain('networkTimeoutSeconds: 3');
    expect(viteConfig).toContain('maxAgeSeconds: 900');
  });

  it('exposes manifest and icon links from index.html', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');

    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
    expect(html).toContain('rel="icon" type="image/svg+xml" href="/favicon.svg"');
    expect(html).toContain('rel="icon" type="image/x-icon" href="/favicon.ico"');
  });
});
