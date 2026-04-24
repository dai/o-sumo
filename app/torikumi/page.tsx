import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SortToggle from '../components/SortToggle';
import { type SortOrder, sortArchiveDays } from '../lib/sorting';
import { type TorikumiDataSet } from '../lib/torikumi-data';
import {
  getArchiveRouteConfigForPathname,
  getDayPath,
  type TorikumiPageMode,
} from '../lib/torikumi-routes';
import HomeLink from '../components/HomeLink';
import './page.css';

function useArchive(): { archive: TorikumiDataSet; resultPath: string; schedulePath: string; bandukePath: string } {
  const location = useLocation();
  const config = getArchiveRouteConfigForPathname(location.pathname);
  return {
    archive: config.archive,
    resultPath: config.resultPath,
    schedulePath: config.schedulePath,
    bandukePath: config.bandukePath,
  };
}

export default function TorikumiHubPage({ mode }: { mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const { archive, resultPath, schedulePath, bandukePath } = useArchive();
  const sourceDays = mode === 'result' ? archive.resultDays : archive.scheduleDays;
  const days = sortArchiveDays(sourceDays ?? [], sortOrder);
  const { t } = useTranslation('common');

  const modeLabel = mode === 'result'
    ? t('torikumi.hub.resultListTitle')
    : t('torikumi.hub.scheduleListTitle');
  const navModeLabel = mode === 'result'
    ? t('torikumi.hub.navResult')
    : t('torikumi.hub.navSchedule');

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1>{archive.year}{archive.bashoName}{modeLabel}</h1>
        <p>{t('torikumi.hub.updateDate', { date: archive.updatedAt })}</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">
              {mode === 'result' ? resultPath.slice(1) : schedulePath.slice(1)}
            </div>
            <h2>{t('torikumi.hub.dayArchiveHeading', { mode: modeLabel })}</h2>
            <p>
              {mode === 'result'
                ? t('torikumi.hub.resultArchiveDescription')
                : t('torikumi.hub.scheduleArchiveDescription')}
            </p>
          </div>
          <nav className="archive-nav" aria-label={`${modeLabel}一覧の主要導線`}>
            <Link
              to={mode === 'result' ? schedulePath : resultPath}
              className="archive-link"
            >
              {navModeLabel}
            </Link>
            <Link to={bandukePath} className="archive-link">{t('torikumi.hub.navBanduke')}</Link>
          </nav>
        </section>

        <section className="sort-toolbar-section">
          <SortToggle
            value={sortOrder}
            onChange={setSortOrder}
            label={t('torikumi.hub.sortLabel', { mode: modeLabel })}
          />
        </section>

        <section className="archive-grid-section">
          <div className="archive-grid">
            {days.map((day) => (
              <Link
                key={`${mode}-${day.pathDate}`}
                to={getDayPath(day, mode)}
                className={`archive-card${day.status === 'pending' ? ' pending' : ''}`}
              >
                <div className="archive-card-date">{day.pathDate}</div>
                <h3>{day.label}</h3>
                <p>{day.dayHead}</p>
                <p className={`archive-status${day.status === 'pending' ? ' pending' : ''}`}>
                  {day.statusMessage ?? t('torikumi.hub.statusPublished')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="torikumi-footer">
        <nav aria-label={`${modeLabel}一覧フッターリンク`}>
          <HomeLink placement="footer" />
          <span> | </span>
          <Link to={bandukePath}>{t('torikumi.hub.footerBanduke')}</Link>
          <span> | </span>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">{t('torikumi.hub.footerDaisuke')}</a>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">{t('torikumi.hub.footerGithub')}</a>
        </nav>
      </footer>
    </div>
  );
}
