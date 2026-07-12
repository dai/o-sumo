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
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from './lib/archive-basho-data';
import { PAST_BASHO } from './lib/archives-data';
import HomeLink from './components/HomeLink';
import NewsSection from './components/NewsSection';
import KimariteCard from './components/KimariteCard';
import { divisionAnchorId } from './lib/rikishi-display';
import './index.css';

const LIVE_START_MINUTES = 13 * 60;
const MAKUUCHI_START_MINUTES = 15 * 60 + 30;
const LIVE_END_MINUTES = 18 * 60;

type LiveState =
  | { kind: 'in-progress'; day: number }
  | { kind: 'pre-basho' }
  | { kind: 'frozen'; lastUpdatedLabel: string };

type LiveTorikumiTarget = {
  href: string;
  description: string;
};

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
    const firstVisibleJuryo = [...dayData.juryo.matches].sort((left, right) => right.boutNo - left.boutNo)[0];
    return divisionAnchorId('十両', firstVisibleJuryo.boutNo);
  }
  if (dayData.makuuchi.matches.length > 0) {
    return divisionAnchorId('幕内', 1);
  }
  return null;
}

export function buildLiveTorikumiTarget(
  archive: TorikumiDataSet,
  data: TorikumiDataSet,
  jstMinutes: number = jstMinutesOfDay(),
): LiveTorikumiTarget {
  const todayDay = dayOfDailyData(data.today);
  if (todayDay !== null) {
    const resultDay = archive.resultDays?.find((day) => day.day === todayDay);
    const scheduleDay = archive.scheduleDays?.find((day) => day.day === todayDay);
    const day = resultDay ?? scheduleDay;
    const dayData = hasAnyMatches(data.today) ? data.today : scheduleDay?.data ?? resultDay?.data;
    const anchor = dayData ? nearestTorikumiAnchor(dayData, jstMinutes) : null;
    return {
      href: day ? `${getDayPath(day, 'result')}${anchor ? `#${anchor}` : ''}` : `${CURRENT_RESULT_PATH}/`,
      description: 'JST 13:00-18:00 は現在時刻に近い取組結果へ移動します。',
    };
  }

  const tomorrowDay = dayOfDailyData(data.tomorrow);
  if (tomorrowDay !== null) {
    const resultDay = archive.resultDays?.find((day) => day.day === tomorrowDay);
    const scheduleDay = archive.scheduleDays?.find((day) => day.day === tomorrowDay);
    const dayData = hasAnyMatches(data.tomorrow) ? data.tomorrow : scheduleDay?.data ?? resultDay?.data;
    const anchor = dayData ? nearestTorikumiAnchor(dayData, jstMinutes) : null;
    return {
      href: resultDay ? `${getDayPath(resultDay, 'result')}${anchor ? `#${anchor}` : ''}` : `${CURRENT_RESULT_PATH}/`,
      description: '開催前も取組予定を反映した結果ページへ移動します。場所中は速報位置へ切り替わります。',
    };
  }

  return {
    href: `${CURRENT_RESULT_PATH}/`,
    description: '取組データの更新を待機中です。',
  };
}

function deriveLiveState(
  today: TorikumiDailyData | null | undefined,
  tomorrow: TorikumiDailyData | null | undefined,
  fallbackUpdatedAt: string,
  locale: string,
): LiveState {
  const todayDay = dayOfDailyData(today);
  if (todayDay !== null) {
    return { kind: 'in-progress', day: todayDay };
  }
  if (dayOfDailyData(tomorrow) === 1) {
    return { kind: 'pre-basho' };
  }
  return {
    kind: 'frozen',
    lastUpdatedLabel: formatUpdatedAtLabel(fallbackUpdatedAt, locale),
  };
}

function formatUpdatedAtLabel(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale.startsWith('ja')) {
    const yyyy = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mo}-${da} ${hh}:${mi} JST`;
  }
  const formatted = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(d);
  return `${formatted} JST`;
}

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ja';
  const currentBashoTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
  const currentBanzukePath = getBanzukePathForMonthKey(torikumiMonthKey);
  const liveState = deriveLiveState(
    torikumiData.today,
    torikumiData.tomorrow,
    torikumiArchive.updatedAt,
    locale,
  );
  const liveTorikumiTarget = buildLiveTorikumiTarget(torikumiArchive, torikumiData);

  return (
    <div className="home-container">
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
        {/* Current Basho - Hero Section */}
        <section className="hero-section" aria-labelledby="hero-basho-title">
          <h2 id="hero-basho-title" className="hero-basho-title">
            {currentBashoTitle}
          </h2>
          <p className="hero-day-indicator" aria-live="polite">
            {liveState.kind === 'in-progress'
              ? t('home.heroDayIndicator', { day: liveState.day })
              : liveState.kind === 'pre-basho'
                ? t('home.heroPreBashoStatus')
                : t('home.heroLastUpdated', { timeUtc: liveState.lastUpdatedLabel })}
          </p>
          <p className="hero-description">{t('home.heroDescription')}</p>
          <nav className="hero-actions" aria-label="主要ページへの導線">
            <Link to={currentBanzukePath} className="cta-button">
              {t('home.heroBanzuke')}
            </Link>
            <Link to={`${CURRENT_SCHEDULE_PATH}/`} className="cta-button secondary">
              {t('home.heroSchedule')}
            </Link>
            <Link to={`${CURRENT_RESULT_PATH}/`} className="cta-button secondary">
              {t('home.heroResult')}
            </Link>
            <Link to="/rikishi/" className="cta-button secondary">
              {t('home.heroRikishi')}
            </Link>
          </nav>
        </section>

        <section className="live-torikumi-section" aria-labelledby="live-torikumi-title">
          <div className="live-torikumi-copy">
            <h2 id="live-torikumi-title" className="live-torikumi-title">
              現在の取組、速報中！
            </h2>
            <p>{liveTorikumiTarget.description}</p>
          </div>
          <Link to={liveTorikumiTarget.href} className="live-torikumi-link">
            速報を見る
          </Link>
        </section>

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
              <Link to={`${pastBasho.bandukePath}/`} className="cta-button secondary">
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

