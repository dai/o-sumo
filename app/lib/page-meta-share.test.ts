import { expect, it } from 'vitest';
import { resolvePageMeta } from './page-meta';

it('uses a comparison fallback instead of the home metadata', () => {
  expect(resolvePageMeta('/compare/')).toMatchObject({
    title: '力士比較 | o-sumo',
    description: '幕内・十両力士の合口、体格、得意決まり手、通算成績を比較できます。',
    canonicalUrl: 'https://osada.us/compare/',
  });
});
