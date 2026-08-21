import { afterEach, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const globalStyles = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

const mountedStyles: HTMLStyleElement[] = [];

function mountGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.append(style);
  mountedStyles.push(style);
}

afterEach(() => {
  mountedStyles.splice(0).forEach((style) => style.remove());
  document.body.replaceChildren();
});

describe('global typography', () => {
  test('renders Japanese and alphanumeric text with the approved font pairing', () => {
    mountGlobalStyles();
    document.body.innerHTML = `
      <main>
        <h1>令和八年 September 2026</h1>
        <p>九月場所 12-3</p>
      </main>
    `;

    const heading = document.querySelector('h1');
    const paragraph = document.querySelector('p');

    expect(heading).not.toBeNull();
    expect(paragraph).not.toBeNull();
    const rootStyles = getComputedStyle(document.documentElement);

    for (const role of ['--font-serif', '--font-sans']) {
      const fontFamily = rootStyles.getPropertyValue(role);
      expect(fontFamily).toContain('Source Serif 4');
      expect(fontFamily).toContain('Shippori Mincho');
      expect(fontFamily.indexOf('Source Serif 4')).toBeLessThan(
        fontFamily.indexOf('Shippori Mincho'),
      );
    }
  });
});
