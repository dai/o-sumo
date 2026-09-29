import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, vi } from 'vitest';
import ArchivesPage from './page';

describe('ArchivesPage', () => {
  afterEach(() => vi.useRealTimers());

  it('includes the completed current basho first with all three archive links after the final day in JST', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-27T15:00:00Z'));
    render(<MemoryRouter><ArchivesPage /></MemoryRouter>);

    const entries = screen.getAllByRole('article');
    expect(within(entries[0]).getByRole('heading', { name: '令和八年 九月場所' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: '令和八年 九月場所' })).toHaveLength(1);
    expect(within(entries[0]).getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202609-banzuke/');
    expect(within(entries[0]).getByRole('link', { name: '取組結果' })).toHaveAttribute('href', '/202609-torikumi/');
    expect(within(entries[0]).getByRole('link', { name: '取組予定' })).toHaveAttribute('href', '/202609-yotei/');
  });

  it.each(['2026-09-12T12:00:00Z', '2026-09-27T14:59:59Z'])(
    'keeps only past basho entries before the current basho ends (%s)',
    (now) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(now));
      render(<MemoryRouter><ArchivesPage /></MemoryRouter>);

      expect(screen.queryByRole('heading', { name: '令和八年 九月場所' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('令和八年 七月場所');
    },
  );

  it('lists both May 2026 and March 2026 archive basho entries', () => {
    render(
      <MemoryRouter>
        <ArchivesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: '令和八年 五月場所' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '令和八年 三月場所' })).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links.find((link) => link.getAttribute('href') === '/202605-banzuke/')).toBeDefined();
    expect(links.find((link) => link.getAttribute('href') === '/202605-torikumi/')).toBeDefined();
    expect(links.find((link) => link.getAttribute('href') === '/202605-yotei/')).toBeDefined();
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
  });

  it('exposes a breadcrumb on the archives page back to home', () => {
    render(
      <MemoryRouter>
        <ArchivesPage />
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole('navigation', { name: 'パンくず' });
    expect(within(breadcrumb).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByText('アーカイブ')).toBeInTheDocument();
  });
});
