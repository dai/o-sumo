import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { i18n } from '../lib/i18n';
import { JULY2026_TORIKUMI_DATA } from '../lib/july2026-data';
import AnalyticsDashboardPage, { buildDashboardMetrics, topKimarite, topRikishiByWins } from './page';
import * as bashoResultsModule from '../lib/basho-results';

const FINAL_TIME = new Date('2026-09-30T12:00:00+09:00'); // after September basho ends
const UPCOMING_TIME = new Date('2026-08-15T12:00:00+09:00'); // before September basho starts
const LIVE_MID_TIME = new Date('2026-09-18T12:00:00+09:00'); // mid September basho (e.g. Day 6)

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FINAL_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the analytics dashboard headline and action links', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '大相撲アナリティクス' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '取組結果を見る' })).toHaveAttribute('href', '/202609-torikumi/');
    expect(screen.getByRole('link', { name: '取組予定を見る' })).toHaveAttribute('href', '/202609-yotei/');
  });

  it('exposes a breadcrumb on the analytics page back to home', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole('navigation', { name: 'パンくず' });
    expect(within(breadcrumb).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByText('大相撲アナリティクス')).toBeInTheDocument();
  });

  it('renders the pending announcement box when basho results are pending on final day', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /九月場所 結果/ })).toBeInTheDocument();
    expect(screen.getByText('千秋楽 表彰発表待ち')).toBeInTheDocument();
    expect(screen.getByText(/令和八年九月場所の幕内最高優勝・十両優勝および三賞は/)).toBeInTheDocument();
  });

  it('renders the finalized champions and special prizes when results are announced', () => {
    vi.spyOn(bashoResultsModule, 'getBashoResults').mockReturnValue({
      bashoId: '202609',
      bashoName: '令和八年九月場所',
      status: 'announced',
      winners: [
        { id: 'makuuchi-yusho', category: 'makuuchiYusho', rikishi: '大の里', record: '13勝2敗' },
        { id: 'shukun', category: 'shukun', rikishi: '若元春', record: '10勝5敗' },
        { id: 'kanto', category: 'kanto', rikishi: '熱海富士', record: '11勝4敗' },
        { id: 'gino', category: 'gino', rikishi: '安青錦', record: '11勝4敗' },
        { id: 'juryo-yusho', category: 'juryoYusho', rikishi: '湘南乃海', record: '12勝3敗' },
      ],
    });

    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /九月場所 結果/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: '幕内最高優勝 大の里 13勝2敗' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: '殊勲賞 若元春 10勝5敗' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: '敢闘賞 熱海富士 11勝4敗' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: '技能賞 安青錦 11勝4敗' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: '十両優勝 湘南乃海 12勝3敗' })).toBeInTheDocument();
  });

  it('switches between Makuuchi and Juryo divisions via tabs', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    // Default is Makuuchi
    expect(screen.getByRole('tab', { name: '幕内' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('幕内力士')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '幕内 勝ち星リーダー' })).toBeInTheDocument();

    // Click Juryo tab
    fireEvent.click(screen.getByRole('tab', { name: '十両' }));

    expect(screen.getByRole('tab', { name: '十両' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('十両力士')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '十両 勝ち星リーダー' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '十両 決まり手トレンド' })).toBeInTheDocument();
  });

  it('builds metric cards from rikishi records', () => {
    const metrics = buildDashboardMetrics([
      { id: 1, name: '東', yomi: '', rank: '横綱', side: 'east', wins: 4, losses: 0, profileUrl: '#' },
      { id: 2, name: '西', yomi: '', rank: '大関', side: 'west', wins: 2, losses: 2, profileUrl: '#' },
    ], 'makuuchi');

    expect(metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'makuuchi', value: '2' }),
      expect.objectContaining({ key: 'undefeated', value: '1', note: '東' }),
      expect.objectContaining({ key: 'maxWins', value: '4' }),
    ]));
  });

  it('sorts leaders by wins and then losses', () => {
    const leaders = topRikishiByWins([
      { id: 1, name: 'A', yomi: '', rank: '前頭', side: 'east', wins: 3, losses: 1, profileUrl: '#' },
      { id: 2, name: 'B', yomi: '', rank: '前頭', side: 'west', wins: 4, losses: 0, profileUrl: '#' },
      { id: 3, name: 'C', yomi: '', rank: '前頭', side: 'east', wins: 4, losses: 1, profileUrl: '#' },
    ]);

    expect(leaders.map((leader) => leader.name)).toEqual(['B', 'C', 'A']);
  });

  it('summarizes top kimarite trends', () => {
    const counts = new Map<string, number>();
    for (const day of JULY2026_TORIKUMI_DATA.resultDays ?? []) {
      for (const match of day.data.makuuchi.matches) {
        if (match.kimarite) counts.set(match.kimarite, (counts.get(match.kimarite) ?? 0) + 1);
      }
    }
    const expected = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ja'))
      .slice(0, 3);

    expect(topKimarite(JULY2026_TORIKUMI_DATA, 3, 'makuuchi')).toEqual(expected);
  });

  it('renders the dashboard copy in English when English is selected', async () => {
    await act(() => i18n.changeLanguage('en'));

    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Grand Sumo Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Makuuchi Win Leaders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Makuuchi Kimarite Trends' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'September 2026 Basho Results' })).toBeInTheDocument();

    await act(() => i18n.changeLanguage('ja'));
  });

  it('renders the dashboard during an upcoming basho (no awards yet)', () => {
    vi.setSystemTime(UPCOMING_TIME);

    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('region', { name: '主要指標' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /勝ち星リーダー/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /決まり手トレンド/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: /九月場所 結果/ })).not.toBeInTheDocument();
    expect(screen.queryByText('千秋楽以降に分析を公開します。')).not.toBeInTheDocument();
  });

  it('renders the dashboard during mid-basho before final day (no awards section)', () => {
    vi.setSystemTime(LIVE_MID_TIME);

    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('region', { name: '主要指標' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /勝ち星リーダー/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /決まり手トレンド/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: /九月場所 結果/ })).not.toBeInTheDocument();
    expect(screen.queryByText('千秋楽以降に分析を公開します。')).not.toBeInTheDocument();
  });
});
