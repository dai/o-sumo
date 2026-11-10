import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync('app/globals.css', 'utf8');
const themeToggleCss = readFileSync('app/components/theme-toggle.css', 'utf8');
const indexCss = readFileSync('app/index.css', 'utf8');

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue));
}

function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  const [lighter, darker] = first > second ? [first, second] : [second, first];
  return (lighter + 0.05) / (darker + 0.05);
}

function rootColors(css: string): Map<string, string> {
  const block = css.match(/:root,\s*\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/);
  const colors = new Map<string, string>();
  if (!block) return colors;
  for (const match of block[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    colors.set(`--${match[1]}`, match[2]);
  }
  return colors;
}

function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}[^{]*\\{([^}]*)\\}`));
  if (!match) throw new Error(`missing selector ${selector}`);
  return match[1];
}

function declaredColor(body: string, property: string, tokens: Map<string, string>): string {
  const match = body.match(new RegExp(`${property}\\s*:\\s*([^;]+)`));
  if (!match) throw new Error(`missing ${property}`);
  const value = match[1].trim();
  const variable = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (!variable) {
    const hex = value.match(/#[0-9a-fA-F]{6}/);
    if (!hex) throw new Error(`unresolved ${property}: ${value}`);
    return hex[0];
  }
  const resolved = tokens.get(variable[1]);
  if (!resolved) throw new Error(`unresolved token ${variable[1]}`);
  return resolved;
}

describe('visible text contrast', () => {
  it('keeps the active language control at least 4.5:1 in the light theme', () => {
    const tokens = rootColors(globalsCss);
    const active = ruleBody(themeToggleCss, '.language-toggle-btn.is-active');
    const ratio = contrast(
      declaredColor(active, 'color', tokens),
      declaredColor(active, 'background', tokens),
    );

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps editorial highlight red at least 4.5:1 on both paper surfaces', () => {
    const block = indexCss.match(/\.home-editorial\s*\{([^}]*)\}/);
    if (!block) throw new Error('missing .home-editorial tokens');
    const paper = block[1].match(/--home-paper:\s*(#[0-9a-fA-F]{6})/)?.[1];
    const paperDeep = block[1].match(/--home-paper-deep:\s*(#[0-9a-fA-F]{6})/)?.[1];
    const red = block[1].match(/--home-red:\s*(#[0-9a-fA-F]{6})/)?.[1];
    if (!paper || !paperDeep || !red) throw new Error('missing editorial color tokens');

    expect(contrast(red, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(red, paperDeep)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#fffaf2', red)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps banzuke footer links and draw marks at least 4.5:1', () => {
    const css = readFileSync('app/styles/banzuke.css', 'utf8');
    const tokens = rootColors(globalsCss);
    const footer = ruleBody(css, '.page-container .page-footer a');
    const anchors = ruleBody(css, '.banzuke-discovery .directory-anchors a');
    const draw = ruleBody(css, '.hoshi.draw');
    const footerSurface = tokens.get('--surface-container-high');
    const drawSurface = declaredColor(draw, 'background', tokens);
    if (!footerSurface) throw new Error('missing footer surface');

    expect(contrast(declaredColor(footer, 'color', tokens), footerSurface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(declaredColor(anchors, 'color', tokens), footerSurface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(declaredColor(draw, 'color', tokens), drawSurface)).toBeGreaterThanOrEqual(4.5);
  });
});
