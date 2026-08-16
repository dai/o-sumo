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
import BashoContextBar from './components/BashoContextBar';
import { getBashoStatus, type BashoStatus } from './lib/basho-status';
import NewsSection from './components/NewsSection';
import KimariteCard from './components/KimariteCard';
import { divisionAnchorId } from './lib/rikishi-display';
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
  const locale = i18n.language || 'ja';
  const currentBashoTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
  const currentBanzukePath = getBanzukePathForMonthKey(torikumiMonthKey);
  const bashoStatus = getBashoStatus(torikumiArchive);
  const liveTorikumiTarget = buildLiveTorikumiTarget(torikumiArchive, torikumiData);
  const featuredTorikumiTarget = bashoStatus.kind === 'final'
    ? { href: `${CURRENT_RESULT_PATH}/`, description: t('home.finalResultsDescription') }
    : liveTorikumiTarget;
  const heroActions = getHomeHeroActions(bashoStatus, {
    banzuke: currentBanzukePath,
    schedule: `${CURRENT_SCHEDULE_PATH}/`,
    result: `${CURRENT_RESULT_PATH}/`,
    live: featuredTorikumiTarget.href,
  });

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
        <BashoContextBar
          archive={torikumiArchive}
          bashoTitle={currentBashoTitle}
          resultPath={`${CURRENT_RESULT_PATH}/`}
          schedulePath={`${CURRENT_SCHEDULE_PATH}/`}
          updatedAt={torikumiArchive.updatedAt}
          status={bashoStatus}
        />
        {/* Current Basho - Hero Section */}
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
                ? t('home.heroFinalDescription')
                : bashoStatus.kind === 'upcoming'
                  ? t('home.heroUpcomingDescription')
                  : t('home.heroLiveDescription')}
            </p>
            <nav className="hero-actions" aria-label={t('home.heroActionsLabel')}>
              {heroActions.map((action) => (
                <Link key={action.to} to={action.to} className={`cta-button${action.primary ? '' : ' secondary'}`}>
                  {t(action.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <span className="hero-sun" />
            <span className="hero-dohyo" />
            <span className="hero-shikiri hero-shikiri-left" />
            <span className="hero-shikiri hero-shikiri-right" />
          </div>
        </section>

        <div className="home-feature-grid">
          <section className="live-torikumi-section" aria-labelledby="live-torikumi-title">
            <div className="live-torikumi-copy">
              <h2 id="live-torikumi-title" className="live-torikumi-title">
                {bashoStatus.kind === 'final' ? t('home.finalResultsTitle') : t('home.liveTorikumiTitle')}
              </h2>
              <p>{featuredTorikumiTarget.description}</p>
            </div>
            <Link to={featuredTorikumiTarget.href} className="live-torikumi-link">
              {bashoStatus.kind === 'final' ? t('home.finalResultsAction') : t('home.liveTorikumiAction')}
            </Link>
          </section>

          <section className="analytics-feature-card" aria-labelledby="analytics-feature-title">
            <div className="analytics-feature-copy">
              <p className="analytics-feature-label">{t('home.analyticsFeatureLabel')}</p>
              <h2 id="analytics-feature-title" className="analytics-feature-title">{t('home.analyticsFeatureTitle')}</h2>
              <p className="analytics-feature-description">
                {t('home.analyticsFeatureDescription')}
              </p>
            </div>
            <Link to="/analytics/" className="analytics-feature-link">
              {t('home.analyticsFeatureAction')}
            </Link>
          </section>
        </div>

        <NewsSection />

        <KimariteCard />

        {PAST_BASHO.map((pastBasho) => (
          <section key={pastBasho.id} className="past-basho-section">
            <h2 className="past-basho-heading">
              {t('home.pastBashoHeading', {
                year: pastBasho.year,
                name: pastBasho.name,
              })}
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
            <div className="past-basho-days">
              <p className="past-basho-days-label">{t('home.pastBashoDays')}</p>
              {pastBasho.data.resultDays?.map((day) => (
                <Link
                  key={day.pathDate}
                  to={`/${day.pathDate}-torikumi/`}
                  className="past-basho-day-link"
                  aria-label={t('torikumi.day.dayHead', { day: day.day })}
                >
                  <span className="past-basho-day-num">{day.day}</span>
                  <span className="past-basho-day-suffix" aria-hidden="true">
                    {locale.startsWith('ja') ? '日' : ''}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="home-footer">
        <p>{t('home.footerCopyright')}</p>
        <p className="home-footer-credit">{t('home.footerDataCredit')}</p>
        <nav aria-label="ホームの外部リンク">
          <HomeLink placement="footer" />
          {' | '}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">{t('home.footerDaisuke')}</a>
          {' | '}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">{t('home.footerGithub')}</a>
        </nav>
      </footer>
    </div>
  );
}
