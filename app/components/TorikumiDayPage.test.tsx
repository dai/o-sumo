import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TorikumiDayPage from './TorikumiDayPage';
import { torikumiArchive, type TorikumiArchiveDay } from '../lib/torikumi-data';
import { banzukePath, getHubPath } from '../lib/torikumi-routes';

function renderPage(day: TorikumiArchiveDay, mode: 'result' | 'schedule' = 'result') {
  render(
    <MemoryRouter>
      <TorikumiDayPage day={day} mode={mode} />
    </MemoryRouter>,
  );
}

describe('TorikumiDayPage', () => {
  it('renders archive navigation and footer contact links for result pages', () => {
    renderPage(torikumiArchive.resultDays[0], 'result');

    expect(screen.getByRole('heading', { level: 1, name: /取組結果/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '一覧' })).toHaveAttribute('href', getHubPath('result'));
    expect(screen.getByRole('link', { name: '番付' })).toHaveAttribute('href', banzukePath);
    expect(screen.getByText('← 前日なし')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
  });

  it('switches bout sorting between ascending and descending', async () => {
    const user = userEvent.setup();
    renderPage(torikumiArchive.resultDays[0], 'result');

    const before = screen.getAllByRole('row').slice(0, 2).map((row) => row.textContent);
    expect(before[0]).toContain('竜電');

    await user.click(screen.getByRole('button', { name: '降順' }));

    const after = screen.getAllByRole('row').slice(0, 2).map((row) => row.textContent);
    expect(after[0]).toContain('豊昇龍');
  });

  it('shows pending empty-state messaging for unpublished days', () => {
    const pendingDay: TorikumiArchiveDay = {
      day: 15,
      isoDate: '2026-03-22',
      pathDate: '20260322',
      label: '千秋楽',
      dayHead: '千秋楽： 令和8年3月22日(日)',
      status: 'pending',
      statusMessage: '結果未更新',
      data: {
        makuuchi: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽： 令和8年3月22日(日)',
          division: '幕内',
          matches: [],
        },
        juryo: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽： 令和8年3月22日(日)',
          division: '十両',
          matches: [],
        },
      },
    };

    renderPage(pendingDay, 'result');

    expect(screen.getByText('結果未更新')).toBeInTheDocument();
    expect(screen.getByText('幕内の結果はまだ更新されていません。')).toBeInTheDocument();
    expect(screen.getByText('十両の結果はまだ更新されていません。')).toBeInTheDocument();
  });
});
