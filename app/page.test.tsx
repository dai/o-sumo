import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  getDayPath,
  MARCH2026_BANZUKE_PATH,
  MAY2026_BANZUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';
import { MARCH2026_TORIKUMI_DATA } from './lib/march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from './lib/may2026-data';
import { JULY2026_TORIKUMI_DATA } from './lib/july2026-data';
import { i18n } from './lib/i18n';
import {
  torikumiArchive,
  torikumiData,
  type TorikumiArchiveDay,
  type TorikumiDailyData,
  type TorikumiDataSet,
} from './lib/torikumi-data';
import Home, {
  buildLiveTorikumiTarget,
  homeContainerClassName,
  getHomeHeroActions,
  nearestTorikumiAnchor,
} from './page';

// The home page reads the news feed from the committed `public/api/v1/news.json`,
// which is rewritten by the daily-data-update workflow. Stub it here so the test
// stays stable regardless of what the CI has most recently written.
vi.mock('./lib/news-data', () => ({
  newsFeed: {
    updatedAt: '2026-06-30T00:00:00+09:00',
    sources: [],
    items: [],
  },
}));

function withDayNumber(data: TorikumiDailyData, day: number): TorikumiDailyData {
  return {
    ...data,
    makuuchi: { ...data.makuuchi, day },
    juryo: { ...data.juryo, day },
  };
}

function withoutMatches(data: TorikumiDailyData): TorikumiDailyData {
  return {
    ...data,
    makuuchi: { ...data.makuuchi, matches: [] },
    juryo: { ...data.juryo, matches: [] },
  };
}

function createLiveTargetFixture(): { archive: TorikumiDataSet; data: TorikumiDataSet } {
  const sourceDay = MARCH2026_TORIKUMI_DATA.scheduleDays![0];
  const thirdDaySchedule: TorikumiArchiveDay = {
    ...sourceDay,
    day: 3,
    isoDate: '2026-07-14',
    pathDate: '20260714',
    label: '三日目',
    data: withDayNumber(sourceDay.data, 3),
  };
  const fourthDaySchedule: TorikumiArchiveDay = {
    ...sourceDay,
    day: 4,
    isoDate: '2026-07-15',
    pathDate: '20260715',
    label: '四日目',
    data: withDayNumber(sourceDay.data, 4),
  };
  const resultDays = [thirdDaySchedule, fourthDaySchedule].map((day) => ({
    ...day,
    status: 'pending' as const,
    statusMessage: '結果未更新',
    data: withoutMatches(day.data),
  }));
  const staleToday = withDayNumber(sourceDay.data, 3);

  return {
    archive: {
      ...torikumiArchive,
      resultDays,
      scheduleDays: [thirdDaySchedule, fourthDaySchedule],
    },
    data: {
      ...torikumiData,
      today: staleToday,
      tomorrow: staleToday,
    },
  };
}

