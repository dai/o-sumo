import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useSearchParams } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { act, Profiler } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CompareRikishiPage, { normalizeCompareIds } from './CompareRikishiPage';

const comparisonIndex = {
  updatedAt: '2026-08-17T10:00:00+09:00',
  rikishi: [
    { id: 4230, name: '安青錦', yomi: 'あおにしき', currentRank: '関脇', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4230/' },
    { id: 4279, name: '義ノ富士', yomi: 'よしのふじ', currentRank: '小結', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4279/' },
    { id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/' },
    { id: 5000, name: '幕下力士', yomi: 'まくしたりきし', currentRank: '幕下1', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/5000/' },
  ],
};

const comparisonProfiles = {
  4230: {
    id: 4230, name: '安青錦', yomi: 'あおにしき', currentRank: '関脇', birthDate: '', height: 182, weight: 140,
    shusshin: 'ウクライナ', debut: '令和五年七月場所', careerStats: { wins: 100, losses: 30, draws: 0 }, photoUrl: '',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4230/', updatedAt: '2026-08-17T10:00:00+09:00',
  },
  4279: {
    id: 4279, name: '義ノ富士', yomi: 'よしのふじ', currentRank: '小結', birthDate: '', height: 193, weight: 172,
    shusshin: '東京都', debut: '令和六年三月場所', careerStats: { wins: 80, losses: 20, draws: 0 }, photoUrl: '',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4279/', updatedAt: '2026-08-17T10:00:00+09:00',
  },
  3842: {
    id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', birthDate: '', height: 188, weight: 150,
    shusshin: 'モンゴル', debut: '平成三十年一月場所', careerStats: { wins: 401, losses: 235, draws: 34 }, photoUrl: '',
    sourceUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/', updatedAt: '2026-08-17T10:00:00+09:00',
  },
};

const matchupResponse = {
  updatedAt: '2026-08-17T17:24:24+09:00',
  matchups: [{ rikishi1Id: 4230, rikishi2Id: 4279, rikishi1Wins: 1, rikishi2Wins: 5 }],
};

type FetchOverrides = {
  index?: Response | Promise<Response>;
  profiles?: Partial<Record<number, Response | Promise<Response>>>;
  matchups?: Response | Promise<Response>;
};

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

function mockComparisonFetch(overrides: FetchOverrides = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/v1/rikishi.json') {
      return Promise.resolve(overrides.index ?? jsonResponse(comparisonIndex));
    }
    if (url === '/api/v1/rikishi-matchups.json') {
      return Promise.resolve(overrides.matchups ?? jsonResponse(matchupResponse));
    }
    const match = url.match(/^\/api\/v1\/rikishi\/(\d+)\.json$/);
    if (match) {
      const id = Number(match[1]);
      const overridden = overrides.profiles?.[id];
      if (overridden) return Promise.resolve(overridden);
      const profile = comparisonProfiles[id as keyof typeof comparisonProfiles];
      return Promise.resolve(profile ? jsonResponse(profile) : jsonResponse({}, 404));
    }
    return Promise.resolve(jsonResponse({}, 404));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

type CommitSnapshot = {
  search: string;
  firstValue: string;
  secondValue: string;
  hasTable: boolean;
  comparisonText: string;
};

function captureCommit(search: string): CommitSnapshot {
  return {
    search,
    firstValue: (document.querySelector('#compare-rikishi-1') as HTMLInputElement | null)?.value ?? '',
    secondValue: (document.querySelector('#compare-rikishi-2') as HTMLInputElement | null)?.value ?? '',
    hasTable: Boolean(document.querySelector('.comparison-table')),
    comparisonText: document.querySelector('.comparison-table')?.textContent ?? '',
  };
}

function ObservedComparePage({ onCommit }: { onCommit?: (snapshot: CommitSnapshot) => void }) {
  const location = useLocation();
  return (
    <Profiler id="compare-page" onRender={() => onCommit?.(captureCommit(location.search))}>
      <CompareRikishiPage />
    </Profiler>
  );
}

function LocationProbe() {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  return (
    <>
      <output data-testid="location">{`${location.pathname}${location.search}`}</output>
      <button type="button" onClick={() => setSearchParams({ ids: '4230', view: 'compact' })}>Navigate to one rikishi</button>
    </>
  );
}

function renderPage(initialEntry = '/compare/', onCommit?: (snapshot: CommitSnapshot) => void) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ObservedComparePage onCommit={onCommit} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('normalizeCompareIds', () => {
  it('keeps only the first two unique positive integer ids', () => {
    expect(normalizeCompareIds('4230,4279,4230,3842,invalid,0,-1')).toEqual([4230, 4279]);
  });

  it('returns an empty selection for missing ids', () => {
    expect(normalizeCompareIds(null)).toEqual([]);
  });
});

describe('CompareRikishiPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes a legacy three-id URL, preserves unrelated params, and prefills both labelled slots in order', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279,3842&view=compact');

    const first = await screen.findByRole('combobox', { name: '力士1' });
    await waitFor(() => expect(first).toHaveValue('安青錦'));
    expect(screen.getByRole('combobox', { name: '力士2' })).toHaveValue('義ノ富士');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4230%2C4279&view=compact'));
  });

  it('prefills only slot 1 for one valid id and removes invalid or duplicate ids', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4230,nope&tab=stats');

    expect(await screen.findByRole('combobox', { name: '力士1' })).toHaveValue('安青錦');
    expect(screen.getByRole('combobox', { name: '力士2' })).toHaveValue('');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4230&tab=stats'));
  });

  it('removes inactive or unknown ids and compacts the remaining valid id into slot 1', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=5000,4230&tab=stats');

    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    await waitFor(() => expect(first).toHaveValue('安青錦'));
    expect(second).toHaveValue('');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4230&tab=stats'));
  });

  it.each([
    ['安青錦', '安青錦'],
    ['あおにしき', '安青錦'],
    ['Aonishiki', '安青錦'],
    ['横綱', '豊昇龍'],
  ])('searches active rikishi by %s and exposes rank, name, yomi, and romaji', async (query, expectedName) => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage();
    const input = await screen.findByRole('combobox', { name: '力士1' });

    await user.type(input, query);

    const option = await screen.findByRole('option', { name: new RegExp(expectedName) });
    expect(option).toHaveTextContent(/(関脇|横綱)/);
    expect(option).toHaveTextContent(/(あおにしき|ほうしょうりゅう)/);
    expect(option).toHaveTextContent(/(Aonishiki|Houshouryuu)/);
    expect(screen.queryByRole('option', { name: /幕下力士/ })).not.toBeInTheDocument();
  });

  it('shows a distinct zero-results state', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage();
    const input = await screen.findByRole('combobox', { name: '力士1' });

    await user.type(input, '該当なし');

    const listbox = await screen.findByRole('listbox', { name: '力士1の候補' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    const emptyOption = within(listbox).getByRole('option', { name: '一致する力士はいません。' });
    expect(emptyOption).toHaveAttribute('aria-selected', 'false');
    expect(emptyOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports combobox ARIA relationships and keyboard selection while preventing duplicate choices', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage();
    const first = await screen.findByRole('combobox', { name: '力士1' });

    await user.click(first);
    const firstListbox = screen.getByRole('listbox', { name: '力士1の候補' });
    expect(first).toHaveAttribute('aria-controls', firstListbox.id);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}');
    expect(first).toHaveAttribute('aria-activedescendant', within(firstListbox).getAllByRole('option')[0].id);
    await user.keyboard('{Enter}');
    expect(first).toHaveValue('安青錦');

    const second = screen.getByRole('combobox', { name: '力士2' });
    await user.click(second);
    expect(screen.queryByRole('option', { name: /安青錦/ })).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}{ArrowUp}{Escape}');
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps a non-empty slot 1 replacement draft in the focused combobox through keyboard selection', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact');
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    await screen.findByRole('table');

    act(() => first.focus());
    fireEvent.change(first, { target: { value: 'Houshouryuu' } });

    expect(first).toHaveFocus();
    expect(first).toHaveValue('Houshouryuu');
    expect(second).toHaveValue('義ノ富士');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact');

    fireEvent.keyDown(first, { key: 'ArrowDown' });
    fireEvent.keyDown(first, { key: 'Enter' });

    expect(first).toHaveValue('豊昇龍');
    expect(second).toHaveValue('義ノ富士');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=3842%2C4279&view=compact'));
  });

  it('closes a combobox when focus leaves it and keeps options out of the tab order', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage();
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });

    await user.click(first);
    await user.tab();

    expect(second).toHaveFocus();
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates ordered ids, compacts a remaining selection, and globally clears while preserving unrelated params', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage('/compare/?ids=4230&view=compact');
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });

    await user.click(second);
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4230%2C4279&view=compact'));

    await user.clear(first);
    expect(first).toHaveValue('義ノ富士');
    expect(second).toHaveValue('');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact'));

    const clear = screen.getByRole('button', { name: '比較をクリア' });
    await user.click(clear);
    expect(first).toHaveValue('');
    expect(second).toHaveValue('');
    expect(clear).toBeDisabled();
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?view=compact');
  });

  it('compacts a sole remaining rikishi into slot 1 so the live state matches its shared URL', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    const view = renderPage('/compare/?ids=4230,4279&view=compact');
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    await waitFor(() => expect(second).toHaveValue('義ノ富士'));

    await user.clear(first);

    expect(first).toHaveValue('義ノ富士');
    expect(second).toHaveValue('');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact'));

    view.unmount();
    vi.unstubAllGlobals();
    mockComparisonFetch();
    renderPage('/compare/?ids=4279&view=compact');

    const reloadedFirst = await screen.findByRole('combobox', { name: '力士1' });
    await waitFor(() => expect(reloadedFirst).toHaveValue('義ノ富士'));
    expect(screen.getByRole('combobox', { name: '力士2' })).toHaveValue('');
  });

  it('renders the compacted sole selection in the first committed clear update', async () => {
    const commits: CommitSnapshot[] = [];
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact', (snapshot) => commits.push(snapshot));
    await screen.findByRole('table');
    const first = screen.getByRole('combobox', { name: '力士1' });
    commits.length = 0;

    act(() => {
      flushSync(() => {
        fireEvent.change(first, { target: { value: '' } });
      });
    });

    expect(commits[0]).toMatchObject({
      firstValue: '義ノ富士',
      secondValue: '',
      hasTable: false,
      comparisonText: '',
    });
  });

  it('compacts the remaining selection when a slot 1 replacement draft is cleared', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact');
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    await screen.findByRole('table');

    fireEvent.change(first, { target: { value: 'Houshouryuu' } });
    expect(first).toHaveValue('Houshouryuu');
    expect(second).toHaveValue('義ノ富士');

    fireEvent.change(first, { target: { value: '' } });

    expect(first).toHaveValue('義ノ富士');
    expect(second).toHaveValue('');
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact');
  });

  it('waits for composition end before compacting an empty replacement draft', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact');
    const first = await screen.findByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    await screen.findByRole('table');

    fireEvent.change(first, { target: { value: 'Houshouryuu' } });
    fireEvent.compositionStart(first);
    fireEvent.change(first, { target: { value: '' } });

    expect(first).toHaveValue('');
    expect(second).toHaveValue('義ノ富士');

    fireEvent.compositionEnd(first);

    expect(first).toHaveValue('義ノ富士');
    expect(second).toHaveValue('');
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact');
  });

  it('keeps IME composition as a local draft without URL writes or Enter selection', async () => {
    mockComparisonFetch();
    renderPage('/compare/?view=compact');
    const input = await screen.findByRole('combobox', { name: '力士1' });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'あお' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    expect(input).toHaveValue('あお');
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?view=compact');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.compositionEnd(input);
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?view=compact');
  });

  it('hides the selected comparison in the first committed IME draft change', async () => {
    const commits: CommitSnapshot[] = [];
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact', (snapshot) => commits.push(snapshot));
    await screen.findByRole('table');
    const first = screen.getByRole('combobox', { name: '力士1' });
    const second = screen.getByRole('combobox', { name: '力士2' });
    commits.length = 0;

    fireEvent.compositionStart(first);
    act(() => {
      flushSync(() => {
        fireEvent.change(first, { target: { value: 'あお' } });
      });
    });

    const firstDraftCommit = commits.find((snapshot) => snapshot.firstValue === 'あお');
    expect(firstDraftCommit).toMatchObject({
      search: '?ids=4230,4279&view=compact',
      secondValue: '義ノ富士',
      hasTable: false,
      comparisonText: '',
    });

    fireEvent.compositionEnd(first);
    expect(first).toHaveValue('あお');
    expect(second).toHaveValue('義ノ富士');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4279&view=compact'));
  });

  it('resets removed slot text when navigation changes the URL externally', async () => {
    const user = userEvent.setup();
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact');
    const second = await screen.findByRole('combobox', { name: '力士2' });
    await waitFor(() => expect(second).toHaveValue('義ノ富士'));

    await user.click(screen.getByRole('button', { name: 'Navigate to one rikishi' }));

    await waitFor(() => expect(second).toHaveValue(''));
    expect(screen.getByTestId('location')).toHaveTextContent('/compare/?ids=4230&view=compact');
  });

  it('gates stale selectors and comparison table in the first committed render after external navigation', async () => {
    const commits: CommitSnapshot[] = [];
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279&view=compact', (snapshot) => commits.push(snapshot));
    await screen.findByRole('table');
    commits.length = 0;

    act(() => {
      flushSync(() => {
        screen.getByRole('button', { name: 'Navigate to one rikishi' }).click();
      });
    });

    const firstTransitionCommit = commits.find((snapshot) => snapshot.search === '?ids=4230&view=compact');
    expect(firstTransitionCommit).toEqual({
      search: '?ids=4230&view=compact',
      firstValue: '安青錦',
      secondValue: '',
      hasTable: false,
      comparisonText: '',
    });
  });

  it('renders exactly seven metrics with semantic headers, profile links, and ordered head-to-head results', async () => {
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,4279');

    const table = await screen.findByRole('table', { name: '力士比較表' });
    expect(within(table).getByText('力士比較表')).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(8);
    expect(within(table).queryByRole('row', { name: /通算勝率/ })).not.toBeInTheDocument();
    expect(within(table).getByRole('link', { name: '安青錦' })).toHaveAttribute('href', '/rikishi/4230/');
    expect(within(table).getByRole('link', { name: '義ノ富士' })).toHaveAttribute('href', '/rikishi/4279/');
    const headToHead = within(table).getByRole('row', { name: /対戦成績/ });
    expect(headToHead).toHaveTextContent('1-5');
    expect(headToHead).toHaveTextContent('5-1');
  });

  it('reverses head-to-head results with display order and uses 0-0 for an absent valid pair', async () => {
    mockComparisonFetch();
    const view = renderPage('/compare/?ids=4279,4230');
    let row = await screen.findByRole('row', { name: /対戦成績/ });
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['5-1', '1-5']);

    view.unmount();
    vi.unstubAllGlobals();
    mockComparisonFetch();
    renderPage('/compare/?ids=4230,3842');
    row = await screen.findByRole('row', { name: /対戦成績/ });
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['0-0', '0-0']);
  });

  it('rejects a matchup response whose updatedAt is not an ISO 8601 timestamp', async () => {
    mockComparisonFetch({ matchups: jsonResponse({ ...matchupResponse, updatedAt: 'August 17, 2026' }) });
    renderPage('/compare/?ids=4230,4279');

    expect(await screen.findByText('対戦成績を読み込めませんでした。')).toBeInTheDocument();
    const row = await screen.findByRole('row', { name: /対戦成績/ });
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['不明', '不明']);
  });

  it('shows separate index, profile, and matchup failure states without a partially labelled table', async () => {
    mockComparisonFetch({ index: jsonResponse({}, 500) });
    const indexView = renderPage('/compare/?ids=4230,4279');
    expect(await screen.findByText('力士一覧を読み込めませんでした。')).toBeInTheDocument();
    indexView.unmount();

    vi.unstubAllGlobals();
    mockComparisonFetch({ profiles: { 4279: jsonResponse({}, 500) } });
    const profileView = renderPage('/compare/?ids=4230,4279');
    expect(await screen.findByText('力士プロフィールを読み込めませんでした。')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    profileView.unmount();

    vi.unstubAllGlobals();
    mockComparisonFetch({ matchups: jsonResponse({ updatedAt: '', matchups: [{ rikishi1Id: 4230 }] }) });
    renderPage('/compare/?ids=4230,4279');
    expect(await screen.findByText('対戦成績を読み込めませんでした。')).toBeInTheDocument();
    const unknownRow = await screen.findByRole('row', { name: /対戦成績/ });
    expect(within(unknownRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['不明', '不明']);
  });

  it('shows a missing-profile state and never labels a partial comparison table', async () => {
    mockComparisonFetch({ profiles: { 4279: jsonResponse({}, 404) } });
    renderPage('/compare/?ids=4230,4279');

    expect(await screen.findByText('選択した力士のプロフィールが見つかりません。')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('suppresses stale profile results after the ordered request key changes', async () => {
    let resolveOldProfile!: (response: Response) => void;
    const oldProfile = new Promise<Response>((resolve) => { resolveOldProfile = resolve; });
    mockComparisonFetch({ profiles: { 4279: oldProfile } });
    const user = userEvent.setup();
    renderPage('/compare/?ids=4230,4279');
    const second = await screen.findByRole('combobox', { name: '力士2' });

    await user.clear(second);
    await user.type(second, '豊昇龍');
    await user.keyboard('{ArrowDown}{Enter}');
    const table = await screen.findByRole('table');
    expect(within(table).getByRole('link', { name: '豊昇龍' })).toBeInTheDocument();
    expect(within(table).queryByRole('link', { name: '義ノ富士' })).not.toBeInTheDocument();

    resolveOldProfile(jsonResponse(comparisonProfiles[4279]));
    await waitFor(() => expect(within(table).queryByRole('link', { name: '義ノ富士' })).not.toBeInTheDocument());
  });
});
