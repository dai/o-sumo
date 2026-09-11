import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MatchupPopup from './MatchupPopup';

describe('MatchupPopup', () => {
  it('renders "取組予定" badge and info button', () => {
    render(
      <MemoryRouter>
        <MatchupPopup
          eastId={4001}
          westId={4002}
          eastName="大の里"
          westName="大栄翔"
          matchupWinsMap={new Map()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('取組予定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取組予定 - 過去の対戦成績を見る' })).toBeInTheDocument();
  });

  it('displays matchup head-to-head score and link to compare page when opened', () => {
    const map = new Map<string, [number, number]>();
    map.set('4001,4002', [3, 1]);

    render(
      <MemoryRouter>
        <MatchupPopup
          eastId={4001}
          westId={4002}
          eastName="大の里"
          westName="大栄翔"
          matchupWinsMap={map}
        />
      </MemoryRouter>
    );

    const triggerBtn = screen.getByRole('button', { name: '取組予定 - 過去の対戦成績を見る' });
    fireEvent.click(triggerBtn);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    const compareLink = screen.getByRole('link', { name: /対戦成績・合口を見る/ });
    expect(compareLink).toHaveAttribute('href', '/compare/?ids=4001,4002');
  });

  it('displays "初顔合わせ" when no previous bouts exist', () => {
    render(
      <MemoryRouter>
        <MatchupPopup
          eastId={4001}
          westId={4003}
          eastName="大の里"
          westName="新力士"
          matchupWinsMap={new Map()}
        />
      </MemoryRouter>
    );

    const triggerBtn = screen.getByRole('button', { name: '取組予定 - 過去の対戦成績を見る' });
    fireEvent.click(triggerBtn);

    expect(screen.getByText('初顔合わせ')).toBeInTheDocument();
  });
});
