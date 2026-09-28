import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MY_RIKISHI_STORAGE_KEY } from '../lib/my-rikishi';
import { torikumiArchive, type TorikumiArchiveDay } from '../lib/torikumi-data';
import MyRikishiPage, { resolveMatchupName } from './MyRikishiPage';

const index = {
  updatedAt: '2026-08-17T10:00:00+09:00',
  rikishi: [
    { id: 4230, name: '安青錦', yomi: 'あおにしき', currentRank: '関脇', profileUrl: 'https://example.com/4230' },
    { id: 4279, name: '義ノ富士', yomi: 'よしのふじ', currentRank: '小結', profileUrl: 'https://example.com/4279' },
    { id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', profileUrl: 'https://example.com/3842' },
  ],
};

describe('MyRikishiPage comparison selection', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('limits comparison selection to two rikishi', async () => {
    localStorage.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify([4230, 4279, 3842]));
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify(index), { status: 200 }))));
    const user = userEvent.setup();
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const cards = await screen.findAllByRole('article');
    const first = within(cards[0]).getByRole('checkbox', { name: '比較対象に選択' });
    const second = within(cards[1]).getByRole('checkbox', { name: '比較対象に選択' });
    const third = within(cards[2]).getByRole('checkbox', { name: '比較対象に選択' });
    await user.click(first);
    await user.click(second);

    expect(third).toBeDisabled();
    expect(screen.getByRole('link', { name: '比較する' })).toHaveAttribute('href', '/compare/?ids=4230,4279');
    await user.click(third);
    expect(third).not.toBeChecked();
  });

  it('renders tournament record and match information on rikishi cards', async () => {
    localStorage.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify([3842]));
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify(index), { status: 200 }))));
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const cards = await screen.findAllByRole('article');
    expect(cards).toHaveLength(1);
    const card = cards[0];

    // Card contains rikishi name and dashboard elements
    expect(within(card).getByText('豊昇龍')).toBeInTheDocument();
    expect(within(card).getByText('今場所の成績')).toBeInTheDocument();
  });
});

function makeDay(day: number, isoDate: string, winner: 'east' | null = null): TorikumiArchiveDay {
  return {
    day,
    isoDate,
    pathDate: isoDate.replace(/-/g, ''),
    label: day === 15 ? '千秋楽' : `${day}日目`,
    dayHead: isoDate,
    status: 'published',
    data: {
      makuuchi: {
        day, dayName: `${day}日目`, dayHead: isoDate, division: '幕内',
        matches: [{
          division: '幕内', boutNo: 1,
          eastName: '豊昇龍', eastYomi: '', eastEnglish: '', eastRank: '横綱',
          eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
          westName: '安青錦', westYomi: '', westEnglish: '', westRank: '関脇',
          westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4230/',
          kimarite: winner ? '寄り切り' : '', winner,
        }],
      },
      juryo: { day, dayName: `${day}日目`, dayHead: isoDate, division: '十両', matches: [] },
    },
  };
}

describe('MyRikishiPage schedule links', () => {
  const originalResultDays = torikumiArchive.resultDays;
  const originalScheduleDays = torikumiArchive.scheduleDays;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    localStorage.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify([3842]));
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify(index), { status: 200 }))));
  });

  afterEach(() => {
    torikumiArchive.resultDays = originalResultDays;
    torikumiArchive.scheduleDays = originalScheduleDays;
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    [15, '2026-09-27', '/20260927-torikumi/#bout-makuuchi-1'],
    [14, '2026-09-26', '/20260926-torikumi/#bout-makuuchi-1'],
  ])('keeps day %s results without stale schedules after the basho', async (day, isoDate, resultHref) => {
    vi.setSystemTime(new Date('2026-09-28T00:00:00+09:00'));
    torikumiArchive.resultDays = [makeDay(day, isoDate, 'east')];
    torikumiArchive.scheduleDays = [makeDay(1, '2026-09-13'), makeDay(15, '2026-09-27')];
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const card = await screen.findByRole('article');
    expect(within(card).getByText(/勝ち/)).toBeInTheDocument();
    const links = within(card).getAllByRole('link', { name: /詳細を見る/ });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', resultHref);
  });

  it('keeps the next published schedule during the basho', async () => {
    vi.setSystemTime(new Date('2026-09-26T18:00:00+09:00'));
    torikumiArchive.resultDays = [makeDay(14, '2026-09-26', 'east')];
    torikumiArchive.scheduleDays = [makeDay(1, '2026-09-13'), makeDay(15, '2026-09-27')];
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const card = await screen.findByRole('article');
    expect(within(card).getAllByRole('link', { name: /詳細を見る/ }).map((link) => link.getAttribute('href')))
      .toContain('/20260927-yotei/#bout-makuuchi-1');
  });

  it('does not reuse a completed schedule when the next schedule is unavailable', async () => {
    vi.setSystemTime(new Date('2026-09-26T18:00:00+09:00'));
    torikumiArchive.resultDays = [makeDay(14, '2026-09-26', 'east')];
    torikumiArchive.scheduleDays = [makeDay(1, '2026-09-13'), makeDay(14, '2026-09-26')];
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const card = await screen.findByRole('article');
    expect(within(card).getAllByRole('link', { name: /詳細を見る/ })).toHaveLength(1);
  });

  it.each([false, true])('keeps the opening-day schedule with pending results: %s', async (hasPendingResults) => {
    vi.setSystemTime(new Date('2026-09-12T18:00:00+09:00'));
    const openingResult = makeDay(1, '2026-09-13');
    openingResult.status = 'pending';
    openingResult.data.makuuchi.matches = [];
    torikumiArchive.resultDays = hasPendingResults ? [openingResult] : [];
    torikumiArchive.scheduleDays = [makeDay(1, '2026-09-13'), makeDay(15, '2026-09-27')];
    render(<MemoryRouter><MyRikishiPage /></MemoryRouter>);

    const card = await screen.findByRole('article');
    expect(within(card).getByRole('link', { name: /詳細を見る/ }))
      .toHaveAttribute('href', '/20260913-yotei/#bout-makuuchi-1');
  });
});

describe('rikishi matchup name resolution', () => {
  it('replaces kana matchup names with the canonical name from the index', () => {
    const names = new Map([[3842, '豊昇龍']]);
    expect(resolveMatchupName(
      'https://www.sumo.or.jp/ResultRikishiData/profile/3842/',
      'ほうしょうりゅう',
      names,
    )).toBe('豊昇龍');
  });

  it('keeps the matchup fallback when the profile ID is unavailable', () => {
    expect(resolveMatchupName('https://example.com/unknown', 'ほうしょうりゅう', new Map())).toBe('ほうしょうりゅう');
  });
});
