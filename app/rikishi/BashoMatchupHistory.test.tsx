import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BashoMatchupHistory from './BashoMatchupHistory';
import type { BashoMatchupRecord } from '../lib/rikishi-compare-data';

function makeRecord(monthKey: string, winsA = 1, winsB = 0): BashoMatchupRecord {
  return {
    monthKey,
    year: '令和八年',
    bashoName: 'テスト場所',
    winsA,
    winsB,
    bouts: [{
      day: 1,
      dayLabel: '1日目',
      pathDate: '20260901',
      division: '幕内',
      boutNo: 1,
      kimarite: '寄り切り',
      winner: 'a',
    }],
  };
}

describe('BashoMatchupHistory', () => {
  it('renders nothing when records is empty', () => {
    const { container } = render(<BashoMatchupHistory records={[]} nameA="A" nameB="B" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the section once any record is supplied', () => {
    render(<BashoMatchupHistory records={[makeRecord('202609')]} nameA="A" nameB="B" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('starts collapsed and toggles open on click', async () => {
    const user = userEvent.setup();
    render(<BashoMatchupHistory records={[makeRecord('202609')]} nameA="A" nameB="B" />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the panel id in sync with aria-controls', () => {
    render(<BashoMatchupHistory records={[makeRecord('202609')]} nameA="A" nameB="B" />);
    const toggle = screen.getByRole('button');
    const panelId = toggle.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
  });

  it('renders one list item per basho record', () => {
    render(
      <BashoMatchupHistory
        records={[makeRecord('202609'), makeRecord('202605')]}
        nameA="A"
        nameB="B"
      />,
    );
    expect(screen.getAllByRole('listitem', { hidden: true })).toHaveLength(2);
  });

  it('uses the localized title label from i18n', () => {
    render(<BashoMatchupHistory records={[makeRecord('202609')]} nameA="A" nameB="B" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('場所ごとの対戦履歴');
  });
});
