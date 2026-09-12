import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getBanzukePathForMonthKey,
  getDayPath,
} from './lib/torikumi-routes';
import {
  torikumiArchive,
  torikumiData,
  torikumiMonthKey,
  type TorikumiDataSet,
  type TorikumiDailyData,
} from './lib/torikumi-data';

import { PAST_BASHO } from './lib/archives-data';
import HomeLink from './components/HomeLink';
import { getBashoStatus, type BashoStatus } from './lib/basho-status';
import NewsSection from './components/NewsSection';
import { formatBashoTitle, getFinalBashoName } from './lib/basho-meta';
import KimariteCard from './components/KimariteCard';
import DailyHighlightsSection from './components/DailyHighlightsSection';
import BlogUpdatesSection from './components/BlogUpdatesSection';
import { divisionAnchorId } from './lib/rikishi-display';
import { getCalendarDayDiffJst, getRelativeDateLabel } from './lib/relative-date';
import './index.css';

const LIVE_START_MINUTES = 13 * 60;
const MAKUUCHI_START_MINUTES = 15 * 60 + 30;
const LIVE_END_MINUTES = 18 * 60;
// The homepage only needs the current route names. Deriving them from the
// published month key avoids pulling every historical banzuke dataset into
// the initial bundle through archive-basho-data.
const CURRENT_RESULT_PATH = `/${torikumiMonthKey}-torikumi`;
const CURRENT_SCHEDULE_PATH = `/${torikumiMonthKey}-yotei`;

// Set to false for an immediate rollback to the legacy Top design.
export const EDITORIAL_HOME_ENABLED = true;

export function homeContainerClassName(editorialEnabled = EDITORIAL_HOME_ENABLED): string {
  return editorialEnabled ? 'home-container home-editorial' : 'home-container';
}

type LiveTorikumiTarget = {
  href: string;
  description: string;
};

type HomeHeroPaths = {
  banzuke: string;
  schedule: string;
  result: string;
  live: string;
};

type HomeHeroAction = {
  to: string;
  labelKey: string;
  primary: boolean;
};

export type HomeQuickNavItem = {
  to: string;
  labelKey: string;
  subKey: string;
  date?: string;
  relative?: string;
  primary: boolean;
  badgeKey?: string;
};

/**
 * Keeps the home hero aligned with the published basho status. The first
 * action is the user’s most time-relevant task; subsequent actions remain
 * available without competing with it visually.
 */
export function getHomeHeroActions(status: BashoStatus, paths: HomeHeroPaths): HomeHeroAction[] {
  if (status.kind === 'live') {
    return [
      { to: paths.live, labelKey: 'home.heroTodayAction', primary: true },
      { to: paths.result, labelKey: 'home.heroStandingsAction', primary: false },
    ];
  }

  if (status.kind === 'upcoming') {
    return [
      { to: paths.banzuke, labelKey: 'home.heroBanzuke', primary: true },
      { to: paths.schedule, labelKey: 'home.heroSchedule', primary: false },
    ];
  }

  return [
    { to: paths.result, labelKey: 'home.finalResultsAction', primary: true },
    { to: paths.banzuke, labelKey: 'home.heroBanzuke', primary: false },
  ];
}

