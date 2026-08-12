import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import { usePageMetaOverride } from '../components/MetaHead';
import { formatUpdatedAt } from '../lib/updated-at';
import { toRomaji } from '../lib/romaji';
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
    : t(`officials.ranks.${item.rankCode}`, { defaultValue: item.rank });
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
      {status === 'ready' && <section className="rikishi-profile-grid" aria-label={t('officials.listTitle', { label })}>
        {items.map((item) => <Link key={item.id} to={officialProfilePath(kind, item.id)} className="rikishi-profile-card">
          <span className="rikishi-card-rank">{rankLabel(item)}</span><span className="rikishi-card-name">{item.name}</span>
          <span className="rikishi-card-yomi">{item.yomi}</span><span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
        </Link>)}
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
  const [profile, setProfile] = React.useState<OfficialProfile | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not-found'>('loading');
  React.useEffect(() => {
    let active = true; setStatus('loading');
    fetchOfficialProfile(kind, id).then((data) => { if (active) { setProfile(data); setStatus(data ? 'ready' : 'not-found'); } });
    return () => { active = false; };
  }, [kind, id]);
  const label = t(`officials.${kind}`);
  const numericId = /^[1-9]\d*$/.test(id) ? Number(id) : null;
  const currentProfile = profile?.kind === kind && profile.id === numericId ? profile : null;
  const rankLabel = currentProfile
    ? (i18n.resolvedLanguage === 'ja'
      ? currentProfile.rank
      : t(`officials.ranks.${currentProfile.rankCode}`, { defaultValue: currentProfile.rank }))
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
      {status === 'not-found' && <section className="rikishi-status warning"><h2>{t('officials.notFound')}</h2><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></section>}
      {status === 'ready' && currentProfile && <article className="rikishi-profile-detail">
        <div className="rikishi-profile-hero"><div><p className="rikishi-profile-rank">{rankLabel}</p><h2>{currentProfile.name}</h2><p>{currentProfile.yomi} / {toRomaji(currentProfile.yomi)}</p><a href={currentProfile.sourceUrl} target="_blank" rel="noopener noreferrer" className="rikishi-action-link">{t('officials.sourceLink')}</a></div></div>
        <dl className="rikishi-profile-fields"><Field label={t('officials.stageName')} value={currentProfile.name}/><Field label={t('officials.rank')} value={rankLabel}/><Field label={t('officials.realName')} value={currentProfile.realName}/><Field label={t('officials.affiliation')} value={currentProfile.affiliation}/><Field label={t('rikishi.birthDate')} value={currentProfile.birthDate}/><Field label={t('officials.birthplace')} value={currentProfile.birthplace}/><Field label={t('officials.adoptedAt')} value={currentProfile.adoptedAt}/>{currentProfile.nameHistory?.length ? <Field label={t('officials.nameHistory')} value={currentProfile.nameHistory.join(' → ')}/> : null}</dl>
        <section className="rikishi-profile-source"><h2>{t('rikishi.sourceHeading')}</h2><p>{t('officials.sourceDescription')}</p><p>{t('officials.noPhotos')}</p><code>{officialApiPath(kind, currentProfile.id)}</code><p>{t('officials.retrievedAt', { date: formatUpdatedAt(currentProfile.retrievedAt) })}</p></section>
      </article>}
    </main>
    <footer className="rikishi-footer"><HomeLink placement="footer" /> <span> | </span><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></footer>
  </div>;
}
