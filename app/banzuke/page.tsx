import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BanzukeTable, { BanzukeLeaderboard } from '../components/BanzukeTable';
import SortToggle from '../components/SortToggle';
import ShareCurrentLink from '../components/ShareCurrentLink';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { type SortOrder, sortRankGroups } from '../lib/sorting';
import { getArchiveRouteConfigForPathname, getHubPathForMonthKey } from '../lib/torikumi-routes';
import HomeLink from '../components/HomeLink';
import './page.css';
import { formatGregorianBashoLabel, formatBashoTitle } from '../lib/basho-meta';
import { formatUpdatedAt } from '../lib/updated-at';
import { getBanzukeDataByMonthKey } from '../lib/archive-basho-data';
import type { RankGroup, Rikishi } from '../lib/sumo-data';
import { matchesSearch } from '../lib/search';
import { toRomaji } from '../lib/romaji';
import { useDirectorySearchQuery } from '../lib/directory-search';
import { useMyRikishi } from '../lib/my-rikishi';

function filterRankGroups(groups: RankGroup[], query: string): RankGroup[] {
  if (!query.trim()) return groups;
  return groups
    .map((group) => ({
      ...group,
      east: group.east.filter((rikishi) => matchesSearch(query, rikishi.name, rikishi.yomi, toRomaji(rikishi.yomi), rikishi.rank, group.title)),
      west: group.west.filter((rikishi) => matchesSearch(query, rikishi.name, rikishi.yomi, toRomaji(rikishi.yomi), rikishi.rank, group.title)),
    }))
    .filter((group) => group.east.length > 0 || group.west.length > 0);
}

function countRikishi(groups: RankGroup[]): number {
  return groups.reduce((total, group) => total + group.east.length + group.west.length, 0);
}

function useBanzukeContext(lang: string = 'ja') {
  const location = useLocation();
  const routeConfig = getArchiveRouteConfigForPathname(location.pathname);
  const monthKey = routeConfig.monthKey;
  const banzuke = getBanzukeDataByMonthKey(monthKey);

  return {
    monthKey,
    bashoTitle: formatBashoTitle({ year: banzuke.year, bashoName: banzuke.bashoName, monthKey }, lang),
    gregorianBashoLabel: formatGregorianBashoLabel(monthKey, lang),
    banzukePath: routeConfig.banzukePath,
    resultPath: routeConfig.resultPath,
    schedulePath: routeConfig.schedulePath,
    archive: routeConfig.archive,
    updatedAt: banzuke.updatedAt,
    makuuchi: banzuke.makuuchi,
    juryo: banzuke.juryo,
  };
}

function filterMyRikishiGroups(groups: RankGroup[], isSaved: (id: number) => boolean, enabled: boolean): RankGroup[] {
  if (!enabled) return groups;
  return groups
    .map((group) => ({
      ...group,
      east: group.east.filter((r) => isSaved(r.id)),
      west: group.west.filter((r) => isSaved(r.id)),
    }))
    .filter((group) => group.east.length > 0 || group.west.length > 0);
}

