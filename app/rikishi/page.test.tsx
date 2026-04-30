import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RikishiPage from './page';
import RikishiProfilePage from './RikishiProfilePage';

const rikishiIndex = {
  updatedAt: '2026-04-27',
  rikishi: [
    {
      id: 3842,
      name: '豊昇龍',
      yomi: 'ほうしょうりゅう',
      currentRank: '横綱',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
    },
    {
      id: 9999,
      name: '欠損山',
      yomi: 'けっそんやま',
      currentRank: '前頭1',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/9999/',
    },
  ],
};

const profileDetail = {
  id: 3842,
  name: '豊昇龍',
  yomi: 'ほうしょうりゅう',
  currentRank: '横綱',
  birthDate: '平成11年5月22日（26歳）',
  height: 188,
  weight: 148,
  shusshin: 'モンゴル',
  debut: '平成三十年一月場所',
  careerStats: {
    wins: 0,
    losses: 0,
    draws: 0,
  },
  photoUrl: '/images/rikishi/3842.png',
  sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
  updatedAt: '2026-04-27',
};

function mockFetch() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/v1/rikishi.json') {
      return Promise.resolve(new Response(JSON.stringify(rikishiIndex), { status: 200 }));
    }
    if (url === '/api/v1/rikishi/3842.json') {
      return Promise.resolve(new Response(JSON.stringify(profileDetail), { status: 200 }));
    }
    if (url === '/api/v1/rikishi/9999.json') {
      return Promise.resolve(new Response(JSON.stringify({
        id: 9999,
        birthDate: '',
        height: 0,
        weight: 0,
        shusshin: '',
        debut: '',
        careerStats: { wins: 0, losses: 0, draws: 0 },
        photoUrl: '',
      }), { status: 200 }));
    }
    return Promise.resolve(new Response('', { status: 404 }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('Rikishi pages', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the rikishi list from the public index JSON', async () => {
    mockFetch();

    render(
      <MemoryRouter>
        <RikishiPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('読み込み中です。')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /豊昇龍/ })).toHaveAttribute('href', '/rikishi/3842');
    expect(screen.getByRole('link', { name: /欠損山/ })).toHaveAttribute('href', '/rikishi/9999');
    expect(screen.getByText('更新日: 2026-04-27')).toBeInTheDocument();
  });

  it('renders a known profile with source link and copyable API JSON path', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/3842']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: '豊昇龍' })).toBeInTheDocument();
    expect(screen.getByText('横綱 / Houshouryuu')).toBeInTheDocument();
    expect(screen.getByText('平成11年5月22日（26歳）')).toBeInTheDocument();
    expect(screen.getByText('188cm')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '相撲協会プロフィールを見る' })).toHaveAttribute(
      'href',
      'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
    );
    expect(screen.queryByRole('link', { name: 'o-sumo API JSON' })).not.toBeInTheDocument();
    expect(screen.getByText('/api/v1/rikishi/3842.json')).toBeInTheDocument();
    expect(
      screen.getByText('掲載画像は日本相撲協会プロフィール写真をもとに MiniMax I2I Generation で加工したプロフィールイラストです。'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'コピー' }));

    expect(writeText).toHaveBeenCalledWith('/api/v1/rikishi/3842.json');
    expect(await screen.findByRole('button', { name: 'コピーしました' })).toBeInTheDocument();
  });

  it('shows unknown labels for missing profile fields', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/9999']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: '欠損山' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('不明').length).toBeGreaterThanOrEqual(5));
  });

  it('shows a safe not-found state for unknown IDs', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/123456']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 2, name: '力士が見つかりません' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '力士一覧へ戻る' })[0]).toHaveAttribute('href', '/rikishi');
  });
});
