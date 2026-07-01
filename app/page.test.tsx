import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  MARCH2026_BANDUKE_PATH,
  MAY2026_BANDUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';
import { MARCH2026_TORIKUMI_DATA } from './lib/march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from './lib/may2026-data';
import { torikumiArchive } from './lib/torikumi-data';
import Home from './page';

// The home page reads the news feed from the committed `public/api/v1/news.json`,
// which is rewritten by the daily-data-update workflow. Stub it here so the test
// stays stable regardless of what the CI has most recently written.
vi.mock('./lib/news-data', () => ({
  newsFeed: {
    updatedAt: '2026-06-30T00:00:00+09:00',
    sources: [],
    items: [],
  },
}));

describe('Home page', () => {
  it('shows the main navigation links and footer-only contact links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Get all links
    const allLinks = screen.getAllByRole('link');

    const banzukeLink = allLinks.find((l) => l.getAttribute('href') === '/202607-banduke/');
    const yoteiLink = allLinks.find((l) => l.getAttribute('href') === '/202607-yotei/');
    const kekkaLink = allLinks.find((l) => l.getAttribute('href') === '/202607-torikumi/');
    const currentHeroTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
    const mayBanzukeLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_BANDUKE_PATH}/`);
    const mayYoteiLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_SCHEDULE_PATH}/`);
    const mayTorikumiLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_RESULT_PATH}/`);
    const firstMayDay = MAY2026_TORIKUMI_DATA.resultDays?.[0];

    expect(screen.getByRole('heading', { level: 2, name: currentHeroTitle })).toBeInTheDocument();
    expect(banzukeLink).toHaveAttribute('href', '/202607-banduke/');
    expect(yoteiLink).toHaveAttribute('href', '/202607-yotei/');
    expect(kekkaLink).toHaveAttribute('href', '/202607-torikumi/');
    expect(firstMayDay).toBeDefined();
    expect(mayBanzukeLink).toHaveAttribute('href', `${MAY2026_BANDUKE_PATH}/`);
    expect(mayYoteiLink).toHaveAttribute('href', `${MAY2026_SCHEDULE_PATH}/`);
    expect(mayTorikumiLink).toHaveAttribute('href', `${MAY2026_RESULT_PATH}/`);
    expect(allLinks.find((l) => l.getAttribute('href') === `/${firstMayDay!.pathDate}-torikumi/`)).toBeDefined();
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });

  it('does not keep the May 2026 final results section as the current basho highlight', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText('令和八年五月場所最終結果')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: `${MAY2026_TORIKUMI_DATA.year} ${MAY2026_TORIKUMI_DATA.bashoName}` })).toBeInTheDocument();
    expect(within(screen.getByLabelText('主要ページへの導線')).getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202607-banduke/');
  });

  it('keeps March 2026 archive guidance on the top page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const allLinks = screen.getAllByRole('link');

    expect(screen.getByRole('heading', { level: 2, name: `${MARCH2026_TORIKUMI_DATA.year} ${MARCH2026_TORIKUMI_DATA.bashoName}` })).toBeInTheDocument();
    expect(allLinks.find((link) => link.getAttribute('href') === `${MARCH2026_BANDUKE_PATH}/`)).toBeDefined();
  });

  it('renders the news section heading on the top page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: '最新ニュース' })).toBeInTheDocument();
  });

  it('places the news section between the current basho hero and the past-basho map', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const main = document.querySelector('main');
    const hero = document.querySelector('.hero-section');
    const news = document.querySelector('.news-section');
    const firstPastBasho = document.querySelector('.past-basho-section');

    expect(main).not.toBeNull();
    expect(hero).not.toBeNull();
    expect(news).not.toBeNull();
    expect(firstPastBasho).not.toBeNull();

    // The bitwise flag 4 means DOCUMENT_POSITION_FOLLOWING, i.e. `other` is
    // positioned later in the document than `node`.
    const heroBeforeNews = hero!.compareDocumentPosition(news!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const newsBeforePast = news!.compareDocumentPosition(firstPastBasho!) & Node.DOCUMENT_POSITION_FOLLOWING;

    expect(heroBeforeNews).toBeTruthy();
    expect(newsBeforePast).toBeTruthy();
  });

  it('falls back to the empty-state message when no news items are available', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // The committed stub keeps the news list empty so the home page should
    // surface the empty-state copy rather than crashing.
    expect(screen.getByText('新しいニュースはありません')).toBeInTheDocument();
    expect(document.querySelector('.news-list')).not.toBeInTheDocument();
    expect(document.querySelector('.news-section-see-all')).not.toBeInTheDocument();
  });

});
