import { describe, expect, it } from 'vitest';
import {
  MY_RIKISHI_MAX_COUNT,
  changeMyRikishi,
  normalizeMyRikishiIds,
  parseMyRikishiIds,
} from './my-rikishi';

describe('my rikishi storage helpers', () => {
  it('normalizes saved ids and discards invalid or duplicate values', () => {
    expect(normalizeMyRikishiIds([1, 2, 2, 0, -1, '3', 4.5])).toEqual([1, 2]);
  });

  it('recovers safely from invalid persisted JSON', () => {
    expect(parseMyRikishiIds('{invalid')).toEqual([]);
    expect(parseMyRikishiIds('[1,2,2]')).toEqual([1, 2]);
  });

  it('adds, removes, and caps saved rikishi', () => {
    expect(changeMyRikishi([1], 2)).toEqual({ ids: [1, 2], action: 'added' });
    expect(changeMyRikishi([1, 2], 2)).toEqual({ ids: [1], action: 'removed' });
    const atLimit = Array.from({ length: MY_RIKISHI_MAX_COUNT }, (_, index) => index + 1);
    expect(changeMyRikishi(atLimit, 99)).toEqual({ ids: atLimit, action: 'limit' });
  });
});
