import { describe, expect, it } from 'vitest';
import { normalizeCanonicalPath, SITE_ORIGIN, toCanonicalUrl } from './site-url';

describe('site URL helpers', () => {
  it.each([
    ['/', '/'],
    ['/20260310-yotei', '/20260310-yotei/'],
    ['/20260310-yotei/', '/20260310-yotei/'],
    ['/20260310-yotei//', '/20260310-yotei/'],
    ['/20260310-yotei?view=compact#juryo', '/20260310-yotei/'],
  ])('normalizes %s to the canonical pathname %s', (input, expected) => {
    expect(normalizeCanonicalPath(input)).toBe(expected);
  });

  it('builds an absolute canonical URL on the production origin', () => {
    expect(SITE_ORIGIN).toBe('https://osada.us');
    expect(toCanonicalUrl('/20260310-yotei?view=compact#juryo')).toBe(
      'https://osada.us/20260310-yotei/',
    );
    expect(toCanonicalUrl('/')).toBe('https://osada.us/');
  });
});
