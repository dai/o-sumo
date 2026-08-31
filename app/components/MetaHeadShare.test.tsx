import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MetaHead, { usePageMetaOverride } from './MetaHead';

afterEach(() => {
  cleanup();
  document.title = '';
  document.head.querySelectorAll('meta[property="og:title"], meta[property="og:url"], meta[name="twitter:title"]').forEach((element) => element.remove());
});

function ComparisonMetadata() {
  usePageMetaOverride({
    pathname: '/compare/',
    title: '豊昇龍と大の里の比較 | o-sumo',
    description: '大相撲力士豊昇龍と大の里の合口、体格、得意決まり手、通算成績を比較できます。',
    socialUrl: 'https://osada.us/compare/?ids=3842,4227',
  });
  return null;
}

describe('MetaHead share overrides', () => {
  it('keeps the pair-specific URL in og:url', async () => {
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <MetaHead><ComparisonMetadata /></MetaHead>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('豊昇龍と大の里の比較 | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe('https://osada.us/compare/?ids=3842,4227');
      expect(document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content).toBe('豊昇龍と大の里の比較 | o-sumo');
    });
  });
});
