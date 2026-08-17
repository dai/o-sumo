import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import MyRikishiToggle from '../components/MyRikishiToggle';
import ShareCurrentLink from '../components/ShareCurrentLink';
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from '../lib/rikishi-profile';
import { toRomaji } from '../lib/romaji';
import { formatUpdatedAt } from '../lib/updated-at';
import { matchesSearch } from '../lib/search';
import { useDirectorySearchQuery } from '../lib/directory-search';
import './page.css';

type RikishiDivision = 'all' | 'makuuchi' | 'juryo';

export function normalizeRikishiDivision(value: string | null): RikishiDivision {
  return value === 'makuuchi' || value === 'juryo' ? value : 'all';
}

function updateRikishiSearchParams(
  current: URLSearchParams,
  query: string,
  division: RikishiDivision,
): URLSearchParams {
  const next = new URLSearchParams(current);
  const normalizedQuery = query.trim();

  if (normalizedQuery) next.set('q', normalizedQuery);
  else next.delete('q');

  if (division === 'all') next.delete('division');
  else next.set('division', division);

  return next;
}

export default function RikishiPage() {
  const { t } = useTranslation('common');
  const { query, searchParams, setSearchParams, queryInputProps } = useDirectorySearchQuery();
  const [rikishi, setRikishi] = React.useState<RikishiIndexItem[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState('');
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const division = normalizeRikishiDivision(searchParams.get('division'));
  const filteredRikishi = React.useMemo(() => rikishi.filter((item) => {
    const matchesDivision = division === 'all'
      || (division === 'juryo' ? item.currentRank.includes('十両') : !item.currentRank.includes('十両'));
    return matchesDivision && matchesSearch(query, item.name, item.yomi, toRomaji(item.yomi), item.currentRank);
  }), [division, query, rikishi]);

  const setFilters = React.useCallback((nextQuery: string, nextDivision: RikishiDivision, replace = true) => {
    setSearchParams(updateRikishiSearchParams(searchParams, nextQuery, nextDivision), { replace });
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    let active = true;

    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        setRikishi(data.rikishi);
        setUpdatedAt(data.updatedAt);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1>{t('rikishi.listTitle')}</h1>
        <p>{t('rikishi.listDescription')}</p>
        {updatedAt ? <p>{t('rikishi.updatedAt', { date: formatUpdatedAt(updatedAt) })}</p> : null}
      </header>

      <main className="rikishi-main">
        {status === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {status === 'error' ? <p className="rikishi-status warning">{t('rikishi.loadError')}</p> : null}
        {status === 'ready' ? (
          <section className="rikishi-grid-section" aria-label={t('rikishi.listTitle')}>
            <div className="directory-search">
              <label className="directory-search__label" htmlFor="rikishi-search">{t('rikishi.searchLabel')}</label>
              <input
                id="rikishi-search"
                className="directory-search__input"
                type="search"
                {...queryInputProps}
                placeholder={t('rikishi.searchPlaceholder')}
              />
              <label className="directory-search__label" htmlFor="rikishi-division">{t('rikishi.divisionLabel')}</label>
              <select
                id="rikishi-division"
                className="directory-search__select"
                value={division}
                onChange={(event) => setFilters(query, event.target.value as RikishiDivision, false)}
              >
                <option value="all">{t('rikishi.divisionAll')}</option>
                <option value="makuuchi">{t('rikishi.divisionMakuuchi')}</option>
                <option value="juryo">{t('rikishi.divisionJuryo')}</option>
              </select>
              <p className="directory-search__count" role="status" aria-live="polite">
                {t('rikishi.searchResultCount', { count: filteredRikishi.length })}
              </p>
              <ShareCurrentLink />
            </div>
            {filteredRikishi.length === 0 ? <p className="directory-search__empty">{t('rikishi.searchEmpty')}</p> : null}
            <div className="rikishi-profile-grid">
              {filteredRikishi.map((item) => (
                <article key={item.id} className="rikishi-profile-card">
                  <Link to={rikishiProfilePath(item.id)} className="rikishi-profile-card__link">
                    <span className="rikishi-card-rank">{item.currentRank}</span>
                    <span className="rikishi-card-name">{item.name}</span>
                    <span className="rikishi-card-yomi">{item.yomi}</span>
                    <span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
                  </Link>
                  <MyRikishiToggle rikishiId={item.id} />
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}>
          <HomeLink placement="footer" />
          <span> | </span>
          <a href="/api/v1/rikishi.json">{t('rikishi.indexJsonLink')}</a>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            {t('banzuke.footerGithub')}
          </a>
        </nav>
      </footer>
    </div>
  );
}
