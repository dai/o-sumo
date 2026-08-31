import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MetaHead from '../components/MetaHead';
import { i18n } from '../lib/i18n';
import CompareRikishiPage from './CompareRikishiPage';
import RikishiProfilePage from './RikishiProfilePage';

const index = {
  updatedAt: '2026-08-31T00:00:00+09:00',
  rikishi: [
    { id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱', profileUrl: 'https://example.test/3842' },
    { id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱', profileUrl: 'https://example.test/4227' },
  ],
};

const detail = (id: number, name: string, yomi: string) => ({
  id, name, yomi, currentRank: '横綱', birthDate: '', height: 0, weight: 0, shusshin: '', debut: '',
  sourceUrl: `https://example.test/${id}`, updatedAt: index.updatedAt,
  careerStats: { wins: 0, losses: 0, draws: 0 }, photoUrl: '',
});

function mockFetch() {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const body = url === '/api/v1/rikishi.json' ? index
      : url === '/api/v1/rikishi/3842.json' ? detail(3842, '豊昇龍', 'ほうしょうりゅう')
        : url === '/api/v1/rikishi/4227.json' ? detail(4227, '大の里', 'おおのさと')
          : url === '/api/v1/rikishi-matchups.json' ? { updatedAt: index.updatedAt, matchups: [] }
            : null;
    return Promise.resolve(body ? new Response(JSON.stringify(body)) : new Response('', { status: 404 }));
  }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.title = '';
  document.head.querySelectorAll('meta[property="og:title"], meta[property="og:url"], meta[name="twitter:title"]').forEach((element) => element.remove());
});

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('rikishi share metadata', () => {
  it('publishes the Japanese deep-dive title to browser and social metadata for a comparison', async () => {
    mockFetch();
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <MetaHead><Routes><Route path="/compare/" element={<CompareRikishiPage />} /></Routes></MetaHead>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('#豊昇龍 と #大の里 の合口は？徹底比較 | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe('#豊昇龍 と #大の里 の合口は？徹底比較 | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content).toBe('#豊昇龍 と #大の里 の合口は？徹底比較 | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe('https://osada.us/compare/?ids=3842,4227');
    });
  });

  it('publishes the English deep-dive title to browser and social metadata for a comparison', async () => {
    await i18n.changeLanguage('en');
    mockFetch();
    render(
      <MemoryRouter initialEntries={['/compare/?ids=3842,4227']}>
        <MetaHead><Routes><Route path="/compare/" element={<CompareRikishiPage />} /></Routes></MetaHead>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('#豊昇龍 vs #大の里: Head-to-head deep dive | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe('#豊昇龍 vs #大の里: Head-to-head deep dive | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content).toBe('#豊昇龍 vs #大の里: Head-to-head deep dive | o-sumo');
    });
  });

  it('publishes the loaded rikishi name for a profile', async () => {
    mockFetch();
    render(
      <MemoryRouter initialEntries={['/rikishi/4227/']}>
        <MetaHead><Routes><Route path="/rikishi/:id/" element={<RikishiProfilePage />} /></Routes></MetaHead>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('大の里 | 力士プロフィール | o-sumo');
      expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe('大の里 | 力士プロフィール | o-sumo');
    });
  });
});
