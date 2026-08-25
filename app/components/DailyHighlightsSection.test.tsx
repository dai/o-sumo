import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DailyHighlightsSection from './DailyHighlightsSection';
import { torikumiArchive, type TorikumiDataSet } from '../lib/torikumi-data';

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

function renderHighlights(
  archive: TorikumiDataSet,
  monthKey: string,
  kind: 'upcoming' | 'live' | 'final',
  day: number | null,
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
      />
    </MemoryRouter>,
  );
}

describe('DailyHighlightsSection', () => {
  beforeEach(() => {
    mockMobileViewport(false);
  });

  it('renders the final basho recap with the official final-day result link', () => {
    renderHighlights(torikumiArchive, '202607', 'final', null);

    const section = screen.getByRole('region', { name: '千秋楽を振り返る' });
    expect(within(section).getByText('千秋楽')).toBeInTheDocument();
    expect(within(section).queryByText(/表示例/)).not.toBeInTheDocument();
    expect(within(section).getByText('千秋楽の結びを合口とともに振り返ります。')).toBeInTheDocument();
    expect(within(section).queryByText(/九月場所|初日から/)).not.toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /取組を見る/ })).toHaveAttribute(
      'href',
      '/20260726-torikumi/#bout-makuuchi-21',
    );
  });

  it('collapses secondary preview matchups on mobile and keeps focus on the trigger', async () => {
    mockMobileViewport(true);
    const firstScheduleDay = torikumiArchive.scheduleDays![0];
    const upcomingArchive: TorikumiDataSet = {
      ...torikumiArchive,
      scheduleDays: [{
        ...firstScheduleDay,
        day: 1,
        isoDate: '2026-09-13',
        pathDate: '20260913',
        label: '初日',
      }],
      resultDays: [],
    };
    const user = userEvent.setup();

    renderHighlights(upcomingArchive, '202609', 'upcoming', null);

    const section = screen.getByRole('region', { name: '注目の好取組プレビュー' });
    expect(within(section).getAllByRole('article')).toHaveLength(1);
    expect(within(section).getAllByRole('link', { name: /詳しく比較する/ })).toHaveLength(1);
    expect(within(section).queryByRole('link', { name: /取組を見る/ })).not.toBeInTheDocument();
    const trigger = within(section).getByRole('button', { name: 'ほかの注目取組を表示' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');

    await user.click(trigger);

    expect(within(section).getAllByRole('article')).toHaveLength(2);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveFocus();
  });

  it('shows every preview matchup without a disclosure on desktop', () => {
    const firstScheduleDay = torikumiArchive.scheduleDays![0];
    const upcomingArchive: TorikumiDataSet = {
      ...torikumiArchive,
      scheduleDays: [{
        ...firstScheduleDay,
        day: 1,
        isoDate: '2026-09-13',
        pathDate: '20260913',
        label: '初日',
      }],
      resultDays: [],
    };

    renderHighlights(upcomingArchive, '202609', 'upcoming', null);

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /ほかの注目取組/ })).not.toBeInTheDocument();
  });
});
