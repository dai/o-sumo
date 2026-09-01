import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../lib/i18n';

interface MockBlogFeedItem {
  slug: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  author: 'dai';
}

const mockBlogFeed: { updatedAt: string; items: MockBlogFeedItem[] } = {
  updatedAt: '2026-09-01',
  items: [],
};

vi.mock('../lib/blog-data', () => ({
  blogFeed: mockBlogFeed,
}));

function blogItem(day: number): MockBlogFeedItem {
  const date = `2026-09-${String(day).padStart(2, '0')}`;
  return {
    slug: `story-${day}`,
    title: `記事 ${day}`,
    description: `記事 ${day} の説明`,
    url: `https://blog.osada.us/posts/story-${day}/`,
    publishedAt: date,
    author: 'dai',
  };
}

beforeEach(async () => {
  mockBlogFeed.items = [];
  await act(() => i18n.changeLanguage('ja'));
});

afterEach(async () => {
  mockBlogFeed.items = [];
  await act(() => i18n.changeLanguage('ja'));
});

describe('BlogUpdatesSection', () => {
  it('does not render a section when the public feed is empty', async () => {
    const { default: BlogUpdatesSection } = await import('./BlogUpdatesSection');
    const { container } = render(<BlogUpdatesSection />);

    expect(container.querySelector('.blog-updates-section')).not.toBeInTheDocument();
  });

  it('renders an item with its ISO date, Japanese title, and same-tab public URL', async () => {
    mockBlogFeed.items = [blogItem(1)];
    const { default: BlogUpdatesSection } = await import('./BlogUpdatesSection');
    render(<BlogUpdatesSection />);

    const articleLink = screen.getByRole('link', { name: '記事 1' });
    expect(articleLink).toHaveAttribute('href', 'https://blog.osada.us/posts/story-1/');
    expect(articleLink).not.toHaveAttribute('target');
    expect(screen.getByText('2026-09-01')).toHaveAttribute('dateTime', '2026-09-01');
    expect(articleLink).toHaveAttribute('lang', 'ja');
    expect(screen.queryByText('記事 1 の説明')).not.toBeInTheDocument();
    expect(screen.queryByText('dai')).not.toBeInTheDocument();
  });

  it('limits an unsorted public feed to the nine newest published stories', async () => {
    mockBlogFeed.items = [3, 11, 1, 9, 12, 2, 10, 4, 8, 6, 7, 5].map(blogItem);
    const { default: BlogUpdatesSection } = await import('./BlogUpdatesSection');
    render(<BlogUpdatesSection />);

    const list = screen.getByRole('list', { name: '読みもの' });
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems).toHaveLength(9);
    expect(listItems.map((item) => item.textContent)).toEqual([
      '2026-09-12記事 12',
      '2026-09-11記事 11',
      '2026-09-10記事 10',
      '2026-09-09記事 9',
      '2026-09-08記事 8',
      '2026-09-07記事 7',
      '2026-09-06記事 6',
      '2026-09-05記事 5',
      '2026-09-04記事 4',
    ]);
  });

  it('links to all stories in the same tab', async () => {
    mockBlogFeed.items = [blogItem(1)];
    const { default: BlogUpdatesSection } = await import('./BlogUpdatesSection');
    render(<BlogUpdatesSection />);

    const allStoriesLink = screen.getByRole('link', { name: 'すべての記事' });
    expect(allStoriesLink).toHaveAttribute('href', 'https://blog.osada.us/');
    expect(allStoriesLink).not.toHaveAttribute('target');
  });

  it('uses the English heading and all-stories label when English is selected', async () => {
    mockBlogFeed.items = [blogItem(1)];
    await act(() => i18n.changeLanguage('en'));
    const { default: BlogUpdatesSection } = await import('./BlogUpdatesSection');
    render(<BlogUpdatesSection />);

    expect(screen.getByRole('heading', { level: 2, name: 'Stories' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All stories' })).toHaveAttribute('href', 'https://blog.osada.us/');
  });
});
