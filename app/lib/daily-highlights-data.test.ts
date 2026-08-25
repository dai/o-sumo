import { describe, expect, it } from 'vitest';
import {
  findRikishiById,
  findRikishiByName,
  enrichFeaturedMatchup,
  getDailyHighlights,
  getHeadToHeadRecord,
  DAILY_HIGHLIGHTS_REGISTRY,
} from './daily-highlights-data';

describe('daily-highlights-data', () => {
  it('finds rikishi by id and name', () => {
    const hoshoryu = findRikishiById(3842);
    expect(hoshoryu).toBeDefined();
    expect(hoshoryu?.name).toBe('豊昇龍');

    const onosato = findRikishiByName('大の里');
    expect(onosato).toBeDefined();
    expect(onosato?.id).toBe(4227);
  });

  it('retrieves head-to-head records accurately', () => {
    const record = getHeadToHeadRecord(3842, 4227);
    expect(record).toEqual([5, 3]);

    const reverseRecord = getHeadToHeadRecord(4227, 3842);
    expect(reverseRecord).toEqual([3, 5]);

    const unknownRecord = getHeadToHeadRecord(999998, 999999);
    expect(unknownRecord).toEqual([0, 0]);
  });

  it('enriches featured matchups with rikishi data and aikuchi stats', () => {
    const featured = DAILY_HIGHLIGHTS_REGISTRY[0].featured[0];
    const enriched = enrichFeaturedMatchup(featured);

    expect(enriched).not.toBeNull();
    expect(enriched?.east.name).toBe('豊昇龍');
    expect(enriched?.west.name).toBe('大の里');
    expect(enriched?.aikuchi.winsA).toBe(5);
    expect(enriched?.aikuchi.winsB).toBe(3);
    expect(enriched?.aikuchi.diff).toBe(2);
    expect(enriched?.aikuchi.leader).toBe(0);
    expect(enriched?.compareHref).toBe('/compare/?ids=3842,4227');
  });

  it('resolves daily highlights from the registry', () => {
    const highlights = getDailyHighlights({ monthKey: '202609', day: 1 });
    expect(highlights.matchups.length).toBeGreaterThanOrEqual(1);
    expect(highlights.dateTextJa).toContain('九月場所');
    expect(highlights.isFallback).toBe(false);
  });

  it('falls back gracefully when given an unlisted day or monthKey', () => {
    const fallbackHighlights = getDailyHighlights({ monthKey: '202699', day: 99 });
    expect(fallbackHighlights.matchups.length).toBeGreaterThanOrEqual(1);
    expect(fallbackHighlights.isFallback).toBe(true);
  });
});
