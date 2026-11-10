import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import GlobalNoticeBanner from '../components/GlobalNoticeBanner';
import { i18n } from './i18n';
import { resolveGlobalNotice, type GlobalNoticeArchive } from './global-notice';
import type { TorikumiArchiveDay, TorikumiMatch } from './torikumi-data';
import enCommon from '../../src/locales/en/common.json';
import jaCommon from '../../src/locales/ja/common.json';

const DAY3 = new Date('2026-11-10T03:00:00Z');

function bout(partial: Partial<TorikumiMatch> & Pick<TorikumiMatch, 'boutNo' | 'kimarite'>): TorikumiMatch {
  return {
    division: '幕内',
    eastName: '東',
    eastYomi: '',
    eastEnglish: '',
    eastRank: '横綱',
    eastProfileUrl: '',
    westName: '西',
    westYomi: '',
    westEnglish: '',
    westRank: '大関',
    westProfileUrl: '',
    winner: null,
    ...partial,
  };
}

function resultDay(
  day: number,
  label: string,
  pathDate: string,
  matches: TorikumiMatch[],
): TorikumiArchiveDay {
  return {
    day,
    isoDate: `${pathDate.slice(0, 4)}-${pathDate.slice(4, 6)}-${pathDate.slice(6, 8)}`,
    pathDate,
    label,
    dayHead: label,
    status: 'published',
    data: {
      makuuchi: {
        day,
        dayName: label,
        dayHead: label,
        division: '幕内',
        matches,
      },
      juryo: {
        day,
        dayName: label,
        dayHead: label,
        division: '十両',
        matches: [],
      },
    },
  };
}

function archive(days: TorikumiArchiveDay[]): GlobalNoticeArchive {
  return {
    bashoName: '十一月場所',
    year: '令和八年',
    updatedAt: '2026-11-10T18:00:00+09:00',
    resultUpdatedAt: '2026-11-10T18:00:00+09:00',
    scheduleUpdatedAt: '2026-11-10T12:00:00+09:00',
    resultDays: days,
    scheduleDays: days,
  };
}

function renderBanner(data: GlobalNoticeArchive, now = DAY3) {
  return render(
    <MemoryRouter>
      <GlobalNoticeBanner archive={data} now={now} />
    </MemoryRouter>,
  );
}

describe('global release notice', () => {
  it('keeps the banner copy free of a hardcoded basho date', () => {
    expect(jaCommon.global.noticeUpdated).toBe('{{basho}}の{{day}}取組を更新しました');
    expect(jaCommon.global.noticePartial).toBe('{{day}} 結果（一部）');
    expect(enCommon.global.noticeUpdated).toBe('Updated the {{day}} torikumi results for the {{basho}}.');
    expect(enCommon.global.noticePartial).toBe('{{day}} results (partial)');
    expect(JSON.stringify(jaCommon.global)).not.toContain('初日・二日目');
    expect(JSON.stringify(enCommon.global)).not.toContain('Day 1 and Day 2');
  });

  it('points at day 3 when that is the latest day with results', () => {
    const data = archive([
      resultDay(2, '二日目', '20261109', [bout({ boutNo: 1, kimarite: '寄り切り', winner: 'east' })]),
      resultDay(3, '三日目', '20261110', [bout({ boutNo: 1, kimarite: '押し出し', winner: 'west' })]),
    ]);

    const notice = resolveGlobalNotice(data, DAY3);
    expect(notice?.href).toBe('/20261110-torikumi/');
    expect(notice?.partial).toBe(false);

    renderBanner(data);
    const link = screen.getByRole('link', { name: /三日目/ });
    expect(link).toHaveAttribute('href', '/20261110-torikumi/');
    expect(link).not.toHaveTextContent('一部');
    expect(link).toHaveTextContent('令和八年十一月場所の三日目取組を更新しました');
  });

  it('marks a day as partial when only some bouts have results', () => {
    const data = archive([
      resultDay(3, '三日目', '20261110', [
        bout({ boutNo: 1, kimarite: '寄り切り', winner: 'east' }),
        bout({ boutNo: 2, kimarite: '未定', winner: null }),
      ]),
    ]);

    const notice = resolveGlobalNotice(data, DAY3);
    expect(notice?.partial).toBe(true);
    expect(notice?.href).toBe('/20261110-torikumi/');

    renderBanner(data);
    expect(screen.getByRole('link', { name: /一部/ })).toHaveTextContent('三日目 結果（一部）');
  });

  it('hides the banner when no day has a result to announce', () => {
    const data = archive([
      resultDay(3, '三日目', '20261110', [bout({ boutNo: 1, kimarite: '未定', winner: null })]),
    ]);

    expect(resolveGlobalNotice(data, DAY3)).toBeNull();
    renderBanner(data);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses the English day label when the locale is English', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    try {
      const data = archive([
        resultDay(3, '三日目', '20261110', [bout({ boutNo: 1, kimarite: '押し出し', winner: 'west' })]),
      ]);
      const view = renderBanner(data);
      expect(screen.getByRole('link')).toHaveTextContent(
        'Updated the Day 3 torikumi results for the November 2026 Tournament.',
      );
      view.unmount();
    } finally {
      await act(async () => {
        await i18n.changeLanguage('ja');
      });
    }
  });
});
