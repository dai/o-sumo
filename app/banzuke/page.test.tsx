import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BanzukePage from './page';
import BanzukeTable from '../components/BanzukeTable';
import type { RankGroup } from '../lib/sumo-data';

describe('BanzukePage', () => {
  it('keeps contact links in the footer and reverses rank-group sort order', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BanzukePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
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

    render(<BanzukeTable rankGroup={rankGroup} />);

    expect(screen.getByText('1勝1敗1休')).toBeInTheDocument();
    expect(screen.getByText('○')).toBeInTheDocument();
    expect(screen.getByText('●')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
  });
});
