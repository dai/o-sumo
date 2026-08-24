import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, MemoryRouter, Route, Router, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../lib/i18n';
import { OfficialListPage, OfficialProfilePage } from './page';

const indexItem = {
  id: 1986,
  name: '木村 庄之助',
  yomi: 'きむら しょうのすけ',
  realName: '洞澤 裕司',
  rank: '立行司',
  rankCode: 'tate-gyoji',
  affiliation: '九重',
  sourceUrl: 'https://www.sumo.or.jp/Profile/gyoji/1986/',
};

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((next) => { resolve = next; });
  return { promise, resolve };
}

function LocationSearchProbe() {
  return <output data-testid="location-search">{useLocation().search}</output>;
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  void i18n.changeLanguage('ja');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('official directories', () => {
  it('renders a gyoji directory with numeric routes and source information', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        retrievedAt: '2026-08-12T00:27:59Z',
        source: 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/',
        officials: [indexItem],
      }),
    } as Response);
    render(<MemoryRouter><OfficialListPage kind="gyoji" /></MemoryRouter>);

    expect(await screen.findByRole('link', { name: /木村 庄之助/ })).toHaveAttribute('href', '/gyoji/1986/');
    expect(screen.getByText('立行司')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '日本相撲協会の公式ページを見る' })).toHaveAttribute('href', 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/');
    expect(screen.getByText('取得日時: 2026.08.12 00:27 UTC')).toBeInTheDocument();
    expect(screen.getByText('写真は使用していません。')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '共有リンクをコピー' })).not.toBeInTheDocument();
  });

  it('does not write an official search query to the URL during IME composition', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        retrievedAt: '2026-08-12T00:27:59Z',
        source: 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/',
        officials: [indexItem],
      }),
    } as Response);
    render(
      <MemoryRouter initialEntries={['/gyoji/']}>
        <OfficialListPage kind="gyoji" />
        <LocationSearchProbe />
      </MemoryRouter>,
    );

    const input = await screen.findByRole('searchbox', { name: '行司を探す' });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'きむ' } });

    expect(input).toHaveValue('きむ');
    expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();

    fireEvent.change(input, { target: { value: 'きむら' } });
    fireEvent.compositionEnd(input, { data: 'きむら' });

    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?q=%E3%81%8D%E3%82%80%E3%82%89'));
    expect(screen.getByRole('link', { name: /木村 庄之助/ })).toBeInTheDocument();
  });

  it.each([
    ['gyoji' as const, '行司'],
    ['yobidashi' as const, '呼出'],
  ])('does not render a share button on the %s directory', async (kind, label) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        retrievedAt: '2026-08-12T00:27:59Z',
        source: `https://www.sumo.or.jp/IrohaKyokaiMember/${kind}/`,
        officials: [{
          ...indexItem,
          id: kind === 'gyoji' ? 1986 : 1935,
          name: kind === 'gyoji' ? '木村 庄之助' : '克之',
          rank: kind === 'gyoji' ? '立行司' : '立呼出',
          rankCode: kind === 'gyoji' ? 'tate-gyoji' : 'tate-yobidashi',
        }],
      }),
    } as Response);
    render(<MemoryRouter><OfficialListPage kind={kind} /></MemoryRouter>);

    await screen.findByRole('region', { name: `${label}名鑑` });
    expect(screen.queryByRole('button', { name: '共有リンクをコピー' })).not.toBeInTheDocument();
  });

  it('clears the previous directory while the next kind is still loading', async () => {
    const nextResponse = deferredResponse();
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          retrievedAt: '2026-08-12T00:27:59Z',
          source: 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/',
          officials: [indexItem],
        }),
      } as Response)
      .mockReturnValueOnce(nextResponse.promise);

    render(
      <MemoryRouter initialEntries={['/gyoji/']}>
        <Link to="/yobidashi/">呼出へ</Link>
        <Routes>
          <Route path="/gyoji/" element={<OfficialListPage kind="gyoji" />} />
          <Route path="/yobidashi/" element={<OfficialListPage kind="yobidashi" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('link', { name: /木村 庄之助/ })).toHaveAttribute('href', '/gyoji/1986/');

    await user.click(screen.getByRole('link', { name: '呼出へ' }));

    expect(await screen.findByText('読み込み中です。')).toBeInTheDocument();
    expect(screen.queryByText('木村 庄之助')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '日本相撲協会の公式ページを見る' })).not.toBeInTheDocument();
    expect(screen.queryByText('取得日時: 2026.08.12 00:27 UTC')).not.toBeInTheDocument();

    nextResponse.resolve({
      ok: true,
      json: async () => ({
        retrievedAt: '2026-08-12T01:00:00Z',
        source: 'https://www.sumo.or.jp/IrohaKyokaiMember/yobidashi/',
        officials: [{ ...indexItem, id: 1935, name: '克之', rank: '立呼出', rankCode: 'tate-yobidashi' }],
      }),
    } as Response);
    expect(await screen.findByRole('link', { name: /克之/ })).toHaveAttribute('href', '/yobidashi/1935/');
  });

  it('synchronously hides the previous directory before the next kind effect runs', async () => {
    const nextResponse = deferredResponse();
    let switchKind: (kind: 'gyoji' | 'yobidashi') => void = () => undefined;
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          retrievedAt: '2026-08-12T00:27:59Z',
          source: 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/',
          officials: [indexItem],
        }),
      } as Response)
      .mockReturnValueOnce(nextResponse.promise);

    function SwitchableDirectory() {
      const [kind, setKind] = useState<'gyoji' | 'yobidashi'>('gyoji');
      switchKind = setKind;
      return <OfficialListPage kind={kind} />;
    }

    render(<MemoryRouter><SwitchableDirectory /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /木村 庄之助/ })).toHaveAttribute('href', '/gyoji/1986/');

    act(() => {
      flushSync(() => switchKind('yobidashi'));
      expect(screen.queryByRole('link', { name: /木村 庄之助/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '日本相撲協会の公式ページを見る' })).not.toBeInTheDocument();
      expect(screen.queryByText('取得日時: 2026.08.12 00:27 UTC')).not.toBeInTheDocument();
    });
  });

  it('does not retain previous directory metadata when the next kind fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          retrievedAt: '2026-08-12T00:27:59Z',
          source: 'https://www.sumo.or.jp/IrohaKyokaiMember/gyoji/',
          officials: [indexItem],
        }),
      } as Response)
      .mockRejectedValueOnce(new Error('network failure'));

    render(
      <MemoryRouter initialEntries={['/gyoji/']}>
        <Link to="/yobidashi/">呼出へ</Link>
        <Routes>
          <Route path="/gyoji/" element={<OfficialListPage kind="gyoji" />} />
          <Route path="/yobidashi/" element={<OfficialListPage kind="yobidashi" />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('link', { name: /木村 庄之助/ });
    await user.click(screen.getByRole('link', { name: '呼出へ' }));

    expect(await screen.findByText('名鑑を読み込めませんでした。')).toBeInTheDocument();
    expect(screen.queryByText('木村 庄之助')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '日本相撲協会の公式ページを見る' })).not.toBeInTheDocument();
    expect(screen.queryByText('取得日時: 2026.08.12 00:27 UTC')).not.toBeInTheDocument();
  });

  it('uses the official English rank labels when the English UI is selected', async () => {
    await i18n.changeLanguage('en');
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ retrievedAt: '2026-08-12T00:27:59Z', source: 'https://www.sumo.or.jp/', officials: [indexItem] }),
    } as Response);

    render(<MemoryRouter><OfficialListPage kind="gyoji" /></MemoryRouter>);

    expect(await screen.findByText('Chief Referee')).toBeInTheDocument();
    expect(screen.queryByText('立行司')).not.toBeInTheDocument();

    expect([
      'tate-gyoji', 'sanyaku-gyoji', 'makuuchi-gyoji', 'juryo-gyoji', 'makushita-gyoji', 'sandanme-gyoji', 'jonidan-gyoji', 'jonokuchi-gyoji',
      'tate-yobidashi', 'fuku-tate-yobidashi', 'sanyaku-yobidashi', 'makuuchi-yobidashi', 'juryo-yobidashi', 'makushita-yobidashi', 'sandanme-yobidashi', 'jonidan-yobidashi', 'jonokuchi-yobidashi',
    ].map((rankCode) => i18n.t(`officials.ranks.${rankCode}`))).toEqual([
      'Chief Referee', 'Sanyaku Referee', 'Makuuchi Referee', 'Juryo Referee', 'Makushita Referee', 'Sandanme Referee', 'Jonidan Referee', 'Jonokuchi Referee',
      'Chief Yobidashi', 'Junior Chief Yobidashi', 'Sanyaku Yobidashi', 'Makuuchi Yobidashi', 'Juryo Yobidashi', 'Makushita Yobidashi', 'Sandanme Yobidashi', 'Jonidan Yobidashi', 'Jonokuchi Yobidashi',
    ]);
  });

  it('preserves the official JSON rank in Japanese even when rankCode maps to another label', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        retrievedAt: '2026-08-12T00:27:59Z',
        source: 'https://www.sumo.or.jp/',
        officials: [{ ...indexItem, rank: '公式表記の立行司' }],
      }),
    } as Response);

    render(<MemoryRouter><OfficialListPage kind="gyoji" /></MemoryRouter>);

    expect(await screen.findByText('公式表記の立行司')).toBeInTheDocument();
    expect(screen.queryByText('立行司')).not.toBeInTheDocument();
  });

  it('renders official profile fields without a photograph', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'yobidashi', id: 1935, name: '克之', yomi: 'かつゆき', rank: '立呼出', rankCode: 'tate-yobidashi',
        realName: '小山 克之', affiliation: '芝田山', birthDate: '1964-02-06', birthplace: '大阪府大阪市鶴見区',
        adoptedAt: '1979-08', sourceUrl: 'https://www.sumo.or.jp/Profile/yobidashi/1935/', retrievedAt: '2026-08-12T00:27:59Z',
      }),
    } as Response);
    render(<MemoryRouter initialEntries={['/yobidashi/1935/']}><Routes><Route path="/yobidashi/:id/" element={<OfficialProfilePage kind="yobidashi" />} /></Routes></MemoryRouter>);

    await waitFor(() => expect(screen.getByRole('heading', { name: '克之', level: 1 })).toBeInTheDocument());
    expect(screen.getByText('1979-08')).toBeInTheDocument();
    expect(screen.getByText('取得日時: 2026.08.12 00:27 UTC')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each([
    {
      kind: 'gyoji' as const,
      id: 1986,
      name: '木村 庄之助',
      apiPath: '/api/v1/gyoji/1986.json',
      rank: '立行司',
      rankCode: 'tate-gyoji',
    },
    {
      kind: 'yobidashi' as const,
      id: 1935,
      name: '克之',
      apiPath: '/api/v1/yobidashi/1935.json',
      rank: '立呼出',
      rankCode: 'tate-yobidashi',
    },
  ])('copies the complete $kind API JSON URL from the profile', async ({ kind, id, name, apiPath, rank, rankCode }) => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind, id, name, yomi: 'よみ', rank, rankCode,
        realName: '本名', affiliation: '所属部屋', birthDate: '1961-10-30', birthplace: '東京都',
        adoptedAt: '1977-10', sourceUrl: `https://www.sumo.or.jp/Profile/${kind}/${id}/`, retrievedAt: '2026-08-12T00:27:59Z',
      }),
    } as Response);
    render(
      <MemoryRouter initialEntries={[`/${kind}/${id}/`]}>
        <Routes><Route path={`/${kind}/:id/`} element={<OfficialProfilePage kind={kind} />} /></Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name, level: 1 });
    const apiPathElement = screen.getByText(apiPath);
    const sourceSection = apiPathElement.closest('section');
    expect(sourceSection).not.toBeNull();

    await user.click(within(sourceSection!).getByRole('button', { name: 'リンクをコピー' }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${apiPath}`);
    expect(within(sourceSection!).getByRole('button', { name: 'コピーしました' })).toBeInTheDocument();
  });

  it('exposes a breadcrumb back to home and the gyoji directory', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'gyoji', id: 1986, name: '木村 庄之助', yomi: 'きむら しょうのすけ', rank: '立行司', rankCode: 'tate-gyoji',
        realName: '洞澤 裕司', affiliation: '九重', birthDate: '1961-10-30', birthplace: '東京都府中市',
        adoptedAt: '1977-10', sourceUrl: 'https://www.sumo.or.jp/Profile/gyoji/1986/', retrievedAt: '2026-08-12T00:27:59Z',
      }),
    } as Response);
    render(<MemoryRouter initialEntries={['/gyoji/1986/']}><Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes></MemoryRouter>);

    await screen.findByRole('heading', { name: '木村 庄之助', level: 1 });
    const breadcrumb = screen.getByRole('navigation', { name: 'パンくず' });
    expect(within(breadcrumb).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByRole('link', { name: '行司名鑑' })).toHaveAttribute('href', '/gyoji/');
    expect(within(breadcrumb).getByText('木村 庄之助')).toBeInTheDocument();
  });

  it('exposes a breadcrumb back to home and the yobidashi directory', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'yobidashi', id: 1935, name: '克之', yomi: 'かつゆき', rank: '立呼出', rankCode: 'tate-yobidashi',
        realName: '小山 克之', affiliation: '芝田山', birthDate: '1964-02-06', birthplace: '大阪府大阪市鶴見区',
        adoptedAt: '1979-08', sourceUrl: 'https://www.sumo.or.jp/Profile/yobidashi/1935/', retrievedAt: '2026-08-12T00:27:59Z',
      }),
    } as Response);
    render(<MemoryRouter initialEntries={['/yobidashi/1935/']}><Routes><Route path="/yobidashi/:id/" element={<OfficialProfilePage kind="yobidashi" />} /></Routes></MemoryRouter>);

    await screen.findByRole('heading', { name: '克之', level: 1 });
    const breadcrumb = screen.getByRole('navigation', { name: 'パンくず' });
    expect(within(breadcrumb).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByRole('link', { name: '呼出名鑑' })).toHaveAttribute('href', '/yobidashi/');
    expect(within(breadcrumb).getByText('克之')).toBeInTheDocument();
  });

  it('preserves the official JSON rank on a Japanese profile', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'gyoji', id: 1986, name: '木村 庄之助', yomi: 'きむら しょうのすけ', rank: '公式表記の立行司', rankCode: 'tate-gyoji',
        realName: '洞澤 裕司', affiliation: '九重', birthDate: '1961-10-30', birthplace: '東京都府中市',
        adoptedAt: '1977-10', sourceUrl: 'https://www.sumo.or.jp/Profile/gyoji/1986/', retrievedAt: '2026-08-12T00:27:59Z',
      }),
    } as Response);
    render(<MemoryRouter initialEntries={['/gyoji/1986/']}><Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes></MemoryRouter>);

    expect(await screen.findAllByText('公式表記の立行司')).toHaveLength(2);
    expect(screen.queryByText('立行司')).not.toBeInTheDocument();
  });

  it('shows not found for a non-numeric profile ID without requesting JSON', async () => {
    render(<MemoryRouter initialEntries={['/gyoji/not-a-number/']}><Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: '該当する人物が見つかりません' })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows not found for an HTTP 404 profile response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response);
    render(<MemoryRouter initialEntries={['/gyoji/1986/']}><Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: '該当する人物が見つかりません' })).toBeInTheDocument();
    expect(screen.queryByText('名鑑を読み込めませんでした。')).not.toBeInTheDocument();
  });

  it.each([
    ['network failure', () => Promise.reject(new TypeError('network unavailable'))],
    ['HTTP 500', () => Promise.resolve({ ok: false, status: 500 } as Response)],
  ])('renders the load error instead of not found after %s', async (_label, response) => {
    vi.mocked(fetch).mockImplementationOnce(response);
    render(<MemoryRouter initialEntries={['/gyoji/1986/']}><Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes></MemoryRouter>);

    expect(await screen.findByText('名鑑を読み込めませんでした。')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '該当する人物が見つかりません' })).not.toBeInTheDocument();
    expect(screen.queryByText('木村 庄之助')).not.toBeInTheDocument();
  });

  it('synchronously shows loading without the previous profile while the next route ID is pending', async () => {
    const nextResponse = deferredResponse();
    let switchPath: (path: string) => void = () => undefined;
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...indexItem,
          kind: 'gyoji',
          birthDate: '1961-10-30',
          birthplace: '東京都府中市',
          adoptedAt: '1977-10',
          retrievedAt: '2026-08-12T00:27:59Z',
        }),
      } as Response)
      .mockReturnValueOnce(nextResponse.promise);

    function ControlledProfileRoute() {
      const [pathname, setPathname] = useState('/gyoji/1986/');
      switchPath = setPathname;
      return <Router
        location={pathname}
        navigator={{ createHref: () => '/', go: () => undefined, push: () => undefined, replace: () => undefined }}
      >
        <Routes><Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} /></Routes>
      </Router>;
    }

    render(<ControlledProfileRoute />);
    expect(await screen.findByRole('heading', { name: '木村 庄之助', level: 1 })).toBeInTheDocument();

    act(() => {
      flushSync(() => switchPath('/gyoji/1987/'));
      expect(screen.getByText('読み込み中です。')).toBeInTheDocument();
      expect(screen.queryByText('木村 庄之助')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '日本相撲協会の公式ページを見る' })).not.toBeInTheDocument();
      expect(screen.queryByText('取得日時: 2026.08.12 00:27 UTC')).not.toBeInTheDocument();
    });
  });
});
