import { describe, expect, it } from 'vitest';
import { matchesSearch, normalizeSearchText } from './search';

describe('directory search normalization', () => {
  it('normalizes katakana, spaces, and letter case', () => {
    expect(normalizeSearchText(' ショウダイ ')).toBe('しょうだい');
    expect(normalizeSearchText('OONOSATO')).toBe('oonosato');
  });

  it('matches a query against any searchable representation', () => {
    expect(matchesSearch('しょうだい', '正代', 'ショウダイ', 'Shoudai')).toBe(true);
    expect(matchesSearch('SHOUDAI', '正代', 'しょうだい', 'Shoudai')).toBe(true);
    expect(matchesSearch('照ノ富士', '正代', 'しょうだい', 'Shoudai')).toBe(false);
  });
});
