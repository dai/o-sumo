import { describe, expect, it } from 'vitest';
import { normalizeCompareIds } from './CompareRikishiPage';

describe('normalizeCompareIds', () => {
  it('accepts up to three unique positive integer ids', () => {
    expect(normalizeCompareIds('1,2,2,3,4,invalid,0')).toEqual([1, 2, 3]);
  });

  it('returns an empty selection for missing ids', () => {
    expect(normalizeCompareIds(null)).toEqual([]);
  });
});
