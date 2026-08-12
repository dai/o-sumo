import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { OfficialProfilePage } from '../officials/page';
import MetaHead, { usePageMetaOverride } from './MetaHead';

const gyojiProfile = {
  id: 1986,
  name: '木村 庄之助',
  yomi: 'きむら しょうのすけ',
  realName: '洞澤 裕司',
  rank: '立行司',
  rankCode: 'tate-gyoji',
  affiliation: '九重',
  sourceUrl: 'https://www.sumo.or.jp/Profile/gyoji/1986/',
  kind: 'gyoji',
  birthDate: '1961-10-30',
  birthplace: '東京都府中市',
  adoptedAt: '1977-10',
  retrievedAt: '2026-08-12T00:27:59Z',
};

const managedMetaSelectors = [
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[property="og:type"]',
  'meta[property="og:site_name"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.title = '';
  document.head.querySelectorAll(managedMetaSelectors.join(',')).forEach((element) => element.remove());
});

function contentOf(selector: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content ?? null;
}

function PendingOfficialMetadata({ destination }: { destination: string }) {
  usePageMetaOverride({
    pathname: '/gyoji/1986/',
    title: '木村 庄之助 | 行司プロフィール | o-sumo',
    description: '木村 庄之助の大相撲行司プロフィール。階級や所属部屋などを紹介します。',
  });
  return <Link to={destination}>移動</Link>;
}

describe('MetaHead', () => {
  it('reconciles each managed tag once under StrictMode', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta property="og:title" content="old"><meta property="og:title" content="duplicate">',
    );

    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/202607-torikumi/']}>
          <MetaHead />
        </MemoryRouter>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(document.title).toBe('2026年7月場所 取組・星取表 | o-sumo');
      expect(contentOf('meta[name="description"]')).toBe('2026年7月場所の取組結果と星取表を確認できます。');
      expect(contentOf('meta[property="og:url"]')).toBe('https://osada.us/202607-torikumi/');
      expect(contentOf('meta[property="og:image"]')).toBe('https://osada.us/og-default.jpg');
      expect(contentOf('meta[property="og:site_name"]')).toBe('o-sumo');
      expect(contentOf('meta[property="og:image:width"]')).toBe('1629');
      expect(contentOf('meta[property="og:image:height"]')).toBe('1007');
      expect(contentOf('meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(contentOf('meta[property="og:title"]')).toBe('2026年7月場所 取組・星取表 | o-sumo');
      expect(contentOf('meta[property="og:description"]')).toBe('2026年7月場所の取組結果と星取表を確認できます。');
      expect(contentOf('meta[property="og:type"]')).toBe('website');
      expect(contentOf('meta[name="twitter:title"]')).toBe('2026年7月場所 取組・星取表 | o-sumo');
      expect(contentOf('meta[name="twitter:description"]')).toBe('2026年7月場所の取組結果と星取表を確認できます。');
      expect(contentOf('meta[name="twitter:image"]')).toBe('https://osada.us/og-default.jpg');
      for (const selector of managedMetaSelectors) {
        expect(document.head.querySelectorAll(selector)).toHaveLength(1);
      }
    });
  });

  it('updates route-aware title, description, and social URL after navigation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <MetaHead />
        <Link to="/analytics/">分析</Link>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: '分析' }));

    await waitFor(() => {
      expect(document.title).toBe('大相撲データ分析 | o-sumo');
      expect(contentOf('meta[name="description"]')).toBe('大相撲の取組結果、力士、決まり手のデータを分析します。');
      expect(contentOf('meta[property="og:title"]')).toBe('大相撲データ分析 | o-sumo');
      expect(contentOf('meta[property="og:description"]')).toBe('大相撲の取組結果、力士、決まり手のデータを分析します。');
      expect(contentOf('meta[property="og:url"]')).toBe('https://osada.us/analytics/');
      expect(contentOf('meta[name="twitter:title"]')).toBe('大相撲データ分析 | o-sumo');
      expect(contentOf('meta[name="twitter:description"]')).toBe('大相撲の取組結果、力士、決まり手のデータを分析します。');
    });
  });

  it('uses a loaded official name for profile metadata while preserving the path-derived URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => gyojiProfile,
    } as Response));

    render(
      <MemoryRouter initialEntries={['/gyoji/1986/']}>
        <MetaHead>
          <Routes>
            <Route path="/gyoji/:id/" element={<OfficialProfilePage kind="gyoji" />} />
          </Routes>
        </MetaHead>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('木村 庄之助 | 行司プロフィール | o-sumo');
      expect(contentOf('meta[name="description"]')).toBe('木村 庄之助の大相撲行司プロフィール。階級や所属部屋などを紹介します。');
      expect(contentOf('meta[property="og:title"]')).toBe('木村 庄之助 | 行司プロフィール | o-sumo');
      expect(contentOf('meta[property="og:description"]')).toBe('木村 庄之助の大相撲行司プロフィール。階級や所属部屋などを紹介します。');
      expect(contentOf('meta[name="twitter:title"]')).toBe('木村 庄之助 | 行司プロフィール | o-sumo');
      expect(contentOf('meta[name="twitter:description"]')).toBe('木村 庄之助の大相撲行司プロフィール。階級や所属部屋などを紹介します。');
      expect(contentOf('meta[property="og:url"]')).toBe('https://osada.us/gyoji/1986/');
    });
  });

  it.each([
    ['/gyoji/1987/', 'https://osada.us/gyoji/1987/', '行司プロフィール | o-sumo'],
    ['/gyoji/', 'https://osada.us/gyoji/', '行司名鑑 | o-sumo'],
    ['/gyoji/not-a-number/', 'https://osada.us/', 'o-sumo | 大相撲 番付・星取表'],
  ])('never combines a new route URL with stale profile metadata while navigating to %s', async (destination, expectedUrl, expectedTitle) => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/gyoji/1986/']}>
        <MetaHead>
          <PendingOfficialMetadata destination={destination} />
        </MetaHead>
      </MemoryRouter>,
    );
    await waitFor(() => expect(document.title).toBe('木村 庄之助 | 行司プロフィール | o-sumo'));

    await user.click(screen.getByRole('link', { name: '移動' }));
    await waitFor(() => {
      expect(contentOf('meta[property="og:url"]')).toBe(expectedUrl);
      expect(document.title).toBe(expectedTitle);
      expect(contentOf('meta[name="description"]')).not.toContain('木村 庄之助');
      expect(contentOf('meta[property="og:title"]')).not.toContain('木村 庄之助');
      expect(contentOf('meta[name="twitter:title"]')).not.toContain('木村 庄之助');
    });
  });
});
