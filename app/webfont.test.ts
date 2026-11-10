import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectDisplayedCharacters, isRequiredWebfontCharacter } from './lib/webfont-charset';

const repoRoot = process.cwd();

function readCodepoints(path: string): Set<string> {
  return new Set(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  );
}

describe('self-hosted webfonts', () => {
  it('drops the render-blocking Google Fonts import and swaps in subset files', () => {
    const css = readFileSync(join(repoRoot, 'app/globals.css'), 'utf8');

    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).not.toContain('fonts.gstatic.com');
    expect(css).not.toContain('@import');
    expect(css).toContain("font-family: 'Source Serif 4'");
    expect(css).toContain('font-weight: 400 800');
    expect(css).toContain("url('/fonts/source-serif-4.woff2')");

    for (const weight of [400, 500, 600, 700, 800]) {
      const block = css.slice(css.indexOf(`font-weight: ${weight};`));
      expect(block.startsWith(`font-weight: ${weight};`), `missing Shippori weight ${weight}`).toBe(true);
      expect(block).toContain('font-display: swap;');
      expect(block).toContain(`url('/fonts/shippori-mincho-${weight}.woff2')`);
      const file = readFileSync(join(repoRoot, `public/fonts/shippori-mincho-${weight}.woff2`));
      expect(file.byteLength).toBeGreaterThan(10_000);
    }

    const sourceSerif = readFileSync(join(repoRoot, 'public/fonts/source-serif-4.woff2'));
    expect(sourceSerif.byteLength).toBeGreaterThan(10_000);
    expect(css.match(/font-display:\s*swap/g)?.length).toBe(6);
  });

  it('preloads the critical faces and leaves the analytics snippet in place', () => {
    const html = readFileSync(join(repoRoot, 'index.html'), 'utf8');

    for (const href of [
      '/fonts/source-serif-4.woff2',
      '/fonts/shippori-mincho-400.woff2',
      '/fonts/shippori-mincho-700.woff2',
      '/fonts/shippori-mincho-800.woff2',
    ]) {
      expect(html).toContain(
        `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`,
      );
    }

    expect(html).toContain(`<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-MK6YQ7YP77"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-MK6YQ7YP77');
    </script>`);
  });

  it('covers every displayed character the upstream fonts can draw', () => {
    const coverage = readCodepoints(join(repoRoot, 'scripts/fonts/coverage.txt'));
    const unsupported = readCodepoints(join(repoRoot, 'scripts/fonts/unsupported.txt'));
    const missing: string[] = [];

    for (const character of collectDisplayedCharacters(repoRoot)) {
      if (!isRequiredWebfontCharacter(character)) continue;
      const code = (character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');
      if (!coverage.has(code) && !unsupported.has(code)) missing.push(`U+${code}`);
    }

    expect(
      missing,
      `${missing.join(', ')} are missing from the webfont subset. Regenerate it with: npm run fonts:subset`,
    ).toEqual([]);
  });
});
