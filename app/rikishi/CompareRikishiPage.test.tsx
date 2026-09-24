import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CompareRikishiPage from './CompareRikishiPage';
import { i18n } from '../lib/i18n';

const rikishiIndex = {
  updatedAt: '2026-08-17T10:27:47+09:00',
  rikishi: [
    {
      id: 3842,
      name: '豊昇龍',
      yomi: 'ほうしょうりゅう',
      currentRank: '横綱',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
    },
    {
      id: 4227,
      name: '大の里',
      yomi: 'おおのさと',
      currentRank: '横綱',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/',
    },
    {
      id: 3661,
      name: '琴櫻',
      yomi: 'ことざくら',
      currentRank: '大関',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3661/',
    },
    {
      id: 3761,
      name: '若隆景',
      yomi: 'わかたかかげ',
      currentRank: '関脇',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3761/',
    },
  ],
};

const profiles: Record<number, object> = {
  3842: {
    id: 3842,
    name: '豊昇龍',
    yomi: 'ほうしょうりゅう',
    currentRank: '横綱',
    birthDate: '平成11年5月22日（26歳）',
    height: 188,
    weight: 148,
    shusshin: 'モンゴル・ウランバートル',
    debut: '平成三十年一月場所',
    careerStats: { wins: 401, losses: 235, draws: 34 },
    photoUrl: '/images/rikishi/3842.png',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
    updatedAt: '2026-08-17T10:27:47+09:00',
  },
  4227: {
    id: 4227,
    name: '大の里',
    yomi: 'おおのさと',
    currentRank: '横綱',
    birthDate: '平成12年6月7日（25歳）',
    height: 192,
    weight: 182,
    shusshin: '石川県河北郡津幡町',
    debut: '令和五年五月場所',
    careerStats: { wins: 150, losses: 50, draws: 0 },
    photoUrl: '/images/rikishi/4227.png',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/',
    updatedAt: '2026-08-17T10:27:47+09:00',
  },
  3761: {
    id: 3761,
    name: '若隆景',
    yomi: 'わかたかかげ',
    currentRank: '関脇',
    birthDate: '平成6年12月6日（31歳）',
    height: 183,
    weight: 138,
    shusshin: '福島県福島市',
    debut: '平成二十九年三月場所',
    careerStats: { wins: 420, losses: 261, draws: 87 },
    photoUrl: '/images/rikishi/3761.png',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3761/',
    updatedAt: '2026-08-17T10:27:47+09:00',
  },
};

const matchupsData = {
  updatedAt: '2026-08-17T17:24:24+09:00',
  matchups: [
    {
      rikishi1Id: 3842,
      rikishi2Id: 4227,
      rikishi1Wins: 5,
      rikishi2Wins: 3,
    },
  ],
};

