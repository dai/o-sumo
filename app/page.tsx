import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MARCH2026_BANDUKE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MAY2026_BANDUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';
import { MAY2026_TORIKUMI_DATA } from './lib/may2026-data';
import { MARCH2026_TORIKUMI_DATA } from './lib/torikumi-data';
import HomeLink from './components/HomeLink';
import './index.css';

export default function Home() {
  const { t } = useTranslation('common');
  const currentBashoTitle = `${MAY2026_TORIKUMI_DATA.year}${MAY2026_TORIKUMI_DATA.bashoName}`;

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
        <section className="hero-section">
          <h2>{currentBashoTitle}</h2>
          <p>{t('home.heroDescription')}</p>
          <nav className="hero-actions" aria-label="主要ページへの導線">
            <Link to={MAY2026_BANDUKE_PATH} className="cta-button">
              {t('home.heroBanzuke')}
            </Link>
            <Link to={MAY2026_SCHEDULE_PATH} className="cta-button secondary">
              {t('home.heroSchedule')}
            </Link>
            <Link to={MAY2026_RESULT_PATH} className="cta-button secondary">
              {t('home.heroResult')}
            </Link>
          </nav>
        </section>

        {/* Past Basho - March 2026 */}
        <section className="past-basho-section">
          <h2 className="past-basho-heading">
            {t('home.pastBashoHeading', {
              year: MARCH2026_TORIKUMI_DATA.year,
              name: MARCH2026_TORIKUMI_DATA.bashoName,
            })}
          </h2>
          <nav className="past-basho-actions" aria-label="三月場所への導線">
            <Link to={MARCH2026_BANDUKE_PATH} className="cta-button secondary">
              {t('home.heroBanzuke')}
            </Link>
            <Link to={MARCH2026_SCHEDULE_PATH} className="cta-button secondary">
              {t('home.heroSchedule')}
            </Link>
            <Link to={MARCH2026_RESULT_PATH} className="cta-button secondary">
              {t('home.heroResult')}
            </Link>
          </nav>
          <div className="past-basho-days">
            <p className="past-basho-days-label">{t('home.pastBashoDays')}</p>
            {MARCH2026_TORIKUMI_DATA.resultDays?.map((day) => (
              <Link
                key={day.pathDate}
                to={`/${day.pathDate}-torikumi`}
                className="past-basho-day-link"
              >
                {day.day}日
              </Link>
            ))}
          </div>
        </section>
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
