import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import YushoArasoiSection from './YushoArasoiSection';
import { torikumiData, type TorikumiArchiveDay, type TorikumiDataSet } from '../lib/torikumi-data';
import { makuuchiData } from '../lib/sumo-data';
import { computeYushoArasoi, type YushoArasoiSummary } from '../lib/yusho-arasoi';

const DAY12_WINNERS: Array<{ url: string; kimarite: string }> = [
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/', kimarite: '寄り切り' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/', kimarite: '押し出し' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/', kimarite: '押し出し' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4112/', kimarite: '下手出し投げ' },
];

function buildDay12FinalSnapshot(): { archive: TorikumiDataSet; day13Data: TorikumiArchiveDay['data'] } {
  const resultDays = (torikumiData.resultDays ?? []).map((d) => {
    if (d.day !== 12) return d;
    return {
      ...d,
      status: 'published' as const,
      data: {
        ...d.data,
        makuuchi: {
          ...d.data.makuuchi,
          matches: d.data.makuuchi.matches.map((m) => {
            if (m.winner) return m;
            const decided = DAY12_WINNERS.find(
              (w) => w.url === m.eastProfileUrl || w.url === m.westProfileUrl,
            );
            if (!decided) return m;
            return {
              ...m,
              winner: (decided.url === m.eastProfileUrl ? 'east' : 'west') as 'east' | 'west',
              kimarite: decided.kimarite,
            };
          }),
        },
      },
    };
  });
  const day13 = (torikumiData.scheduleDays ?? []).find((d) => d.day === 13);
  if (!day13) throw new Error('Day 13 schedule not found in torikumiData');
  return { archive: { ...torikumiData, resultDays }, day13Data: day13.data };
}

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

  it('renders the contenders table without the max column', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '首位グループ' });
    const headers = within(table).getAllByRole('columnheader').map((el) => el.textContent);
    expect(headers).toEqual(['差', '力士', '成績', '残り', '本日の相手']);
    expect(within(table).queryByRole('columnheader', { name: '最大' })).not.toBeInTheDocument();
    expect(within(table).getAllByText('10勝1敗').length).toBeGreaterThan(0);
  });

  it('renders the head-to-head matrix with played and unplayed cells', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '首位グループの直接対決' });
    expect(within(table).getAllByText(/○ 4日目/).length).toBe(1);
    expect(within(table).getAllByText(/● 4日目/).length).toBe(1);
    expect(within(table).getAllByText('未').length).toBeGreaterThan(0);
  });

  it('renders the conditions table with the leader clinch line and dashes on completed days', () => {
    renderSection(day11Summary(), '2026-11-18');
    const table = screen.getByRole('table', { name: '優勝条件' });
    expect(within(table).getByRole('columnheader', { name: '勝ち/負け' })).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: '全勝時' })).not.toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '決定戦／脱落' })).toBeInTheDocument();
    expect(within(table).getAllByText(/単独優勝確定/).length).toBeGreaterThan(0);
    expect(within(table).getAllByText(/同点で決定戦/).length).toBeGreaterThan(0);
    // 確定済み日では勝ち/負け列が全員「—」
    const rows = within(table).getAllByRole('row').slice(1);
    for (const row of rows) {
      const cells = within(row).getAllByRole('cell');
      expect(cells[3].textContent).toBe('—');
    }
  });

  it('renders today win/lose simulation on day-13 before bouts and dashes on completed day-12', () => {
    const { archive, day13Data } = buildDay12FinalSnapshot();
    const day13Summary = computeYushoArasoi({
      archive,
      targetDay: 13,
      makuuchiBanzuke: makuuchiData,
      visibleDayData: day13Data,
    });
    if (!day13Summary) throw new Error('day-13 summary is null');

    const { unmount } = renderSection(day13Summary, '2026-11-20');
    const contendersTable = screen.getByRole('table', { name: '首位グループ' });
    expect(within(contendersTable).queryByRole('columnheader', { name: '最大' })).not.toBeInTheDocument();

    const condTable = screen.getByRole('table', { name: '優勝条件' });
    const rowByName = (name: string) => {
      const rows = within(condTable).getAllByRole('row').slice(1);
      const found = rows.find((r) => within(r).getAllByRole('cell')[0].textContent === name);
      if (!found) throw new Error(`row not found: ${name}`);
      return within(found).getAllByRole('cell');
    };
    expect(rowByName('若元春')[1].textContent).toBe('11勝1敗');
    expect(rowByName('若元春')[3].textContent).toBe('12勝1敗/11勝2敗');
    for (const name of ['大の里', '熱海富士', '金峰山']) {
      expect(rowByName(name)[1].textContent).toBe('10勝2敗');
      expect(rowByName(name)[3].textContent).toBe('11勝2敗/10勝3敗');
    }
    unmount();

    const day12Summary = computeYushoArasoi({
      archive,
      targetDay: 12,
      makuuchiBanzuke: makuuchiData,
    });
    if (!day12Summary) throw new Error('day-12 summary is null');
    renderSection(day12Summary, '2026-11-19');
    const day12CondTable = screen.getByRole('table', { name: '優勝条件' });
    const day12Rows = within(day12CondTable).getAllByRole('row').slice(1);
    expect(day12Rows.length).toBeGreaterThan(0);
    for (const row of day12Rows) {
      const cells = within(row).getAllByRole('cell');
      expect(cells[3].textContent).toBe('—');
    }
  });

  it('hides the clash outline when more than three days remain', () => {
    renderSection(day11Summary(), '2026-11-18');
    expect(screen.queryByText(/が勝てば/)).not.toBeInTheDocument();
  });
});
