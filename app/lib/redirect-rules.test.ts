import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const redirectsPath = resolve(process.cwd(), 'public', '_redirects');
const SUPPORTED_MONTH_KEYS = ['202603', '202605', '202607'] as const;

interface RedirectRule {
  source: string;
  destination: string;
  status: number;
}

function redirectRules(): RedirectRule[] {
  return readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [source, destination, status] = line.split(/\s+/);
      return { source, destination, status: Number(status) };
    });
}

function matchRule(rule: RedirectRule, pathname: string): RedirectRule | undefined {
  const parameterNames: string[] = [];
  const pattern = rule.source
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_match, name: string) => {
      parameterNames.push(name);
      return '([^/]+)';
    })
    .replace(/\*/g, '.*');
  const match = pathname.match(new RegExp(`^${pattern}$`));
  if (!match) return undefined;

  const params = Object.fromEntries(parameterNames.map((name, index) => [name, match[index + 1]]));
  const destination = rule.destination.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_match, name: string) => params[name] ?? _match);
  return { ...rule, destination };
}

function evaluateRedirect(pathname: string): RedirectRule | undefined {
  return redirectRules().map((rule) => matchRule(rule, pathname)).find(Boolean);
}

describe('Cloudflare banzuke redirect rules', () => {
  it.each(SUPPORTED_MONTH_KEYS)('defines the complete canonical and compatibility behavior for %s', (monthKey) => {
    const canonicalPath = `/${monthKey}-banzuke/`;

    expect(evaluateRedirect(`/${monthKey}-banzuke`)).toEqual({
      source: `/${monthKey}-banzuke`,
      destination: canonicalPath,
      status: 301,
    });
    expect(evaluateRedirect(canonicalPath)).toEqual({
      source: canonicalPath,
      destination: '/',
      status: 200,
    });
    expect(evaluateRedirect(`/${monthKey}-banduke`)?.destination).toBe(canonicalPath);
    expect(evaluateRedirect(`/${monthKey}-banduke/`)?.destination).toBe(canonicalPath);
    expect(evaluateRedirect(`/${monthKey}-o-sumo`)?.destination).toBe(canonicalPath);
    expect(evaluateRedirect(`/${monthKey}-o-sumo/`)?.destination).toBe(canonicalPath);
    expect([
      `/${monthKey}-banduke`,
      `/${monthKey}-banduke/`,
      `/${monthKey}-o-sumo`,
      `/${monthKey}-o-sumo/`,
    ].map((path) => evaluateRedirect(path)?.status)).toEqual([301, 301, 301, 301]);
  });

  it.each(['/garbage-banduke', '/999999-banduke', '/999999-banzuke'])('keeps unsupported route %s unmatched', (pathname) => {
    expect(evaluateRedirect(pathname)).toBeUndefined();
  });

  it('does not invent a fragment in any banzuke redirect destination', () => {
    const banzukeRules = redirectRules().filter((rule) => rule.source.includes('banzuke') || rule.source.includes('banduke') || rule.source.includes('o-sumo'));

    expect(banzukeRules.length).toBe(18);
    expect(banzukeRules.every((rule) => !rule.destination.includes('#'))).toBe(true);
  });

  it('rewrites every SPA fallback to the root document', () => {
    const spaFallbacks = redirectRules().filter((rule) => rule.status === 200);

    expect(spaFallbacks).toHaveLength(10);
    expect(spaFallbacks.every((rule) => rule.destination === '/')).toBe(true);
  });
});
