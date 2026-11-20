import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import YushoArasoiSection from './YushoArasoiSection';
import { torikumiData } from '../lib/torikumi-data';
import { makuuchiData } from '../lib/sumo-data';
import { computeYushoArasoi, type YushoArasoiSummary } from '../lib/yusho-arasoi';

function day11Summary() {
  const summary = computeYushoArasoi({
    archive: torikumiData,
    targetDay: 11,
    makuuchiBanzuke: makuuchiData,
  });
  if (!summary) throw new Error('day-11 summary is null');
  return summary;
}

function renderSection(summary: YushoArasoiSummary, todayIsoDate: string) {
  return render(
    <MemoryRouter>
      <YushoArasoiSection summary={summary} banzukePath="/banzuke/202611/" todayIsoDate={todayIsoDate} />
    </MemoryRouter>,
  );
}

describe('YushoArasoiSection', () => {
  it('shows the basis date next to the title', () => {
    renderSection(day11Summary(), '2026-11-18');
    const heading = screen.getByRole('heading', { level: 2, name: '優勝争い' });
    const section = heading.closest('section')!;
    expect(within(section).getByText('十一日目終了時点')).toBeInTheDocument();
  });

  it('switches the featured-bouts heading between today and yesterday', () => {
    const { unmount } = renderSection(day11Summary(), '2026-11-18');
    expect(
      screen.getByRole('heading', { level: 3, name: '本日（11月18日・十一日目）の注目対戦' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '本日の相手' })).toBeInTheDocument();
    unmount();

    renderSection(day11Summary(), '2026-11-19');
    expect(
      screen.getByRole('heading', { level: 3, name: '昨日（11月18日・十一日目）の注目対戦' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '相手' })).toBeInTheDocument();
  });

  it('renders the contenders table with records and remaining bouts', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '首位グループ' });
    expect(within(table).getByRole('columnheader', { name: '最大' })).toBeInTheDocument();
    expect(within(table).getAllByText('10勝1敗').length).toBeGreaterThan(0);
  });

  it('renders the head-to-head matrix with played and unplayed cells', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '首位グループの直接対決' });
    expect(within(table).getAllByText(/○ 4日目/).length).toBe(1);
    expect(within(table).getAllByText(/● 4日目/).length).toBe(1);
    expect(within(table).getAllByText('未').length).toBeGreaterThan(0);
  });

  it('renders the conditions table with the leader clinch line', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '優勝条件' });
    expect(within(table).getByRole('columnheader', { name: '決定戦／脱落' })).toBeInTheDocument();
    expect(within(table).getAllByText(/単独優勝確定/).length).toBeGreaterThan(0);
    expect(within(table).getAllByText(/同点で決定戦/).length).toBeGreaterThan(0);
  });

  it('hides the clash outline when more than three days remain', () => {
    renderSection(day11Summary(), '2026-11-18');
    expect(screen.queryByText(/が勝てば/)).not.toBeInTheDocument();
  });
});