function sortLeaderboardRikishi(groups: RankGroup[], sortOrder: SortOrder): Rikishi[] {
  const rikishiList: Rikishi[] = [];
  groups.forEach((group) => {
    rikishiList.push(...group.east, ...group.west);
  });
  const sorted = [...rikishiList].sort((a, b) => {
    const aWins = a.wins ?? 0;
    const bWins = b.wins ?? 0;
    if (bWins !== aWins) return bWins - aWins;
    const aLosses = a.losses ?? 0;
    const bLosses = b.losses ?? 0;
    if (aLosses !== bLosses) return aLosses - bLosses;
    return 0;
  });
  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

export default function BanzukePage() {
  const { t, i18n } = useTranslation('common');
  const { isSaved } = useMyRikishi();
  const { query, searchParams, setSearchParams, queryInputProps } = useDirectorySearchQuery();
  const sortOrder: SortOrder = searchParams.get('sort') === 'desc' ? 'desc' : 'asc';
  const viewMode: 'banzuke' | 'leaderboard' = searchParams.get('view') === 'leaderboard' ? 'leaderboard' : 'banzuke';
  const myRikishiOnly = searchParams.get('my') === '1';

  const setDiscoveryState = React.useCallback((nextQuery: string, nextSortOrder: SortOrder, replace = true) => {
    const next = new URLSearchParams(searchParams);
    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery) next.set('q', normalizedQuery);
    else next.delete('q');
    if (nextSortOrder === 'asc') next.delete('sort');
    else next.set('sort', nextSortOrder);
    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams]);

  const setViewMode = (mode: 'banzuke' | 'leaderboard') => {
    const next = new URLSearchParams(searchParams);
    if (mode === 'banzuke') next.delete('view');
    else next.set('view', mode);
    setSearchParams(next, { replace: false });
  };

  const toggleMyRikishiOnly = () => {
    const next = new URLSearchParams(searchParams);
    if (myRikishiOnly) next.delete('my');
    else next.set('my', '1');
    setSearchParams(next, { replace: false });
  };

  const { bashoTitle, gregorianBashoLabel, monthKey, updatedAt, makuuchi, juryo: juryoRanks } = useBanzukeContext(i18n.language);
  const sortedMakuuchi = sortRankGroups(makuuchi, sortOrder);
  const sortedJuryo = sortRankGroups(juryoRanks, sortOrder);
  const filteredMakuuchi = filterRankGroups(sortedMakuuchi, query);
  const filteredJuryo = filterRankGroups(sortedJuryo, query);

  const displayedMakuuchi = filterMyRikishiGroups(filteredMakuuchi, isSaved, myRikishiOnly);
  const displayedJuryo = filterMyRikishiGroups(filteredJuryo, isSaved, myRikishiOnly);
  const resultCount = countRikishi(displayedMakuuchi) + countRikishi(displayedJuryo);

  const leaderboardMakuuchi = React.useMemo(() => {
    return sortLeaderboardRikishi(filteredMakuuchi, sortOrder);
  }, [filteredMakuuchi, sortOrder]);

  const leaderboardJuryo = React.useMemo(() => {
    return sortLeaderboardRikishi(filteredJuryo, sortOrder);
  }, [filteredJuryo, sortOrder]);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <div className="site-header-heading-group">
            <h1 className="page-title">{t('banzuke.pageTitle')}</h1>
            <h2 className="page-subtitle">{bashoTitle} {t('banzuke.banzukeListTitle')}</h2>
          </div>
        </div>
        <div className="site-header-desc-row">
          <p className="page-description">{t('banzuke.pageDescription', { gregorianBasho: gregorianBashoLabel })}</p>
        </div>
        <div className="site-header-meta-row">
          <p className="page-description">{t('banzuke.updatedAt', { date: formatUpdatedAt(updatedAt) })}</p>
        </div>
      </header>

      <main className="page-main">
        <PageBreadcrumb
          ariaLabel={t('rikishi.breadcrumbLabel')}
          items={[
            { label: t('global.homeLink'), href: '/' },
            { label: t('banzuke.crumb'), href: '/archives/' },
            { label: bashoTitle },
          ]}
        />
        <section className="page-toolbar banzuke-discovery" aria-label={t('banzuke.discoveryLabel')}>
          <label className="directory-search__label" htmlFor="banzuke-search">{t('banzuke.searchLabel')}</label>
          <input
            id="banzuke-search"
            className="directory-search__input"
            type="search"
            {...queryInputProps}
            placeholder={t('banzuke.searchPlaceholder')}
          />
          <p className="directory-search__count" role="status" aria-live="polite">
            {t('banzuke.searchResultCount', { count: resultCount })}
          </p>

          <div className="banzuke-view-controls">
            <button
              type="button"
              className={`banzuke-mode-btn${viewMode === 'banzuke' ? ' active' : ''}`}
              onClick={() => setViewMode('banzuke')}
              aria-pressed={viewMode === 'banzuke'}
            >
              {t('banzuke.viewBanzuke')}
            </button>
            <button
              type="button"
              className={`banzuke-mode-btn${viewMode === 'leaderboard' ? ' active' : ''}`}
              onClick={() => setViewMode('leaderboard')}
              aria-pressed={viewMode === 'leaderboard'}
            >
              {t('banzuke.viewLeaderboard')}
            </button>
            <button
              type="button"
              className={`banzuke-filter-btn${myRikishiOnly ? ' active' : ''}`}
              onClick={toggleMyRikishiOnly}
              aria-pressed={myRikishiOnly}
            >
              {t('banzuke.filterMyRikishi')}
            </button>
          </div>

          <nav className="directory-anchors" aria-label={t('banzuke.quickNavigation')}>
            <a href="#makuuchi">{t('banzuke.makuuchi')}</a>
            <a href="#juryo">{t('banzuke.juryo')}</a>
          </nav>
          <SortToggle value={sortOrder} onChange={(nextSortOrder) => setDiscoveryState(query, nextSortOrder, false)} label={t('banzuke.sortLabel')} />
          <ShareCurrentLink />
        </section>

        {viewMode === 'leaderboard' ? (
          <>
            <section className="banzuke-section" id="makuuchi">
              <BanzukeLeaderboard
                divisionTitle={t('banzuke.makuuchi')}
                rikishiList={leaderboardMakuuchi}
                monthKey={monthKey}
                myRikishiOnly={myRikishiOnly}
              />
            </section>
            <section className="banzuke-section" id="juryo">
              <BanzukeLeaderboard
                divisionTitle={t('banzuke.juryo')}
                rikishiList={leaderboardJuryo}
                monthKey={monthKey}
                myRikishiOnly={myRikishiOnly}
              />
            </section>
          </>
        ) : (
          <>
            <section className="banzuke-section" id="makuuchi">
              <h2 className="section-heading">{t('banzuke.makuuchi')}</h2>
              <div className="banzuke-list">
                {displayedMakuuchi.map((rankGroup, index) => (
                  <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
                ))}
              </div>
            </section>

            <section className="banzuke-section" id="juryo">
              <h2 className="section-heading">{t('banzuke.juryo')}</h2>
              <div className="banzuke-list">
                {displayedJuryo.map((rankGroup, index) => (
                  <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
                ))}
              </div>
            </section>
          </>
        )}
        {query.trim() && resultCount === 0 ? <p className="directory-search__empty">{t('banzuke.searchEmpty')}</p> : null}

        <section className="info-section">
          <h2 className="section-heading">{t('banzuke.aboutThisPage')}</h2>
          <div className="info-content">
            <p>
              {t('banzuke.aboutDescription1', { bashoTitle, gregorianBasho: gregorianBashoLabel })}
            </p>
            <p>
              {t('banzuke.aboutDescription2')}
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
