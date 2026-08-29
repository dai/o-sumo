import { describe, expect, it } from 'vitest';
import { formatBashoTitle, getFinalBashoName } from './basho-meta';

describe('formatBashoTitle', () => {
  it('renders the Japanese title as `<year><bashoName>`', () => {
    expect(formatBashoTitle({ year: '令和八年', bashoName: '七月場所' }, 'ja')).toBe('令和八年七月場所');
  });

  it('renders the English title from monthKey when available', () => {
    expect(formatBashoTitle({ year: '令和八年', bashoName: '七月場所', monthKey: '202607' }, 'en'))
      .toBe('July 2026 Tournament');
  });
});

describe('getFinalBashoName', () => {
  it('returns the Japanese bashoName as-is', () => {
    expect(getFinalBashoName({ bashoName: '七月場所', monthKey: '202607' }, 'ja')).toBe('七月場所');
    expect(getFinalBashoName({ bashoName: '九月場所', monthKey: '202609' }, 'ja')).toBe('九月場所');
  });

  it('maps the bashoName to the English month name via monthKey', () => {
    expect(getFinalBashoName({ bashoName: '七月場所', monthKey: '202607' }, 'en')).toBe('July');
    expect(getFinalBashoName({ bashoName: '九月場所', monthKey: '202609' }, 'en')).toBe('September');
  });

  it('derives the English month name from monthKey even without bashoName', () => {
    expect(getFinalBashoName({ monthKey: '202611' }, 'en')).toBe('November');
  });

  it('falls back to bashoName when the month is not registered in the English table', () => {
    expect(getFinalBashoName({ bashoName: '不明場所', monthKey: '202699' }, 'en')).toBe('不明場所');
  });

  it('returns an empty string when no info is provided', () => {
    expect(getFinalBashoName({}, 'ja')).toBe('');
    expect(getFinalBashoName({}, 'en')).toBe('');
  });
});