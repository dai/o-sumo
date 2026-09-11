import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DailyHighlightsSection from './DailyHighlightsSection';
import { i18n } from '../lib/i18n';
import { torikumiArchive, type TorikumiDataSet, type TorikumiArchiveDay } from '../lib/torikumi-data';
import { JULY2026_TORIKUMI_DATA } from '../lib/july2026-data';

function mockMobileViewport(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 600px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function buildEmptyScheduleDay(): TorikumiArchiveDay {
  return {
    day: 1,
    isoDate: '2026-09-13',
    pathDate: '20260913',
    label: '初日',
    dayHead: '',
    status: 'pending',
    data: {
      makuuchi: { day: 1, dayName: '', dayHead: '', division: '幕内', matches: [] },
      juryo: { day: 1, dayName: '', dayHead: '', division: '十両', matches: [] },
    },
  };
}

function pendingArchive(): TorikumiDataSet {
  return {
    ...torikumiArchive,
    scheduleDays: [buildEmptyScheduleDay()],
    resultDays: [],
  };
}

function renderHighlights(
  archive: TorikumiDataSet,
  monthKey: string,
  kind: 'upcoming' | 'live' | 'final',
  day: number | null,
  now?: Date,
) {
  const scheduleDays = archive.scheduleDays ?? [];
  return render(
    <MemoryRouter>
      <DailyHighlightsSection
        monthKey={monthKey}
        archive={archive}
        bashoStatus={{
          kind,
          startDate: archive.scheduleDays?.[0]?.isoDate ?? null,
          endDate: scheduleDays[scheduleDays.length - 1]?.isoDate ?? null,
          day,
        }}
        now={now}
      />
    </MemoryRouter>,
  );
}

function stubMatchupsFetch(payload: unknown): ReturnType<typeof vi.fn> {
  const fetchSpy = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('DailyHighlightsSection', () => {
  beforeEach(() => {
    mockMobileViewport(false);
  });

  it('renders the final basho recap with the official final-day result link', async () => {
    const fetchSpy = stubMatchupsFetch({
      updatedAt: '2026-08-26T00:00:00+09:00',
      matchups: [
        { rikishi1Id: 3622, rikishi2Id: 4055, rikishi1Wins: 5, rikishi2Wins: 7 },
      ],
    });

    try {
      renderHighlights(JULY2026_TORIKUMI_DATA, '202607', 'final', null);

      const section = await screen.findByRole('region', { name: '千秋楽を振り返る' });
      expect(within(section).getByText('千秋楽')).toBeInTheDocument();
      expect(within(section).queryByText(/開発中|表示例|九月場所|初日から/)).not.toBeInTheDocument();
      expect(within(section).queryByText(/公式取組発表待ち|Awaiting Official Bouts/)).not.toBeInTheDocument();
      expect(within(section).getByText('千秋楽の結びを合口とともに振り返ります。')).toBeInTheDocument();
      expect(within(section).getByRole('link', { name: /取組を見る/ })).toHaveAttribute(
        'href',
        '/20260726-torikumi/#bout-makuuchi-21',
      );
      await waitFor(() => {
        expect(within(section).getByRole('group', { name: '熱海富士 7勝 - 5勝 霧島' })).toBeInTheDocument();
      });
      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/rikishi-matchups.json');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders the upcoming basho as a neutral awaiting-official-bouts notice without cards', async () => {
    stubMatchupsFetch({ updatedAt: '2026-08-26T00:00:00+09:00', matchups: [] });

    try {
      renderHighlights(pendingArchive(), '202609', 'upcoming', null, new Date('2026-09-13T06:00:00Z'));

      const section = await screen.findByRole('region', { name: '今日のみどころ' });
      expect(within(section).getByText('今日のみどころ')).toBeInTheDocument();
      expect(within(section).getByText('公式取組発表待ち')).toBeInTheDocument();
      expect(within(section).getByText('公式取組の発表後に、注目取組・合口・比較への導線を掲載します。')).toBeInTheDocument();
      expect(within(section).queryAllByRole('article')).toHaveLength(0);
      expect(within(section).queryByRole('link', { name: /詳しく比較する/ })).not.toBeInTheDocument();
      expect(within(section).queryByRole('link', { name: /取組を見る/ })).not.toBeInTheDocument();
      expect(within(section).queryByRole('group', { name: /合口|勝/ })).not.toBeInTheDocument();
      expect(within(section).queryByRole('button', { name: /ほかの注目取組/ })).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders the awaiting-official-bouts notice in English when the active language is en', async () => {
    stubMatchupsFetch({ updatedAt: '2026-08-26T00:00:00+09:00', matchups: [] });
    await i18n.changeLanguage('en');

    try {
      renderHighlights(pendingArchive(), '202609', 'upcoming', null, new Date('2026-09-13T06:00:00Z'));

      const section = await screen.findByRole('region', { name: "Today's Highlights" });
      expect(within(section).getByText("Today's Highlights")).toBeInTheDocument();
      expect(within(section).getByText('Awaiting Official Bouts')).toBeInTheDocument();
      expect(within(section).getByText(
        'Featured bouts, aikuchi, and comparison links will appear after the official torikumi is published.',
      )).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
      await i18n.changeLanguage('ja');
    }
  });

  it('hides the aikuchi group when the matchups JSON fetch fails but keeps comparison and bout links', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('network'));
    vi.stubGlobal('fetch', fetchSpy);

    try {
      renderHighlights(JULY2026_TORIKUMI_DATA, '202607', 'final', null);

      const section = await screen.findByRole('region', { name: '千秋楽を振り返る' });
      await waitFor(() => {
        expect(within(section).queryByRole('group', { name: /勝 - 勝 / })).not.toBeInTheDocument();
      });
      expect(within(section).getByRole('link', { name: /詳しく比較する/ })).toBeInTheDocument();
      expect(within(section).getByRole('link', { name: /取組を見る/ })).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not render a disclosure on mobile when the basho is pending', async () => {
    mockMobileViewport(true);
    stubMatchupsFetch({ updatedAt: '2026-08-26T00:00:00+09:00', matchups: [] });

    try {
      renderHighlights(pendingArchive(), '202609', 'upcoming', null, new Date('2026-09-13T06:00:00Z'));

      const section = await screen.findByRole('region', { name: '今日のみどころ' });
      expect(within(section).queryAllByRole('article')).toHaveLength(0);
      expect(within(section).queryByRole('button', { name: /ほかの注目取組/ })).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not render any article in pending state on desktop either', async () => {
    stubMatchupsFetch({ updatedAt: '2026-08-26T00:00:00+09:00', matchups: [] });

    try {
      renderHighlights(pendingArchive(), '202609', 'upcoming', null, new Date('2026-09-13T06:00:00Z'));

      const section = await screen.findByRole('region', { name: '今日のみどころ' });
      expect(within(section).queryAllByRole('article')).toHaveLength(0);
      expect(within(section).queryByRole('button', { name: /ほかの注目取組/ })).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders "明後日のみどころ" when 2 days before basho opening (e.g. Sept 11)', async () => {
    stubMatchupsFetch({ updatedAt: '2026-09-11T00:00:00+09:00', matchups: [] });

    try {
      renderHighlights(torikumiArchive, '202609', 'upcoming', null, new Date('2026-09-11T06:00:00Z'));

      const section = await screen.findByRole('region', { name: '明後日のみどころ' });
      expect(within(section).getByText('明後日のみどころ')).toBeInTheDocument();
      expect(within(section).getByText('明後日の結びの一番')).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders "明日のみどころ" when 1 day before basho opening (e.g. Sept 12)', async () => {
    stubMatchupsFetch({ updatedAt: '2026-09-12T00:00:00+09:00', matchups: [] });

    try {
      renderHighlights(torikumiArchive, '202609', 'upcoming', null, new Date('2026-09-12T01:00:00Z'));

      const section = await screen.findByRole('region', { name: '明日のみどころ' });
      expect(within(section).getByText('明日のみどころ')).toBeInTheDocument();
      expect(within(section).getByText('明日の結びの一番')).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders tabs for today and tomorrow during live basho when tomorrow schedule is published', async () => {
    stubMatchupsFetch({ updatedAt: '2026-09-13T00:00:00+09:00', matchups: [] });
    const scheduleDay1 = torikumiArchive.scheduleDays[0];
    const scheduleDay2 = {
      ...torikumiArchive.scheduleDays[1],
      status: 'published' as const,
      data: {
        ...torikumiArchive.scheduleDays[1].data,
        makuuchi: {
          ...torikumiArchive.scheduleDays[1].data.makuuchi,
          matches: scheduleDay1.data.makuuchi.matches,
        },
      },
    };
    const liveArchive: TorikumiDataSet = {
      ...torikumiArchive,
      scheduleDays: [scheduleDay1, scheduleDay2, ...torikumiArchive.scheduleDays.slice(2)],
      resultDays: [
        {
          ...scheduleDay1,
          status: 'published',
        },
      ],
    };

    try {
      renderHighlights(liveArchive, '202609', 'live', 1, new Date('2026-09-13T06:00:00Z'));

      const section = await screen.findByRole('region', { name: '今日のみどころ' });
      const tablist = within(section).getByRole('tablist', { name: '取組日程の切り替え' });
      expect(tablist).toBeInTheDocument();

      const todayTab = within(tablist).getByRole('tab', { name: '今日の取組' });
      const tomorrowTab = within(tablist).getByRole('tab', { name: '明日の取組' });
      expect(todayTab).toHaveAttribute('aria-selected', 'true');
      expect(tomorrowTab).toHaveAttribute('aria-selected', 'false');

      // Click tomorrow tab
      fireEvent.click(tomorrowTab);
      await waitFor(() => {
        expect(todayTab).toHaveAttribute('aria-selected', 'false');
        expect(tomorrowTab).toHaveAttribute('aria-selected', 'true');
        expect(within(section).getByText('明日のみどころ')).toBeInTheDocument();
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
