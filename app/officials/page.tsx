import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import ShareCurrentLink from '../components/ShareCurrentLink';
import { usePageMetaOverride } from '../components/MetaHead';
import { formatUpdatedAt } from '../lib/updated-at';
import { toRomaji } from '../lib/romaji';
import { matchesSearch } from '../lib/search';
import { useDirectorySearchQuery } from '../lib/directory-search';
import {
  fetchOfficialIndex, fetchOfficialProfile, officialApiPath, officialIndexApiPath,
  officialListPath, officialProfilePath, type OfficialKind, type OfficialIndexItem, type OfficialProfile,
} from '../lib/official-profile';
import '../rikishi/page.css';

export function OfficialListPage({ kind }: { kind: OfficialKind }) {
  const { t, i18n } = useTranslation('common');
  const [directory, setDirectory] = React.useState<{
    kind: OfficialKind | null;
    items: OfficialIndexItem[];
    retrievedAt: string;
    source: string;
    status: 'loading' | 'ready' | 'error';
  }>({ kind: null, items: [], retrievedAt: '', source: '', status: 'loading' });
  const { query, searchParams, setSearchParams, queryInputProps } = useDirectorySearchQuery();
  React.useEffect(() => {
    let active = true;
    setDirectory({ kind, items: [], retrievedAt: '', source: '', status: 'loading' });
    fetchOfficialIndex(kind).then((data) => {
      if (active) {
        setDirectory({
          kind,
          items: data.officials,
          retrievedAt: data.retrievedAt,
          source: data.source,
          status: 'ready',
        });
      }
    }).catch(() => active && setDirectory({ kind, items: [], retrievedAt: '', source: '', status: 'error' }));
    return () => { active = false; };
  }, [kind]);
  const isCurrentDirectory = directory.kind === kind;
  const items = isCurrentDirectory ? directory.items : [];
  const retrievedAt = isCurrentDirectory ? directory.retrievedAt : '';
  const source = isCurrentDirectory ? directory.source : '';
  const status = isCurrentDirectory ? directory.status : 'loading';
  const label = t(`officials.${kind}`);
  const rankLabel = (item: OfficialIndexItem) => i18n.resolvedLanguage === 'ja'
    ? item.rank
    : t(`officials.ranks.${item.rankCode}`);
  const rankCodes = React.useMemo(() => [...new Set(items.map((item) => item.rankCode))], [items]);
  const requestedRankCode = searchParams.get('rank') ?? 'all';
  const rankCode = rankCodes.some((code) => code === requestedRankCode) ? requestedRankCode : 'all';
  const activeRankLabel = rankCode === 'all' ? '' : t(`officials.ranks.${rankCode}`);
  const setFilters = React.useCallback((nextQuery: string, nextRankCode: string, replace = true) => {
    const next = new URLSearchParams(searchParams);
    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery) next.set('q', normalizedQuery);
    else next.delete('q');
    if (nextRankCode === 'all') next.delete('rank');
    else next.set('rank', nextRankCode);
    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams]);
  const filteredItems = React.useMemo(() => items.filter((item) => (
    (rankCode === 'all' || item.rankCode === rankCode)
    && matchesSearch(query, item.name, item.yomi, toRomaji(item.yomi), item.rank, rankLabel(item))
  )), [items, query, rankCode, i18n.resolvedLanguage]);
  const hasFilters = Boolean(query.trim()) || rankCode !== 'all';
  const clearFilters = () => {
    setFilters('', 'all', false);
  };
  return <div className="rikishi-page">
    <header className="rikishi-header"><nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
      <h1>{t('officials.listTitle', { label })}</h1><p>{t('officials.listDescription', { label })}</p>
      {source && <p><a href={source} target="_blank" rel="noopener noreferrer">{t('officials.sourceLink')}</a></p>}
      {retrievedAt && <p>{t('officials.retrievedAt', { date: formatUpdatedAt(retrievedAt) })}</p>}
      <p>{t('officials.noPhotos')}</p>
    </header>
    <main className="rikishi-main">
      {status === 'loading' && <p className="rikishi-status">{t('rikishi.loading')}</p>}
      {status === 'error' && <p className="rikishi-status warning">{t('officials.loadError')}</p>}
      {status === 'ready' && <section className="rikishi-grid-section" aria-label={t('officials.listTitle', { label })}>
        <div className="directory-search">
          <label className="directory-search__label" htmlFor={`${kind}-search`}>{t('officials.searchLabel', { label })}</label>
          <input id={`${kind}-search`} className="directory-search__input" type="search" {...queryInputProps} placeholder={t('officials.searchPlaceholder')} />
          <label className="directory-search__label" htmlFor={`${kind}-rank`}>{t('officials.rankFilterLabel')}</label>
          <select id={`${kind}-rank`} className="directory-search__select" value={rankCode} onChange={(event) => setFilters(query, event.target.value, false)}>
            <option value="all">{t('officials.rankFilterAll')}</option>
            {rankCodes.map((code) => <option key={code} value={code}>{t('officials.rankFilterOption', { rank: t(`officials.ranks.${code}`) })}</option>)}
          </select>
          <div className="directory-search__feedback">
            <p className="directory-search__count" role="status" aria-live="polite">
              {t('officials.searchResultCount', { count: filteredItems.length, total: items.length })}
            </p>
            <ShareCurrentLink />
            {hasFilters ? (
              <div className="directory-filter-chips" aria-label={t('officials.activeFiltersLabel')}>
                {query.trim() ? (
                  <button type="button" className="directory-filter-chip" onClick={() => setFilters('', rankCode, false)}>
                    {t('officials.activeQuery', { query })} <span aria-hidden="true">×</span>
                  </button>
                ) : null}
                {rankCode !== 'all' ? (
                  <button type="button" className="directory-filter-chip" onClick={() => setFilters(query, 'all', false)}>
                    {t('officials.activeRank', { rank: activeRankLabel })} <span aria-hidden="true">×</span>
                  </button>
                ) : null}
                <button type="button" className="directory-search__reset" onClick={clearFilters}>{t('officials.clearFilters')}</button>
              </div>
            ) : null}
          </div>
        </div>
        {filteredItems.length === 0 ? <p className="directory-search__empty">{t('officials.searchEmpty', { label })}</p> : null}
        <div className="rikishi-profile-grid">
        {filteredItems.map((item) => <Link key={item.id} to={officialProfilePath(kind, item.id)} className="rikishi-profile-card">
          <span className="rikishi-card-rank">{rankLabel(item)}</span><span className="rikishi-card-name">{item.name}</span>
          <span className="rikishi-card-yomi">{item.yomi}</span><span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
        </Link>)}
        </div>
      </section>}
    </main>
    <footer className="rikishi-footer"><HomeLink placement="footer" /> <span> | </span><a href={officialIndexApiPath(kind)}>{t('officials.indexJson')}</a></footer>
  </div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rikishi-profile-field"><dt>{label}</dt><dd>{value || '—'}</dd></div>;
}

