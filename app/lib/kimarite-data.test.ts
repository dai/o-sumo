import { describe, it, expect } from 'vitest';
import {
  KIMARITE_LIST,
  CATEGORY_COUNTS,
  CATEGORY_ORDER,
  getKimariteByCategory,
  getKimariteById,
  type KimariteCategory,
} from './kimarite-data';

describe('KIMARITE_LIST', () => {
  it('contains exactly 82 techniques', () => {
    expect(KIMARITE_LIST).toHaveLength(82);
  });

  it('has unique ids', () => {
    const ids = KIMARITE_LIST.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has the required non-empty string fields', () => {
    for (const k of KIMARITE_LIST) {
      expect(k.id).toBeTruthy();
      expect(k.nameJa).toBeTruthy();
      expect(k.reading).toBeTruthy();
      expect(k.romaji).toBeTruthy();
      expect(k.english).toBeTruthy();
      expect(k.descriptionJa).toBeTruthy();
      expect(k.descriptionEn).toBeTruthy();
      expect(k.category).toBeTruthy();
    }
  });
});

describe('category breakdown', () => {
  it('matches the official 7/13/18/19/6/19 distribution', () => {
    expect(CATEGORY_COUNTS.kihon).toBe(7);
    expect(CATEGORY_COUNTS.nage).toBe(13);
    expect(CATEGORY_COUNTS.kake).toBe(18);
    expect(CATEGORY_COUNTS.hineri).toBe(19);
    expect(CATEGORY_COUNTS.sori).toBe(6);
    expect(CATEGORY_COUNTS.tokushu).toBe(19);
  });

  it('actual count per category matches the declared counts', () => {
    const grouped = getKimariteByCategory();
    for (const cat of CATEGORY_ORDER) {
      expect(grouped[cat]).toHaveLength(CATEGORY_COUNTS[cat]);
    }
  });
});

describe('helpers', () => {
  it('getKimariteById returns the matching entry', () => {
    expect(getKimariteById('yorikiri')?.nameJa).toBe('寄り切り');
  });

  it('getKimariteById returns undefined for unknown ids', () => {
    expect(getKimariteById('nope')).toBeUndefined();
  });

  it('getKimariteByCategory returns all 6 categories', () => {
    const grouped = getKimariteByCategory();
    const categories = Object.keys(grouped) as KimariteCategory[];
    expect(categories).toHaveLength(6);
  });
});