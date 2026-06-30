import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockNewsFeed = {
  updatedAt: '2026-06-30T00:00:00+09:00',
  sources: [
    {
      id: 'sumo-association',
      label: '日本相撲協会',
      ok: true,
      count: 2,
    },
  ],
  items: [
    {
      id: 'wrap-1',
      title: '七月場所に関するお知らせ',
      url: 'https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=1',
      publishedAt: '2026-06-30T00:00:00+09:00',
      publishedAtRaw: '令和八年七月一日',
      sourceId: 'sumo-association',
      sourceLabel: '日本相撲協会',
    },
    {
      id: 'wrap-2',
      title: '秋場所に関するお知らせ',
      url: 'https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=2',
      publishedAt: '2026-06-28T00:00:00+09:00',
      publishedAtRaw: '令和八年六月二十八日',
      sourceId: 'sumo-association',
      sourceLabel: '日本相撲協会',
    },
  ],
};

vi.mock('../lib/news-data', () => ({
  newsFeed: mockNewsFeed,
}));

describe('NewsSection', () => {
  beforeEach(() => {
    mockNewsFeed.items = [
      {
        id: 'wrap-1',
        title: '七月場所に関するお知らせ',
        url: 'https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=1',
        publishedAt: '2026-06-30T00:00:00+09:00',
        publishedAtRaw: '令和八年七月一日',
        sourceId: 'sumo-association',
        sourceLabel: '日本相撲協会',
      },
    ];
  });

  afterEach(() => {
    mockNewsFeed.items = [];
  });

  it('renders the see-all link to the association announcements page', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    render(<NewsSection />);

    const seeAll = screen.getByRole('link', { name: 'もっと見る' });
    expect(seeAll).toHaveAttribute('href', 'https://www.sumo.or.jp/IrohaKyokaiInformation/wrap/');
    expect(seeAll).toHaveAttribute('target', '_blank');
    expect(seeAll).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides the see-all link when the feed is empty', async () => {
    mockNewsFeed.items = [];
    const { default: NewsSection } = await import('./NewsSection');
    const { container } = render(<NewsSection />);

    expect(container.querySelector('.news-section-see-all')).not.toBeInTheDocument();
    expect(container.querySelector('.news-empty')).toBeInTheDocument();
  });

  it('renders one entry per news item with localized date and source labels', async () => {
    mockNewsFeed.items = [
      {
        id: 'wrap-1',
        title: '七月場所に関するお知らせ',
        url: 'https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=1',
        publishedAt: '2026-06-30T00:00:00+09:00',
        publishedAtRaw: '令和八年七月一日',
        sourceId: 'sumo-association',
        sourceLabel: '日本相撲協会',
      },
      {
        id: 'wrap-2',
        title: '秋場所に関するお知らせ',
        url: 'https://www.sumo.or.jp/IrohaKyokaiInformation/detail?id=2',
        publishedAt: '2026-06-28T00:00:00+09:00',
        publishedAtRaw: '令和八年六月二十八日',
        sourceId: 'sumo-association',
        sourceLabel: '日本相撲協会',
      },
    ];
    const { default: NewsSection } = await import('./NewsSection');
    render(<NewsSection />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(screen.getByText('七月場所に関するお知らせ')).toBeInTheDocument();
    expect(screen.getByText('秋場所に関するお知らせ')).toBeInTheDocument();
    expect(screen.getAllByText('日本相撲協会')).toHaveLength(2);
  });
});
