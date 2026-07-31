import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { StrictMode } from 'react';
import { Link, MemoryRouter } from 'react-router-dom';
import MetaHead from './MetaHead';

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
  document.title = '';
  document.head.querySelectorAll(managedMetaSelectors.join(',')).forEach((element) => element.remove());
});

function contentOf(selector: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content ?? null;
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
});
