import { describe, expect, it } from 'vitest';
import { getBashoResults } from './basho-results';

describe('basho-results', () => {
  it('returns pending results for current September 2026 basho', () => {
    const results = getBashoResults('202609');
    expect(results).not.toBeNull();
    expect(results?.status).toBe('pending');
    expect(results?.bashoName).toBe('令和八年九月場所');
  });

  it('returns announced results for July 2026 basho with championship and sansho', () => {
    const results = getBashoResults('202607');
    expect(results).not.toBeNull();
    expect(results?.status).toBe('announced');
    expect(results?.winners.length).toBeGreaterThan(0);
    const makuuchiYusho = results?.winners.find((w) => w.category === 'makuuchiYusho');
    expect(makuuchiYusho?.rikishi).toBe('安青錦');
  });

  it('returns null for unknown basho id', () => {
    expect(getBashoResults('199999')).toBeNull();
  });
});
