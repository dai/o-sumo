import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import { fetchRikishiIndex, fetchRikishiProfile, rikishiProfilePath, type RikishiIndexItem, type RikishiProfile } from '../lib/rikishi-profile';
import { matchesSearch } from '../lib/search';
import { toRomaji } from '../lib/romaji';
import './page.css';

const MAX_COMPARE_RIKISHI = 3;

export function normalizeCompareIds(serialized: string | null): number[] {
  if (!serialized) return [];
  return [...new Set(serialized.split(',').map((value) => Number(value)).filter((id) => Number.isInteger(id) && id > 0))]
    .slice(0, MAX_COMPARE_RIKISHI);
}

function setComparisonIds(params: URLSearchParams, ids: number[]): URLSearchParams {
  const next = new URLSearchParams(params);
  const normalized = normalizeCompareIds(ids.join(','));
  if (normalized.length) next.set('ids', normalized.join(','));
  else next.delete('ids');
  return next;
}

function textOrUnknown(value: string | undefined, unknown: string): string {
  return value?.trim() || unknown;
}

function numberOrUnknown(value: number | undefined, unit: string, unknown: string): string {
  return value && value > 0 ? `${value}${unit}` : unknown;
}

function careerRecord(profile: RikishiProfile, unknown: string): string {
  const { wins, losses, draws } = profile.careerStats;
  return wins || losses || draws ? `${wins}-${losses}-${draws}` : unknown;
}

function careerWinRate(profile: RikishiProfile, unknown: string): string {
  const { wins, losses, draws } = profile.careerStats;
  const total = wins + losses + draws;
  return total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : unknown;
}

type ComparisonRow = {
  label: string;
  value: (profile: RikishiProfile) => string;
};

export default function CompareRikishiPage() {
  const { t } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIds = normalizeCompareIds(searchParams.get('ids'));
  const [index, setIndex] = React.useState<RikishiIndexItem[]>([]);
  const [profiles, setProfiles] = React.useState<RikishiProfile[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [profileStatus, setProfileStatus] = React.useState<'idle' | 'loading' | 'ready'>('idle');
  const [query, setQuery] = React.useState('');
  const [selectionStatus, setSelectionStatus] = React.useState<'idle' | 'limit'>('idle');
  const unknown = t('rikishi.unknown');

  React.useEffect(() => {
    let active = true;
    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        setIndex(data.rikishi);
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

  React.useEffect(() => {
    let active = true;
    if (selectedIds.length === 0) {
      setProfiles([]);
      setProfileStatus('idle');
      return () => {
        active = false;
      };
    }

    setProfileStatus('loading');
    Promise.all(selectedIds.map((id) => fetchRikishiProfile(id)))
      .then((results) => {
        if (!active) return;
        const byId = new Map(results.filter((profile): profile is RikishiProfile => Boolean(profile)).map((profile) => [profile.id, profile]));
        setProfiles(selectedIds.map((id) => byId.get(id)).filter((profile): profile is RikishiProfile => Boolean(profile)));
        setProfileStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setProfiles([]);
        setProfileStatus('ready');
      });
    return () => {
      active = false;
    };
  }, [searchParams.get('ids')]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSearchParams(setComparisonIds(searchParams, selectedIds.filter((selectedId) => selectedId !== id)), { replace: false });
      setSelectionStatus('idle');
      return;
    }
    if (selectedIds.length >= MAX_COMPARE_RIKISHI) {
      setSelectionStatus('limit');
      return;
    }
    setSearchParams(setComparisonIds(searchParams, [...selectedIds, id]), { replace: false });
    setSelectionStatus('idle');
  };

  const candidates = React.useMemo(() => index.filter((item) => (
    matchesSearch(query, item.name, item.yomi, toRomaji(item.yomi), item.currentRank)
  )).slice(0, 12), [index, query]);

  const rows: ComparisonRow[] = [
    { label: t('comparison.rank'), value: (profile) => textOrUnknown(profile.currentRank, unknown) },
    { label: t('comparison.height'), value: (profile) => numberOrUnknown(profile.height, 'cm', unknown) },
    { label: t('comparison.weight'), value: (profile) => numberOrUnknown(profile.weight, 'kg', unknown) },
    { label: t('comparison.origin'), value: (profile) => textOrUnknown(profile.shusshin, unknown) },
    { label: t('comparison.debut'), value: (profile) => textOrUnknown(profile.debut, unknown) },
    { label: t('comparison.careerRecord'), value: (profile) => careerRecord(profile, unknown) },
    { label: t('comparison.careerWinRate'), value: (profile) => careerWinRate(profile, unknown) },
  ];

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
        <h1>{t('comparison.title')}</h1>
        <p>{t('comparison.description')}</p>
      </header>
      <main className="rikishi-main">
        {status === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {status === 'error' ? <p className="rikishi-status warning">{t('rikishi.loadError')}</p> : null}
        {status === 'ready' ? (
          <>
            <section className="compare-selector" aria-labelledby="compare-selector-title">
              <div>
                <h2 id="compare-selector-title">{t('comparison.selectTitle')}</h2>
                <p>{t('comparison.selectDescription', { max: MAX_COMPARE_RIKISHI })}</p>
              </div>
              <label className="directory-search__label" htmlFor="compare-search">{t('comparison.searchLabel')}</label>
              <input id="compare-search" className="directory-search__input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('rikishi.searchPlaceholder')} />
              {selectionStatus === 'limit' ? <p className="compare-selector__status" role="status">{t('comparison.limitReached', { max: MAX_COMPARE_RIKISHI })}</p> : null}
              <div className="compare-selector__results">
                {candidates.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  return (
                    <button key={item.id} type="button" className={`compare-selector__option${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => toggle(item.id)}>
                      <span>{item.currentRank}</span><strong>{item.name}</strong><small>{item.yomi}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedIds.length < 2 ? <p className="rikishi-status">{t('comparison.needMore')}</p> : null}
            {profileStatus === 'loading' ? <p className="rikishi-status">{t('comparison.loading')}</p> : null}
            {profiles.length >= 2 ? (
              <section className="comparison-table-wrapper" aria-label={t('comparison.tableLabel')}>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('comparison.metric')}</th>
                      {profiles.map((profile) => <th key={profile.id} scope="col"><Link to={rikishiProfilePath(profile.id)}>{profile.name}</Link></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {profiles.map((profile) => <td key={profile.id}>{row.value(profile)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}><HomeLink placement="footer" /> <span> | </span><Link to="/rikishi/">{t('myRikishi.findRikishi')}</Link></nav>
      </footer>
    </div>
  );
}
