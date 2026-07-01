import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface MockNewsItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  publishedAtRaw?: string;
  sourceId: string;
  sourceLabel: string;
}

interface MockNewsFeed {
  updatedAt: string;
  sources: Array<{ id: string; label: string; ok: boolean; count?: number }>;
  items: MockNewsItem[];
}

const mockNewsFeed: MockNewsFeed = {
  updatedAt: '2026-06-30T00:00:00+09:00',
  sources: [
    { id: 'sumo-association', label: '日本相撲協会', ok: true, count: 2 },
    { id: 'dmenu-docomo', label: 'dmenuスポーツ', ok: true, count: 2 },
  ],
  items: [],
};

vi.mock('../lib/news-data', () => ({
  newsFeed: mockNewsFeed,
}));

const ASSOCIATION_ITEMS: MockNewsItem[] = [
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

const DMENU_ITEMS: MockNewsItem[] = [
  {
    id: 'docomo-1',
    title: '義ノ富士が新小結',
    url: 'https://topics.smt.docomo.ne.jp/article/nikkansports/sports/sample',
    publishedAt: '2026-06-30T09:00:00+09:00',
    publishedAtRaw: '日刊スポーツ　6月30日 9時00分',
    sourceId: 'dmenu-docomo',
    sourceLabel: 'dmenuスポーツ',
  },
  {
    id: 'docomo-2',
    title: '若隆景が関脇復帰',
    url: 'https://topics.smt.docomo.ne.jp/article/hochi/sports/sample-2',
    publishedAt: '2026-06-30T08:00:00+09:00',
    publishedAtRaw: 'スポーツ報知　6月30日 8時00分',
    sourceId: 'dmenu-docomo',
    sourceLabel: 'dmenuスポーツ',
  },
];

describe('NewsSection', () => {
  beforeEach(() => {
    mockNewsFeed.items = [...ASSOCIATION_ITEMS, ...DMENU_ITEMS];
  });

  afterEach(() => {
    mockNewsFeed.items = [];
  });

  it('renders both subsection headings', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    render(<NewsSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: '最新ニュース' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: '相撲協会' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: '相撲界ニュース' }),
    ).toBeInTheDocument();
  });

  it('groups items by source into separate lists', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    const { container } = render(<NewsSection />);

    const subsections = container.querySelectorAll('.news-subsection');
    expect(subsections).toHaveLength(2);

    const associationList = screen.getByRole('list', { name: /相撲協会/ });
    expect(within(associationList).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(associationList).getByText('七月場所に関するお知らせ'),
    ).toBeInTheDocument();
    expect(
      within(associationList).getByText('秋場所に関するお知らせ'),
    ).toBeInTheDocument();

    const sumoNewsList = screen.getByRole('list', { name: /相撲界ニュース/ });
    expect(within(sumoNewsList).getAllByRole('listitem')).toHaveLength(2);
    expect(within(sumoNewsList).getByText('義ノ富士が新小結')).toBeInTheDocument();
    expect(within(sumoNewsList).getByText('若隆景が関脇復帰')).toBeInTheDocument();

    expect(within(associationList).queryByText('義ノ富士が新小結')).not.toBeInTheDocument();
    expect(within(sumoNewsList).queryByText('七月場所に関するお知らせ')).not.toBeInTheDocument();
  });

  it('links the association see-all to the JSA wrap page', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    render(<NewsSection />);

    const seeAll = screen.getByRole('link', { name: 'もっと見る' });
    expect(seeAll).toHaveAttribute('href', 'https://www.sumo.or.jp/IrohaKyokaiInformation/wrap/');
    expect(seeAll).toHaveAttribute('target', '_blank');
    expect(seeAll).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links the dmenu see-all to the dmenu news index', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    render(<NewsSection />);

    const seeAll = screen.getByRole('link', { name: 'dmenu で見る' });
    expect(seeAll).toHaveAttribute('href', 'https://sumo.sports.smt.docomo.ne.jp/news/');
    expect(seeAll).toHaveAttribute('target', '_blank');
    expect(seeAll).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides the see-all link for an empty subsection', async () => {
    mockNewsFeed.items = [...DMENU_ITEMS];
    const { default: NewsSection } = await import('./NewsSection');
    const { container } = render(<NewsSection />);

    const subsections = container.querySelectorAll('.news-subsection');
    expect(subsections).toHaveLength(2);

    const associationSubsection = subsections[0] as HTMLElement;
    expect(
      within(associationSubsection).queryByRole('link', { name: 'もっと見る' }),
    ).not.toBeInTheDocument();
    expect(
      within(associationSubsection).getByRole('status'),
    ).toHaveTextContent('新しいニュースはありません');

    const sumoNewsSubsection = subsections[1] as HTMLElement;
    expect(
      within(sumoNewsSubsection).getByRole('link', { name: 'dmenu で見る' }),
    ).toBeInTheDocument();
  });

  it('shows the empty state in both subsections when the feed is empty', async () => {
    mockNewsFeed.items = [];
    const { default: NewsSection } = await import('./NewsSection');
    const { container } = render(<NewsSection />);

    const subsections = container.querySelectorAll('.news-subsection');
    expect(subsections).toHaveLength(2);

    expect(
      within(subsections[0] as HTMLElement).getByRole('status'),
    ).toHaveTextContent('新しいニュースはありません');
    expect(
      within(subsections[1] as HTMLElement).getByRole('status'),
    ).toHaveTextContent('新しいニュースはありません');

    expect(container.querySelectorAll('.news-subsection-see-all')).toHaveLength(0);
  });

  it('renders each entry with date and title only (no per-item source label)', async () => {
    const { default: NewsSection } = await import('./NewsSection');
    const { container } = render(<NewsSection />);

    expect(container.querySelectorAll('.news-item-source')).toHaveLength(0);
  });
});