function formatHomeDate(isoDate: string | null, language: string): string | undefined {
  if (!isoDate) return undefined;
  return new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function getHomeQuickNavItems(
  status: BashoStatus,
  paths: HomeHeroPaths,
  language = 'ja',
  options?: {
    isOpeningBoutPublished?: boolean;
    dayDiff?: number | null;
    openingBoutPath?: string;
  },
): HomeQuickNavItem[] {
  const isPublished = Boolean(options?.isOpeningBoutPublished);
  const relativeLabel = typeof options?.dayDiff === 'number'
    ? getRelativeDateLabel(options.dayDiff, language === 'en')
    : '';
  const openingBoutTo = isPublished
    ? (options?.openingBoutPath ?? paths.schedule)
    : paths.result;

  const stateItems: HomeQuickNavItem[] = status.kind === 'upcoming'
    ? [
        {
          to: openingBoutTo,
          labelKey: 'home.quickNavOpeningBout',
          subKey: isPublished && relativeLabel
            ? 'home.quickNavOpeningBoutPublishedSub'
            : 'home.quickNavOpeningBoutSub',
          date: formatHomeDate(status.startDate, language),
          relative: relativeLabel,
          primary: true,
        },
        {
          to: paths.schedule,
          labelKey: 'home.quickNavScheduleList',
          subKey: 'home.quickNavTomorrowSub',
          primary: false,
        },
      ]
    : status.kind === 'live'
      ? [
          {
            to: paths.live,
            labelKey: 'home.quickNavToday',
            subKey: 'home.quickNavTodaySub',
            primary: true,
            badgeKey: 'home.quickNavLiveBadge',
          },
          {
            to: paths.schedule,
            labelKey: 'home.quickNavNextBoutSchedule',
            subKey: 'home.quickNavTomorrowSub',
            primary: false,
          },
        ]
      : [
          {
            to: paths.result,
            labelKey: 'home.quickNavFinalResults',
            subKey: 'home.finalResultsDescription',
            primary: true,
          },
          {
            to: paths.schedule,
            labelKey: 'home.quickNavPastSchedule',
            subKey: 'home.quickNavPastScheduleSub',
            date: formatHomeDate(status.endDate, language),
            primary: false,
          },
        ];

  return [
    ...stateItems,
    {
      to: paths.banzuke,
      labelKey: 'home.quickNavBanzuke',
      subKey: 'home.quickNavBanzukeSub',
      primary: false,
    },
    {
      to: '/my-rikishi/',
      labelKey: 'home.quickNavMyRikishi',
      subKey: 'home.quickNavMyRikishiSub',
      primary: false,
    },
  ];
}

function dayOfDailyData(d: TorikumiDailyData | null | undefined): number | null {
  if (!d) return null;
  const makuuchiDay = d.makuuchi?.day;
  return typeof makuuchiDay === 'number' ? makuuchiDay : null;
}

function hasAnyMatches(d: TorikumiDailyData | null | undefined): boolean {
  return Boolean(d && (d.makuuchi.matches.length > 0 || d.juryo.matches.length > 0));
}

export function jstMinutesOfDay(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

function boutNumberForWindow(matchCount: number, elapsedMinutes: number, windowMinutes: number): number {
  if (matchCount <= 0) return 0;
  const ratio = Math.max(0, Math.min(elapsedMinutes / windowMinutes, 0.999));
  return Math.max(1, Math.min(matchCount, Math.floor(ratio * matchCount) + 1));
}

export function nearestTorikumiAnchor(dayData: TorikumiDailyData, jstMinutes: number): string | null {
  if (jstMinutes >= LIVE_START_MINUTES && jstMinutes < MAKUUCHI_START_MINUTES && dayData.juryo.matches.length > 0) {
    const visibleJuryoMatches = [...dayData.juryo.matches].sort((left, right) => right.boutNo - left.boutNo);
    const visibleIndex = boutNumberForWindow(
      visibleJuryoMatches.length,
      jstMinutes - LIVE_START_MINUTES,
      MAKUUCHI_START_MINUTES - LIVE_START_MINUTES,
    ) - 1;
    return divisionAnchorId('十両', visibleJuryoMatches[visibleIndex].boutNo);
  }

  if (jstMinutes >= MAKUUCHI_START_MINUTES && jstMinutes < LIVE_END_MINUTES && dayData.makuuchi.matches.length > 0) {
    const boutNo = boutNumberForWindow(
      dayData.makuuchi.matches.length,
      jstMinutes - MAKUUCHI_START_MINUTES,
      LIVE_END_MINUTES - MAKUUCHI_START_MINUTES,
    );
    return divisionAnchorId('幕内', boutNo);
  }

  if (dayData.juryo.matches.length > 0) {
    const firstJuryoBoutNo = [...dayData.juryo.matches].sort((left, right) => left.boutNo - right.boutNo)[0].boutNo;
    return divisionAnchorId('十両', firstJuryoBoutNo);
  }
  if (dayData.makuuchi.matches.length > 0) {
    return divisionAnchorId('幕内', 1);
  }
  return null;
}

export function jstIsoDateOfDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

export function buildLiveTorikumiTarget(
  archive: TorikumiDataSet,
  data: TorikumiDataSet,
  jstMinutes: number = jstMinutesOfDay(),
): LiveTorikumiTarget {
  const currentIsoDate = jstIsoDateOfDay(new Date());
  const upcomingScheduleDay = [...(archive.scheduleDays ?? [])]
    .sort((left, right) => left.isoDate.localeCompare(right.isoDate))
    .find((day) => day.isoDate >= currentIsoDate);

  if (upcomingScheduleDay) {
    const resultDay = archive.resultDays?.find((day) => day.pathDate === upcomingScheduleDay.pathDate);
    if (!resultDay) {
      return {
        href: `${CURRENT_RESULT_PATH}/`,
        description: '取組データの更新を待機中です。',
      };
    }

    const dayData = [
      resultDay.data,
      upcomingScheduleDay.data,
      data.today,
      data.tomorrow,
    ].find((candidate) => (
      dayOfDailyData(candidate) === upcomingScheduleDay.day && hasAnyMatches(candidate)
    ));
    const anchor = dayData ? nearestTorikumiAnchor(dayData, jstMinutes) : null;
    const description = upcomingScheduleDay.isoDate === currentIsoDate
      ? 'JST 13:00-18:00 は現在時刻に近い取組結果へ移動します。'
      : '開催前も取組予定を反映した結果ページへ移動します。場所中は速報位置へ切り替わります。';

    return {
      href: `${getDayPath(resultDay, 'result')}${anchor ? `#${anchor}` : ''}`,
      description,
    };
  }

  return {
    href: `${CURRENT_RESULT_PATH}/`,
    description: '取組データの更新を待機中です。',
  };
}

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const currentBashoTitle = formatBashoTitle(
    { year: torikumiArchive.year, bashoName: torikumiArchive.bashoName, monthKey: torikumiMonthKey },
    i18n.language,
  );
  const finalBashoName = getFinalBashoName(
    { bashoName: torikumiArchive.bashoName, monthKey: torikumiMonthKey },
    i18n.language,
  );
  const currentBanzukePath = getBanzukePathForMonthKey(torikumiMonthKey);
  const bashoStatus = getBashoStatus(torikumiArchive);
  const liveTorikumiTarget = buildLiveTorikumiTarget(torikumiArchive, torikumiData);
  const featuredTorikumiTarget = bashoStatus.kind === 'final'
    ? { href: `${CURRENT_RESULT_PATH}/`, description: t('home.finalResultsDescription') }
    : liveTorikumiTarget;
  const openingDay = torikumiArchive.scheduleDays?.[0];
  const isOpeningBoutPublished = Boolean(
    openingDay && hasAnyMatches(openingDay.data),
  );
  const dayDiff = openingDay?.isoDate
    ? getCalendarDayDiffJst(openingDay.isoDate)
    : null;
  const openingBoutPath = openingDay ? getDayPath(openingDay, 'schedule') : undefined;

  const quickNavItems = getHomeQuickNavItems(
    bashoStatus,
    {
      banzuke: currentBanzukePath,
      schedule: `${CURRENT_SCHEDULE_PATH}/`,
      result: `${CURRENT_RESULT_PATH}/`,
      live: featuredTorikumiTarget.href,
    },
    i18n.language,
    {
      isOpeningBoutPublished,
      dayDiff,
      openingBoutPath,
    },
  );

  return (
    <div className={homeContainerClassName()}>
      <header className="home-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <div className="header-content">
          <h1 className="home-title">{t('home.siteTitle')}</h1>
          <p className="home-subtitle">{t('home.siteSubtitle')}</p>
        </div>
      </header>

      <main className="home-main">
        {/* Current Basho - Hero Section (Smart Hub) */}
        <section className="hero-section" aria-labelledby="hero-basho-title">
          <div className="hero-editorial-copy">
            <h2 id="hero-basho-title" className="hero-basho-title">
              {currentBashoTitle}
            </h2>
            <p className="hero-day-indicator" aria-live="polite">
              {bashoStatus.kind === 'live'
                ? t('home.heroDayIndicator', { day: bashoStatus.day })
                : bashoStatus.kind === 'upcoming'
                  ? t('home.heroPreBashoStatus')
                  : t('home.heroFinalStatus')}
            </p>
            <p className="hero-description">
              {bashoStatus.kind === 'final'
                ? t('home.heroFinalDescription', { bashoName: finalBashoName })
                : bashoStatus.kind === 'upcoming'
                  ? t('home.heroUpcomingDescription')
                  : t('home.heroLiveDescription')}
            </p>

            {/* Smart Hub 4 Quick Navs */}
            <nav className="home-quick-nav hero-actions" aria-label={t('home.heroActionsLabel')}>
              {quickNavItems.map((item) => (
                <Link
                  key={`${item.to}-${item.labelKey}`}
                  to={item.to}
                  className={`quick-nav-card${item.primary ? ' primary' : ''}`}
                >
                  <span className="quick-nav-card__label">
                    {t(item.labelKey, { date: item.date, relative: item.relative })}
                    {item.badgeKey ? <span className="quick-nav-card__badge">{t(item.badgeKey)}</span> : null}
                  </span>
                  <span className="quick-nav-card__sub">{t(item.subKey, { date: item.date, relative: item.relative })}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Daily Highlights Section (今日のみどころ・注目取組) */}
          <DailyHighlightsSection
            monthKey={torikumiMonthKey}
            archive={torikumiArchive}
            bashoStatus={bashoStatus}
          />
        </section>

        {/* Secondary updates moved below the hero */}
        <BlogUpdatesSection />

        <div className="home-feature-grid">
          <section className="analytics-feature-card" aria-labelledby="analytics-feature-title">
            <div className="analytics-feature-copy">
              <p className="analytics-feature-label">
                {t('home.analyticsFeatureLabel')}
                <br />
                <span>{t('home.analyticsFeatureAvailability')}</span>
              </p>
              <h2 id="analytics-feature-title" className="analytics-feature-title">{t('home.analyticsFeatureTitle')}</h2>
              <p className="analytics-feature-description">
                {t('home.analyticsFeatureDescription')}
              </p>
            </div>
            <Link to="/analytics/" className="analytics-feature-link">
              {t('home.analyticsFeatureAction')}
            </Link>
          </section>

          {/* Kimarite Card Section */}
          <KimariteCard />
        </div>

        <NewsSection />

        {PAST_BASHO.map((pastBasho) => (
          <section key={pastBasho.id} className="past-basho-section">
            <h2 className="past-basho-heading">
              {formatBashoTitle({ year: pastBasho.year, bashoName: pastBasho.name, monthKey: pastBasho.id }, i18n.language)}
            </h2>
            <nav className="past-basho-actions" aria-label={`${pastBasho.name}への導線`}>
              <Link to={`${pastBasho.banzukePath}/`} className="cta-button secondary">
                {t('home.heroBanzuke')}
              </Link>
              <Link to={`${pastBasho.schedulePath}/`} className="cta-button secondary">
                {t('home.heroSchedule')}
              </Link>
              <Link to={`${pastBasho.resultPath}/`} className="cta-button secondary">
                {t('home.heroResult')}
              </Link>
            </nav>
          </section>
        ))}
        <div className="past-basho-index-action">
          <Link to="/archives/" className="past-basho-index-link">
            {t('home.pastBashoAll')}
          </Link>
        </div>

        {/* Hero illustration moved to the very bottom of the page */}
        <div className="home-illustration" aria-hidden="true">
          <span className="hero-sun" />
          <span className="hero-dohyo" />
          <span className="hero-shikiri hero-shikiri-left" />
          <span className="hero-shikiri hero-shikiri-right" />
        </div>
      </main>

      <footer className="home-footer">
        <p>{t('home.footerCopyright')}</p>
        <p className="home-footer-credit">{t('home.footerDataCredit')}</p>
        <nav aria-label="ホームの外部リンク">
          <HomeLink placement="footer" />
          {' | '}
          <Link to="/about/">{t('home.footerAbout')}</Link>
          {' | '}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">{t('home.footerDaisuke')}</a>
          {' | '}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">{t('home.footerGithub')}</a>
        </nav>
      </footer>
    </div>
  );
}
