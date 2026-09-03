import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MY_RIKISHI_STORAGE_KEY } from '../lib/my-rikishi';
import MyRikishiPage from './MyRikishiPage';

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
