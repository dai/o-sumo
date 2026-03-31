import { existsSync, readFileSync } from 'node:fs';
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
