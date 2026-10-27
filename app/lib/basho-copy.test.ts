import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

/**
 * 場所切替のたびに文言が 1 語ずつ古くなる事故を防ぐ。
 * ここで固定しているのは「特定の月を名指ししない」ことだけで、
 * 実際の月名は各バジューのデータから差し込まれる。
 */
const STALE_BASHO_TERMS = [
  '七月場所',
  '八月場所',
  '九月場所',
  '十月場所',
  '七月',
  '八月',
  '九月',
  'October',
  'July',
  'August',
  'September',
];

function collectBashoNamedStrings(value: unknown, path: string, out: Array<[string, string]>): void {
  if (typeof value === 'string') {
    out.push([path, value]);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectBashoNamedStrings(item, `${path}[${index}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      collectBashoNamedStrings(item, `${path}.${key}`, out);
    }
  }
}

describe('basho-named i18n copy', () => {
  it.each([
    ['ja', jaCommon],
    ['en', enCommon],
  ] as const)('has no stale basho name in %s common copy', (_lang, common) => {
    const entries: Array<[string, string]> = [];
    collectBashoNamedStrings(common, 'common', entries);

    const stale = entries.filter(([, text]) =>
      STALE_BASHO_TERMS.some((term) => text.includes(term)),
    );

    expect(stale.map(([path, text]) => `${path}: ${text}`)).toEqual([]);
  });

  it('keeps the analytics results copy independent of the current basho name', () => {
    expect(jaCommon.analytics.results.pendingDescription).toContain('今場所');
    expect(enCommon.analytics.results.pendingDescription).toContain('current basho');
  });
});