function setupFetchMock() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/v1/rikishi.json') {
      return Promise.resolve(new Response(JSON.stringify(rikishiIndex), { status: 200 }));
    }
    if (url === '/api/v1/rikishi-matchups.json') {
      return Promise.resolve(new Response(JSON.stringify(matchupsData), { status: 200 }));
    }
    if (url === '/api/v1/rikishi/3842.json') {
      return Promise.resolve(new Response(JSON.stringify(profiles[3842]), { status: 200 }));
    }
    if (url === '/api/v1/rikishi/4227.json') {
      return Promise.resolve(new Response(JSON.stringify(profiles[4227]), { status: 200 }));
    }
    if (url === '/api/v1/rikishi/3761.json') {
      return Promise.resolve(new Response(JSON.stringify(profiles[3761]), { status: 200 }));
    }
    return Promise.resolve(new Response('', { status: 404 }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('CompareRikishiPage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('ja');
    vi.unstubAllGlobals();
  });

  it('renders initial page with header, breadcrumb, quick pick chips, and comboboxes', async () => {
    setupFetchMock();
    render(
      <MemoryRouter initialEntries={['/compare/']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: '力士比較' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'パンくず' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '注目の対戦・クイック選択' })).toBeInTheDocument();
    expect(screen.getByText('比較を始めるには2人の力士を選んでください。')).toBeInTheDocument();
  });

  it('loads comparison via URL parameters (?ids=3842,4227) and renders all rich comparison sections', async () => {
    setupFetchMock();
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // 1. VS Header Card
    const vsCard = await screen.findByRole('region', { name: '力士対戦カード' });
    expect(vsCard).toBeInTheDocument();
    expect(within(vsCard).getByRole('heading', { level: 3, name: '豊昇龍' })).toBeInTheDocument();
    expect(within(vsCard).getByRole('heading', { level: 3, name: '大の里' })).toBeInTheDocument();

    // 2. Aikuchi Scoreboard (Primary Feature)
    const aikuchiSection = screen.getByRole('region', { name: '合口（直接対戦成績）' });
    expect(aikuchiSection).toBeInTheDocument();
    expect(within(aikuchiSection).getByText('5')).toBeInTheDocument();
    expect(within(aikuchiSection).getByText('3')).toBeInTheDocument();
    expect(within(aikuchiSection).getByText(/豊昇龍 が 2 勝ち越し/)).toBeInTheDocument();
    expect(within(aikuchiSection).getByText('通算 8 番')).toBeInTheDocument();

    const shareCard = screen.getByRole('region', { name: /豊昇龍.*大の里/ });
    expect(within(shareCard).getByText('この取組の見どころ')).toBeInTheDocument();
    expect(within(shareCard).getByText('豊昇龍が通算8番で2勝リード')).toBeInTheDocument();
    expect(within(shareCard).getByText('大の里が体重で34kg上回ります')).toBeInTheDocument();

    // 3. Physical Stats Comparison Bars
    expect(screen.getByRole('region', { name: '体格・スタッツ比較' })).toBeInTheDocument();
    expect(screen.getByText('188 cm')).toBeInTheDocument();
    expect(screen.getByText('192 cm')).toBeInTheDocument();

    // 4. Kimarite Comparison
    expect(screen.getByRole('region', { name: '得意決まり手（勝利数）' })).toBeInTheDocument();

    // 5. Detailed Spec Table
    const table = screen.getByRole('table', { name: '力士詳細スペック表' });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('初土俵')).toBeInTheDocument();
    expect(within(table).getByText('平成三十年一月場所')).toBeInTheDocument();
    expect(within(table).getByText('令和五年五月場所')).toBeInTheDocument();
  });

  it('shares the matchup card with score, highlight, hashtags, and the parameterized URL', async () => {
    setupFetchMock();
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, share });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: '取組カードを画像で共有' }));

    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: '#豊昇龍 vs #大の里 この取組の見どころ',
      text: expect.stringContaining('合口：豊昇龍 5勝 − 3勝 大の里'),
      url: expect.stringContaining('/compare/?ids=3842,4227'),
    }));
    expect(await screen.findByRole('button', { name: '共有しました' })).toBeInTheDocument();
  });

  it('shares the matchup card with attached image file when canShare allows files', async () => {
    setupFetchMock();
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
    }) as any;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['fake-png'], { type: 'image/png' }));
    });
    vi.stubGlobal('navigator', { ...navigator, share, canShare });
    try {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
          <Routes>
            <Route path="/compare/" element={<CompareRikishiPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await user.click(await screen.findByRole('button', { name: '取組カードを画像で共有' }));

      expect(share).toHaveBeenCalledWith(expect.objectContaining({
        title: '#豊昇龍 vs #大の里 この取組の見どころ',
        text: expect.stringContaining('/compare/?ids=3842,4227'),
        files: expect.arrayContaining([expect.any(File)]),
      }));
      const sharePayload = share.mock.calls[0][0];
      expect(sharePayload.url).toBeUndefined();
      expect(await screen.findByRole('button', { name: '共有しました' })).toBeInTheDocument();
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLCanvasElement.prototype.toBlob = originalToBlob;
    }
  });

  it('selects matchup preset with quick pick chip and clears with clear button', async () => {
    setupFetchMock();
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/compare/']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const yokozunaChip = await screen.findByRole('button', { name: /豊昇龍 vs 大の里/ });
    await user.click(yokozunaChip);

    expect(await screen.findByRole('region', { name: '力士対戦カード' })).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: '選択をクリア' });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: '力士対戦カード' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('比較を始めるには2人の力士を選んでください。')).toBeInTheDocument();
  });

  it('renders first-encounter message when two rikishi have no prior bouts', async () => {
    setupFetchMock();
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,3761']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const aikuchiSection = await screen.findByRole('region', { name: '合口（直接対戦成績）' });
    expect(within(aikuchiSection).getByText('本場所での対戦記録はありません（初顔合わせ）')).toBeInTheDocument();
  });

  it('renders in English when language is switched to en', async () => {
    setupFetchMock();
    await i18n.changeLanguage('en');

    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <Routes>
          <Route path="/compare/" element={<CompareRikishiPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Compare rikishi' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Aikuchi (Head-to-Head Record)' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Physical & Stats Comparison' })).toBeInTheDocument();
  });
});
