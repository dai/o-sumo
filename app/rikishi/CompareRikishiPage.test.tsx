import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CompareRikishiPage, { normalizeCompareIds } from './CompareRikishiPage';

const comparisonIndex = {
  updatedAt: '2026-08-17T10:00:00+09:00',
  rikishi: [
    { id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/' },
    { id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/' },
  ],
};

const comparisonProfiles = {
  3842: {
    id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', birthDate: '', height: 188, weight: 150,
    shusshin: 'モンゴル', debut: '平成三十年一月場所', careerStats: { wins: 401, losses: 235, draws: 34 }, photoUrl: '',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/', updatedAt: '2026-08-17T10:00:00+09:00',
  },
  4227: {
    id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱', birthDate: '', height: 192, weight: 191,
    shusshin: '石川県', debut: '令和五年五月場所', careerStats: { wins: 120, losses: 30, draws: 10 }, photoUrl: '',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/', updatedAt: '2026-08-17T10:00:00+09:00',
  },
};

function mockComparisonFetch() {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/v1/rikishi.json') {
      return Promise.resolve(new Response(JSON.stringify(comparisonIndex), { status: 200 }));
    }
    const match = url.match(/^\/api\/v1\/rikishi\/(\d+)\.json$/);
    if (match) {
      const profile = comparisonProfiles[Number(match[1]) as keyof typeof comparisonProfiles];
      return Promise.resolve(new Response(JSON.stringify(profile), { status: profile ? 200 : 404 }));
    }
    return Promise.resolve(new Response('', { status: 404 }));
  }));
}

describe('normalizeCompareIds', () => {
  it('accepts up to three unique positive integer ids', () => {
    expect(normalizeCompareIds('1,2,2,3,4,invalid,0')).toEqual([1, 2, 3]);
  });

  it('returns an empty selection for missing ids', () => {
    expect(normalizeCompareIds(null)).toEqual([]);
  });
});

describe('CompareRikishiPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows career records and calculates win rates without absences', async () => {
    mockComparisonFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/compare/?ids=3842,4227']}>
        <CompareRikishiPage />
      </MemoryRouter>,
    );

    const recordRow = await screen.findByRole('row', { name: /通算成績/ });
    expect(recordRow).toHaveTextContent('401-235-34');
    expect(recordRow).toHaveTextContent('120-30-10');

    const winRateRow = screen.getByRole('row', { name: /通算勝率/ });
    expect(winRateRow).toHaveTextContent('63.1%');
    expect(winRateRow).toHaveTextContent('80.0%');
  });
});
