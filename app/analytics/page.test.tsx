import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { i18n } from '../lib/i18n';
import { torikumiArchive } from '../lib/torikumi-data';
import AnalyticsDashboardPage, { buildDashboardMetrics, topKimarite, topRikishiByWins } from './page';

describe('AnalyticsDashboardPage', () => {
  it('renders the analytics dashboard headline and action links', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '大相撲アナリティクス' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '取組結果を見る' })).toHaveAttribute('href', '/202607-torikumi/');
    expect(screen.getByRole('link', { name: '取組予定を見る' })).toHaveAttribute('href', '/202607-yotei/');
  });

  it('builds metric cards from makuuchi records', () => {
    const metrics = buildDashboardMetrics([
      { id: 1, name: '東', yomi: '', rank: '横綱', side: 'east', wins: 4, losses: 0, profileUrl: '#' },
      { id: 2, name: '西', yomi: '', rank: '大関', side: 'west', wins: 2, losses: 2, profileUrl: '#' },
    ]);

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
    for (const day of torikumiArchive.resultDays ?? []) {
      for (const match of day.data.makuuchi.matches) {
        if (match.kimarite) counts.set(match.kimarite, (counts.get(match.kimarite) ?? 0) + 1);
      }
    }
    const expected = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ja'))
      .slice(0, 3);

    expect(topKimarite(3)).toEqual(expected);
  });

  it('renders the dashboard copy in English when English is selected', async () => {
    await act(() => i18n.changeLanguage('en'));

    render(
      <MemoryRouter>
        <AnalyticsDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Grand Sumo Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Win Leaders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Kimarite Trends' })).toBeInTheDocument();

    await act(() => i18n.changeLanguage('ja'));
  });
});
