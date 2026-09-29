import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { i18n } from './lib/i18n';
import { torikumiArchive, torikumiMonthKey } from './lib/torikumi-data';
import Home from './page';

vi.mock('./components/NewsSection', () => ({ default: () => null }));
vi.mock('./components/GreetingSection', () => ({ default: () => null }));
vi.mock('./components/DailyHighlightsSection', () => ({ default: () => null }));

const originalResults = torikumiArchive.resultDays;

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-28T12:00:00+09:00'));
  localStorage.clear();
  await act(() => i18n.changeLanguage('ja'));
});

afterEach(() => {
  cleanup();
  torikumiArchive.resultDays = originalResults;
  localStorage.clear();
  vi.useRealTimers();
});

describe('Home final recap reactions', () => {
  it('keeps final-day reactions after the basho ends without changing opening-day reactions', () => {
    const openingKey = `osumo_daily_zabuton_count:${torikumiMonthKey}:1`;
    const finalKey = `osumo_daily_zabuton_count:${torikumiMonthKey}:15`;
    localStorage.setItem(openingKey, '2');
    localStorage.setItem(finalKey, '7');
    render(<MemoryRouter><Home /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'この端末で座布団を投げる (7)' }));

    expect(localStorage.getItem(finalKey)).toBe('8');
    expect(localStorage.getItem(openingKey)).toBe('2');
  });

  it('uses the latest published recap day when final-day results are still pending', () => {
    torikumiArchive.resultDays = originalResults!.map((day) => day.day === 15
      ? { ...day, status: 'pending' }
      : day);
    const recapKey = `osumo_daily_zabuton_count:${torikumiMonthKey}:14`;
    localStorage.setItem(recapKey, '4');
    render(<MemoryRouter><Home /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'この端末で座布団を投げる (4)' }));

    expect(localStorage.getItem(recapKey)).toBe('5');
    expect(localStorage.getItem(`osumo_daily_zabuton_count:${torikumiMonthKey}:1`)).toBeNull();
  });
});
