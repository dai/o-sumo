import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getBanzukePathForMonthKey,
} from './lib/torikumi-routes';
import { torikumiArchive, torikumiMonthKey } from './lib/torikumi-data';
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from './lib/archive-basho-data';
import { PAST_BASHO } from './lib/archives-data';
import HomeLink from './components/HomeLink';
import './index.css';

export default function Home() {
  const { t } = useTranslation('common');
  const currentBashoTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
  const currentBanzukePath = getBanzukePathForMonthKey(torikumiMonthKey);

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
                >
                  {day.day}日
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