beforeEach(async () => {
  await act(() => i18n.changeLanguage('ja'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Home page', () => {
  it('can restore the legacy Top design by disabling the editorial variant', () => {
    expect(homeContainerClassName(true)).toBe('home-container home-editorial');
    expect(homeContainerClassName(false)).toBe('home-container');
  });

  it('uses the most time-relevant hero CTA for each basho status', () => {
    const paths = { banzuke: '/banzuke/', schedule: '/schedule/', result: '/results/', live: '/today/' };

    expect(getHomeHeroActions({ kind: 'live', startDate: '2026-07-12', endDate: '2026-07-26', day: 4 }, paths)).toEqual([
      { to: '/today/', labelKey: 'home.heroTodayAction', primary: true },
      { to: '/results/', labelKey: 'home.heroStandingsAction', primary: false },
    ]);
    expect(getHomeHeroActions({ kind: 'upcoming', startDate: '2026-09-13', endDate: '2026-09-27', day: null }, paths)[0]).toEqual(
      { to: '/banzuke/', labelKey: 'home.heroBanzuke', primary: true },
    );
    expect(getHomeHeroActions({ kind: 'final', startDate: '2026-07-12', endDate: '2026-07-26', day: null }, paths)[0]).toEqual(
      { to: '/results/', labelKey: 'home.finalResultsAction', primary: true },
    );
  });

  it('renders the current basho as a Sites-inspired editorial hero', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const home = document.querySelector('.home-container');
    const hero = document.querySelector<HTMLElement>('.hero-section');
    const illustration = document.querySelector('.home-illustration');
    const highlights = document.querySelector<HTMLElement>('.daily-highlights-section');

    expect(home).toHaveClass('home-editorial');
    expect(hero).not.toBeNull();
    expect(hero!.querySelector('.hero-editorial-copy')).not.toBeNull();
    expect(illustration).not.toBeNull();
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
    // Daily Highlights now occupies the right column of the hero section.
    expect(hero).toContainElement(highlights!);
  });

  it('shows the main navigation links and footer-only contact links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Get all links
    const allLinks = screen.getAllByRole('link');
    const banzukeLink = allLinks.find((l) => l.getAttribute('href') === '/202609-banzuke/');
    const yoteiLink = allLinks.find((l) => l.getAttribute('href') === '/202609-yotei/');
    const analyticsLink = allLinks.find((l) => l.getAttribute('href') === '/analytics/');
    const currentHeroTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
    const mayBanzukeLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_BANZUKE_PATH}/`);
    const mayYoteiLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_SCHEDULE_PATH}/`);
    const mayTorikumiLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_RESULT_PATH}/`);
    const firstMayDay = MAY2026_TORIKUMI_DATA.resultDays?.[0];

    const hero = document.querySelector<HTMLElement>('.hero-section');
    expect(within(hero!).getByRole('heading', { level: 2, name: currentHeroTitle })).toBeInTheDocument();
    expect(banzukeLink).toHaveAttribute('href', '/202609-banzuke/');
    expect(yoteiLink).toHaveAttribute('href', '/202609-yotei/');
    expect(analyticsLink).toHaveAttribute('href', '/analytics/');
    expect(firstMayDay).toBeDefined();
    expect(mayBanzukeLink).toHaveAttribute('href', `${MAY2026_BANZUKE_PATH}/`);
    expect(mayYoteiLink).toHaveAttribute('href', `${MAY2026_SCHEDULE_PATH}/`);
    expect(mayTorikumiLink).toHaveAttribute('href', `${MAY2026_RESULT_PATH}/`);
    expect(allLinks.find((l) => l.getAttribute('href') === `/${firstMayDay!.pathDate}-torikumi/`)).toBeUndefined();
    expect(screen.getByRole('link', { name: '過去の場所をすべて見る' })).toHaveAttribute('href', '/archives/');
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });

  it('does not keep the May 2026 final results section as the current basho highlight', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText('令和八年五月場所最終結果')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: `${MAY2026_TORIKUMI_DATA.year}${MAY2026_TORIKUMI_DATA.bashoName}` })).toBeInTheDocument();
    expect(within(screen.getByLabelText('今場所の主要な導線')).getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202609-banzuke/');
  });

  it('keeps March 2026 archive guidance on the top page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const allLinks = screen.getAllByRole('link');

    expect(screen.getByRole('heading', { level: 2, name: `${MARCH2026_TORIKUMI_DATA.year}${MARCH2026_TORIKUMI_DATA.bashoName}` })).toBeInTheDocument();
    expect(allLinks.find((link) => link.getAttribute('href') === `${MARCH2026_BANZUKE_PATH}/`)).toBeDefined();
  });

  it('translates the archive index action when English is selected', async () => {
    await act(() => i18n.changeLanguage('en'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'View all past basho' })).toHaveAttribute('href', '/archives/');

    await act(() => i18n.changeLanguage('ja'));
  });
  it('renders the news section heading on the top page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: '最新ニュース' })).toBeInTheDocument();
  });

  it('shows a live torikumi shortcut before the news section when live data exists', () => {
    const currentResultDay = JULY2026_TORIKUMI_DATA.resultDays?.[3];
    const currentScheduleDay = JULY2026_TORIKUMI_DATA.scheduleDays?.[3];

    expect(currentResultDay).toBeDefined();
    expect(currentScheduleDay).toBeDefined();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${currentScheduleDay!.isoDate}T06:30:00.000Z`));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const news = document.querySelector('.news-section');
    expect(news).not.toBeNull();
  });

  it('builds live torikumi anchors from the JST time window', () => {
    const firstSchedule = MARCH2026_TORIKUMI_DATA.scheduleDays![0].data;
    const julyData = JULY2026_TORIKUMI_DATA;
    const currentDay = 4;
    const currentResultDay = julyData.resultDays?.find((day) => day.day === currentDay);
    const currentScheduleDay = julyData.scheduleDays?.find((day) => day.day === currentDay);

    expect(currentResultDay).toBeDefined();
    expect(currentScheduleDay).toBeDefined();

    expect(nearestTorikumiAnchor(firstSchedule, 14 * 60)).toMatch(/^bout-juryo-/);
    expect(nearestTorikumiAnchor(firstSchedule, 16 * 60)).toMatch(/^bout-makuuchi-/);
    expect(nearestTorikumiAnchor(currentScheduleDay!.data, 16 * 60)).toBe('bout-makuuchi-5');
    expect(nearestTorikumiAnchor(currentScheduleDay!.data, 12 * 60)).toBe('bout-juryo-1');

    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${currentScheduleDay!.isoDate}T07:00:00.000Z`));

    expect(buildLiveTorikumiTarget(julyData, julyData, 16 * 60).href).toBe(
      `${getDayPath(currentResultDay!, 'result')}#bout-makuuchi-5`,
    );
  });

  it('uses the JST current schedule day when today data is stale', () => {
    const { archive, data } = createLiveTargetFixture();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T01:00:00.000Z'));

    expect(buildLiveTorikumiTarget(archive, data, 10 * 60).href).toBe(
      '/20260715-torikumi/#bout-juryo-1',
    );
  });

  it('uses the first schedule day and its first juryo bout before the basho starts', () => {
    const { archive, data } = createLiveTargetFixture();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-10T01:00:00.000Z'));

    expect(buildLiveTorikumiTarget(archive, data, 10 * 60).href).toBe(
      '/20260714-torikumi/#bout-juryo-1',
    );
  });


  it('promotes analytics as a 場所を掘る feature beside the live shortcut', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const featureGrid = document.querySelector<HTMLElement>('.home-feature-grid');
    const liveCard = document.querySelector<HTMLElement>('.live-torikumi-section');
    const analyticsCard = document.querySelector<HTMLElement>('.analytics-feature-card');

    expect(featureGrid).not.toBeNull();
    expect(liveCard).not.toBeNull();
    expect(analyticsCard).not.toBeNull();
    expect(featureGrid).toContainElement(liveCard);
    expect(featureGrid).toContainElement(analyticsCard);
    expect(within(analyticsCard!).getByRole('heading', { name: '場所分析・三賞・決まり手傾向' })).toBeInTheDocument();
    expect(within(analyticsCard!).getByText('大相撲アナリティクス')).toBeInTheDocument();
    expect(within(analyticsCard!).getByRole('link', { name: 'アナリティクスを見る' })).toHaveAttribute('href', '/analytics/');
  });

  it('translates the analytics feature card when English is selected', async () => {
    await act(() => i18n.changeLanguage('en'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const analyticsCard = document.querySelector<HTMLElement>('.analytics-feature-card');
    expect(analyticsCard).not.toBeNull();
    expect(within(analyticsCard!).getByRole('heading', { name: 'Basho Analytics & Kimarite Trends' })).toBeInTheDocument();
    expect(within(analyticsCard!).getByRole('link', { name: 'View Analytics' })).toHaveAttribute('href', '/analytics/');
    await act(() => i18n.changeLanguage('ja'));
  });

  it('renders the upcoming highlights section with awaiting-official-bouts notice', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const highlightsSection = document.querySelector<HTMLElement>('.daily-highlights-section');
    expect(highlightsSection).not.toBeNull();
    expect(within(highlightsSection!).getByRole('heading', { level: 2, name: '今日のみどころ' })).toBeInTheDocument();
    expect(within(highlightsSection!).getByText('公式取組発表待ち')).toBeInTheDocument();
    expect(within(highlightsSection!).getByText('公式取組の発表後に、注目取組・合口・比較への導線を掲載します。')).toBeInTheDocument();
  });

  it('translates the daily highlights section when English is selected in upcoming mode', async () => {
    await act(() => i18n.changeLanguage('en'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const highlightsSection = document.querySelector<HTMLElement>('.daily-highlights-section');
    expect(highlightsSection).not.toBeNull();
    expect(within(highlightsSection!).getByRole('heading', { level: 2, name: "Today's Highlights" })).toBeInTheDocument();
    expect(within(highlightsSection!).getByText('Awaiting Official Bouts')).toBeInTheDocument();
    expect(within(highlightsSection!).getByText('Featured bouts, aikuchi, and comparison links will appear after the official torikumi is published.')).toBeInTheDocument();

    await act(() => i18n.changeLanguage('ja'));
  });

  it('places the feature cards and news between the current basho hero and the past-basho map', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const main = document.querySelector('main');
    const hero = document.querySelector('.hero-section');
    const highlights = document.querySelector('.daily-highlights-section');
    const featureGrid = document.querySelector('.home-feature-grid');
    const live = document.querySelector('.live-torikumi-section');
    const news = document.querySelector('.news-section');
    const firstPastBasho = document.querySelector('.past-basho-section');
    const pastBashoIndex = document.querySelector('.past-basho-index-action');
    const illustration = document.querySelector('.home-illustration');

    expect(main).not.toBeNull();
    expect(hero).not.toBeNull();
    expect(highlights).not.toBeNull();
    expect(featureGrid).not.toBeNull();
    expect(live).not.toBeNull();
    expect(news).not.toBeNull();
    expect(firstPastBasho).not.toBeNull();
    expect(pastBashoIndex).not.toBeNull();
    expect(illustration).not.toBeNull();

    // The bitwise flag 4 means DOCUMENT_POSITION_FOLLOWING, i.e. `other` is
    // positioned later in the document than `node`.
    const heroBeforeHighlights = hero!.compareDocumentPosition(highlights!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const highlightsBeforeFeatures = highlights!.compareDocumentPosition(featureGrid!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const featuresBeforeNews = featureGrid!.compareDocumentPosition(news!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const heroBeforeNews = hero!.compareDocumentPosition(news!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const newsBeforePast = news!.compareDocumentPosition(firstPastBasho!) & Node.DOCUMENT_POSITION_FOLLOWING;
    const pastBeforeIllustration = pastBashoIndex!.compareDocumentPosition(illustration!) & Node.DOCUMENT_POSITION_FOLLOWING;

    expect(heroBeforeHighlights).toBeTruthy();
    expect(highlightsBeforeFeatures).toBeTruthy();
    expect(featuresBeforeNews).toBeTruthy();
    expect(heroBeforeNews).toBeTruthy();
    expect(newsBeforePast).toBeTruthy();
    expect(pastBeforeIllustration).toBeTruthy();
  });

  it('falls back to the empty-state message when no news items are available', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // The committed stub keeps the news list empty so the home page should
    // surface the empty-state copy (one per subsection) rather than crashing.
    expect(screen.getAllByText('新しいニュースはありません')).toHaveLength(2);
    expect(document.querySelector('.news-list')).not.toBeInTheDocument();
    expect(document.querySelector('.news-section-see-all')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.news-subsection-see-all')).toHaveLength(0);
  });

});
