import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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
      expect.objectContaining({ label: '幕内力士', value: '2' }),
      expect.objectContaining({ label: '無敗力士', value: '1', note: '東' }),
      expect.objectContaining({ label: '最多勝ライン', value: '4勝' }),
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
    expect(topKimarite(3)).toHaveLength(3);
    expect(topKimarite(3)[0].count).toBeGreaterThanOrEqual(topKimarite(3)[1].count);
  });
});
