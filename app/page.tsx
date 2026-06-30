import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getBanzukePathForMonthKey,
} from './lib/torikumi-routes';
import {
  torikumiArchive,
  torikumiData,
  torikumiMonthKey,
  type TorikumiDailyData,
} from './lib/torikumi-data';
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from './lib/archive-basho-data';
import { PAST_BASHO } from './lib/archives-data';
import HomeLink from './components/HomeLink';
import './index.css';

type LiveState =
  | { kind: 'in-progress'; day: number }
  | { kind: 'pre-basho' }
  | { kind: 'frozen'; lastUpdatedLabel: string };

function dayOfDailyData(d: TorikumiDailyData | null | undefined): number | null {
  if (!d) return null;
  const makuuchiDay = d.makuuchi?.day;
  return typeof makuuchiDay === 'number' ? makuuchiDay : null;
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


