import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import RikishiPage from './page';
import RikishiProfilePage from './RikishiProfilePage';

const rikishiIndex = {
  updatedAt: '2026-04-27T08:15:00+09:00',
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
      id: 3622,
      name: '霧島',
      yomi: 'きりしま',
      currentRank: '大関',
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3622/',
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
    wins: 401,
    losses: 235,
    draws: 34,
  },
  photoUrl: '/images/rikishi/3842.png',
  sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
  updatedAt: '2026-04-27T08:15:00+09:00',
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

function LocationSearchProbe() {
  return <output data-testid="location-search">{useLocation().search}</output>;
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
    expect(await screen.findByRole('link', { name: /豊昇龍/ })).toHaveAttribute('href', '/rikishi/3842/');
    expect(screen.getByRole('link', { name: /欠損山/ })).toHaveAttribute('href', '/rikishi/9999/');
    expect(screen.getByText('更新日: 2026-04-27 08:15 JST')).toBeInTheDocument();
  });

  it('keeps Japanese IME composition local until the text is confirmed', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/']}>
        <RikishiPage />
        <LocationSearchProbe />
      </MemoryRouter>,
    );

    const input = await screen.findByRole('searchbox', { name: '力士を探す' });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'ほう' } });

    expect(input).toHaveValue('ほう');
    expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();

    fireEvent.change(input, { target: { value: 'ほうしょうりゅう' } });
    fireEvent.compositionEnd(input, { data: 'ほうしょうりゅう' });

    await waitFor(() => {
      expect(input).toHaveValue('ほうしょうりゅう');
      expect(screen.getByTestId('location-search')).toHaveTextContent('?q=%E3%81%BB%E3%81%86%E3%81%97%E3%82%87%E3%81%86%E3%82%8A%E3%82%85%E3%81%86');
    });
    expect(screen.getByRole('link', { name: /豊昇龍/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /欠損山/ })).not.toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'リンクをコピー' }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/api/v1/rikishi/3842.json`);
    expect(await screen.findByRole('button', { name: 'コピーしました' })).toBeInTheDocument();
  });

  it('shows the career record with wins / losses / draws, win rate, and bouts', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/3842']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { level: 1, name: '豊昇龍' });
    const region = await screen.findByRole('region', { name: '通算成績' });
    expect(within(region).getByText('401勝 235敗 34分')).toBeInTheDocument();
    expect(within(region).getByText('勝率 63%')).toBeInTheDocument();
    expect(within(region).getByText('出場 670')).toBeInTheDocument();
  });

  it('lists same-rank rikishi from the public index', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/3842']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { level: 1, name: '豊昇龍' });
    const region = await screen.findByRole('region', { name: '横綱の力士' });
    expect(within(region).getByRole('link', { name: /大の里/ })).toHaveAttribute('href', '/rikishi/4227/');
    expect(within(region).queryByRole('link', { name: /豊昇龍/ })).not.toBeInTheDocument();
    expect(within(region).queryByRole('link', { name: /霧島/ })).not.toBeInTheDocument();
  });

  it('hides the same-rank section when only the current rikishi has that rank', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/9999']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { level: 1, name: '欠損山' });
    expect(screen.queryByRole('region', { name: '前頭1の力士' })).not.toBeInTheDocument();
  });

  it('exposes a breadcrumb to the rikishi list and the home page', async () => {
    mockFetch();

    render(
      <MemoryRouter initialEntries={['/rikishi/3842']}>
        <Routes>
          <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { level: 1, name: '豊昇龍' });
    const breadcrumb = screen.getByRole('navigation', { name: 'パンくず' });
    expect(within(breadcrumb).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByRole('link', { name: '力士プロフィール' })).toHaveAttribute('href', '/rikishi/');
    expect(within(breadcrumb).getByText('豊昇龍')).toBeInTheDocument();
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
    expect(screen.getAllByRole('link', { name: '力士一覧へ戻る' })[0]).toHaveAttribute('href', '/rikishi/');
  });
});
