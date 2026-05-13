import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BanzukePage from './page';
import BanzukeTable from '../components/BanzukeTable';
import type { RankGroup } from '../lib/sumo-data';
import { torikumiArchive } from '../lib/torikumi-data';
import { formatUpdatedAt } from '../lib/updated-at';

describe('BanzukePage', () => {
  it('keeps contact links in the footer and reverses rank-group sort order', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute('href', 'https://github.com/dai/o-sumo');

    const initialFirstRank = screen.getAllByRole('heading', { level: 3 })[0];
    expect(initialFirstRank).toHaveTextContent('横綱');

    await user.click(screen.getByRole('button', { name: '降順' }));

    const reversedFirstRank = screen.getAllByRole('heading', { level: 3 })[0];
    expect(reversedFirstRank.textContent).not.toBe('横綱');
  });

  it('renders win, loss, and rest markers distinctly', () => {
    const rankGroup: RankGroup = {
      title: '前頭1',
      east: [
        {
          id: 1,
          name: '東力士',
          yomi: 'ひがしりきし',
          rank: '前頭1',
          side: 'east',
          wins: 1,
          losses: 1,
          draws: 1,
          results: ['win', 'loss', 'draw'],
          profileUrl: 'https://example.com/east',
          memo: '',
        },
      ],
      west: [],
    };

    const { container } = render(
      <MemoryRouter>
        <BanzukeTable rankGroup={rankGroup} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '東力士' })).toHaveAttribute('href', '/rikishi/1/');
    expect(screen.getByRole('link', { name: '東力士のo-sumoプロフィールを開く' })).toHaveAttribute('href', '/rikishi/1/');
    expect(screen.getByRole('link', { name: 'プロフィール' })).toHaveAttribute('href', '/rikishi/1/');
    expect(screen.getByText('1勝1敗1休')).toBeInTheDocument();
    expect(screen.getByText('星取表')).toBeInTheDocument();
    expect(screen.getByText('○')).toBeInTheDocument();
    expect(screen.getByText('●')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();

    const photo = container.querySelector('.rikishi-photo');
    expect(photo).not.toBeNull();
    expect(photo?.getAttribute('src')).toBe('/images/rikishi/1.png');

    fireEvent.error(photo as HTMLImageElement);
    expect(photo?.getAttribute('src')?.startsWith('data:image/svg+xml;charset=UTF-8,')).toBe(true);
  });

  it('renders march archive data and links for 202603 route', () => {
    render(
      <MemoryRouter initialEntries={['/202603-banduke']}>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /三月場所 番付一覧/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '取組結果一覧' })).toHaveAttribute('href', '/202603-torikumi/');
  });

  it('renders translated emphasis markup instead of showing raw HTML text', () => {
    render(
      <MemoryRouter>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/<strong>東<\/strong>/)).not.toBeInTheDocument();
    expect(screen.getByText('東と西の欄に力士の四股名と読み仮名、成績、星取表が表示されます。')).toBeInTheDocument();
    expect(screen.getByText('技術スタック: Cloudflare Pages、React、TypeScript')).toBeInTheDocument();
  });

  it('shows the current banzuke update timestamp', () => {
    render(
      <MemoryRouter>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(`更新日: ${formatUpdatedAt(torikumiArchive.updatedAt)}`)).toBeInTheDocument();
  });
});