export function OfficialProfilePage({ kind }: { kind: OfficialKind }) {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation('common');
  const [detail, setDetail] = React.useState<{
    kind: OfficialKind | null;
    id: string;
    profile: OfficialProfile | null;
    status: 'loading' | 'ready' | 'not-found' | 'error';
  }>({ kind: null, id: '', profile: null, status: 'loading' });
  React.useEffect(() => {
    let active = true;
    setDetail({ kind, id, profile: null, status: 'loading' });
    fetchOfficialProfile(kind, id)
      .then((profile) => {
        if (active) setDetail({ kind, id, profile, status: profile ? 'ready' : 'not-found' });
      })
      .catch(() => {
        if (active) setDetail({ kind, id, profile: null, status: 'error' });
      });
    return () => { active = false; };
  }, [kind, id]);
  const label = t(`officials.${kind}`);
  const isCurrentDetail = detail.kind === kind && detail.id === id;
  const status = isCurrentDetail ? detail.status : 'loading';
  const currentProfile = isCurrentDetail && detail.status === 'ready' ? detail.profile : null;
  const rankLabel = currentProfile
    ? (i18n.resolvedLanguage === 'ja'
      ? currentProfile.rank
      : t(`officials.ranks.${currentProfile.rankCode}`))
    : '';
  usePageMetaOverride(currentProfile ? {
    pathname: officialProfilePath(kind, currentProfile.id),
    title: t('officials.profileMetaTitle', { name: currentProfile.name, label }),
    description: t('officials.profileMetaDescription', { name: currentProfile.name, label }),
  } : null);
  return <div className="rikishi-page">
    <header className="rikishi-header"><nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
      <h1>{currentProfile?.name ?? t('officials.detailTitle', { label })}</h1>{currentProfile && <p>{rankLabel} / {toRomaji(currentProfile.yomi)}</p>}
    </header>
    <main className="rikishi-main">
      {status === 'loading' && <p className="rikishi-status">{t('rikishi.loading')}</p>}
      {status === 'error' && <p className="rikishi-status warning">{t('officials.loadError')}</p>}
      {status === 'not-found' && <section className="rikishi-status warning"><h2>{t('officials.notFound')}</h2><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></section>}
      {status === 'ready' && currentProfile && <article className="rikishi-profile-detail">
        <div className="rikishi-profile-hero rikishi-profile-hero--no-photo"><div><p className="rikishi-profile-rank">{rankLabel}</p><h2>{currentProfile.name}</h2><p>{currentProfile.yomi} / {toRomaji(currentProfile.yomi)}</p><a href={currentProfile.sourceUrl} target="_blank" rel="noopener noreferrer" className="rikishi-action-link">{t('officials.sourceLink')}</a></div></div>
        <dl className="rikishi-profile-fields"><Field label={t('officials.stageName')} value={currentProfile.name}/><Field label={t('officials.rank')} value={rankLabel}/><Field label={t('officials.realName')} value={currentProfile.realName}/><Field label={t('officials.affiliation')} value={currentProfile.affiliation}/><Field label={t('rikishi.birthDate')} value={currentProfile.birthDate}/><Field label={t('officials.birthplace')} value={currentProfile.birthplace}/><Field label={t('officials.adoptedAt')} value={currentProfile.adoptedAt}/>{currentProfile.nameHistory?.length ? <Field label={t('officials.nameHistory')} value={currentProfile.nameHistory.join(' → ')}/> : null}</dl>
        <section className="rikishi-profile-source"><h2>{t('rikishi.sourceHeading')}</h2><p>{t('officials.sourceDescription')}</p><p>{t('officials.noPhotos')}</p><code>{officialApiPath(kind, currentProfile.id)}</code><p>{t('officials.retrievedAt', { date: formatUpdatedAt(currentProfile.retrievedAt) })}</p></section>
      </article>}
    </main>
    <footer className="rikishi-footer"><HomeLink placement="footer" /> <span> | </span><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></footer>
  </div>;
}
