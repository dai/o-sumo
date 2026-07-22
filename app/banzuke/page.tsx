import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BanzukeTable from '../components/BanzukeTable';
import SortToggle from '../components/SortToggle';
import { type SortOrder, sortRankGroups } from '../lib/sorting';
import { getArchiveRouteConfigForPathname, getHubPathForMonthKey } from '../lib/torikumi-routes';
import HomeLink from '../components/HomeLink';
import './page.css';
import { formatGregorianBashoLabel } from '../lib/basho-meta';
import { formatUpdatedAt } from '../lib/updated-at';
import { getBanzukeDataByMonthKey } from '../lib/archive-basho-data';

function useBanzukeContext() {
  const location = useLocation();
  const routeConfig = getArchiveRouteConfigForPathname(location.pathname);
  const monthKey = routeConfig.monthKey;
  const banzuke = getBanzukeDataByMonthKey(monthKey);

  return {
    monthKey,
    bashoTitle: `${banzuke.year}${banzuke.bashoName}`,
    gregorianBashoLabel: formatGregorianBashoLabel(monthKey),
    banzukePath: routeConfig.banzukePath,
    resultPath: routeConfig.resultPath,
    updatedAt: banzuke.updatedAt,
    makuuchi: banzuke.makuuchi,
    juryo: banzuke.juryo,
  };
}

export default function BanzukePage() {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const { t } = useTranslation('common');
  const { bashoTitle, gregorianBashoLabel, banzukePath, monthKey, updatedAt, makuuchi, juryo: juryoRanks } = useBanzukeContext();
  const sortedMakuuchi = sortRankGroups(makuuchi, sortOrder);
  const sortedJuryo = sortRankGroups(juryoRanks, sortOrder);

  return (
    <div className="page-container">
      <header className="page-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <div className="header-content">
          <h1 className="page-title">{t('banzuke.pageTitle')}</h1>
          <h2 className="page-subtitle">{bashoTitle} {t('banzuke.banzukeListTitle')}</h2>
          <p className="page-description">{t('banzuke.pageDescription', { gregorianBasho: gregorianBashoLabel, banzukePath })}</p>
          <p className="page-description">{t('banzuke.updatedAt', { date: formatUpdatedAt(updatedAt) })}</p>
        </div>
      </header>

      <main className="page-main">
        <section className="page-toolbar">
          <SortToggle value={sortOrder} onChange={setSortOrder} label={t('banzuke.sortLabel')} />
        </section>

        <section className="banzuke-section">
          <h2 className="section-heading">{t('banzuke.makuuchi')}</h2>
          <div className="banzuke-list">
            {sortedMakuuchi.map((rankGroup, index) => (
              <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
            ))}
          </div>
        </section>

        <section className="banzuke-section">
          <h2 className="section-heading">{t('banzuke.juryo')}</h2>
          <div className="banzuke-list">
            {sortedJuryo.map((rankGroup, index) => (
              <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
            ))}
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-heading">{t('banzuke.aboutThisPage')}</h2>
          <div className="info-content">
            <p>
              {t('banzuke.aboutDescription1', { bashoTitle, gregorianBasho: gregorianBashoLabel })}
            </p>
            <p>
              {t('banzuke.aboutDescription2')}
            </p>
            <p>
              {t('banzuke.techStack')}
            </p>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <p>{t('banzuke.footerCopyright')}</p>
        <nav aria-label="番付ページの関連リンク">
          <HomeLink placement="footer" />
          {" | "}
          <Link to={getHubPathForMonthKey(monthKey, 'result')}>{t('banzuke.footerResult')}</Link>
          {" | "}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">
            {t('banzuke.footerDaisuke')}
          </a>
          {" | "}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            {t('banzuke.footerGithub')}
          </a>
        </nav>
      </footer>
    </div>
  );
}
