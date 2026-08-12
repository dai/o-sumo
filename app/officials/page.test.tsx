import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
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
    expect(screen.getByText('取得日時: 2026-08-12 00:27 UTC')).toBeInTheDocument();
    expect(screen.getByText('写真は使用していません。')).toBeInTheDocument();
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
    expect(screen.queryByText('取得日時: 2026-08-12 00:27 UTC')).not.toBeInTheDocument();

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
    expect(screen.queryByText('取得日時: 2026-08-12 00:27 UTC')).not.toBeInTheDocument();
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
    expect(screen.getByText('取得日時: 2026-08-12 00:27 UTC')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
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
});
