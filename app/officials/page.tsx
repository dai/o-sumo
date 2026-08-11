import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import { formatUpdatedAt } from '../lib/updated-at';
import { toRomaji } from '../lib/romaji';
import {
  fetchOfficialIndex, fetchOfficialProfile, officialApiPath, officialIndexApiPath,
  officialListPath, officialProfilePath, type OfficialKind, type OfficialIndexItem, type OfficialProfile,
} from '../lib/official-profile';
import '../rikishi/page.css';

export function OfficialListPage({ kind }: { kind: OfficialKind }) {
  const { t } = useTranslation('common');
  const [items, setItems] = React.useState<OfficialIndexItem[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState('');
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  React.useEffect(() => {
    let active = true;
    fetchOfficialIndex(kind).then((data) => {
      if (active) { setItems(data.officials); setUpdatedAt(data.updatedAt); setStatus('ready'); }
    }).catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, [kind]);
  const label = t(`officials.${kind}`);
  return <div className="rikishi-page">
    <header className="rikishi-header"><nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
      <h1>{t('officials.listTitle', { label })}</h1><p>{t('officials.listDescription', { label })}</p>
      {updatedAt && <p>{t('rikishi.updatedAt', { date: formatUpdatedAt(updatedAt) })}</p>}
    </header>
    <main className="rikishi-main">
      {status === 'loading' && <p className="rikishi-status">{t('rikishi.loading')}</p>}
      {status === 'error' && <p className="rikishi-status warning">{t('officials.loadError')}</p>}
      {status === 'ready' && <section className="rikishi-profile-grid" aria-label={t('officials.listTitle', { label })}>
        {items.map((item) => <Link key={item.id} to={officialProfilePath(kind, item.id)} className="rikishi-profile-card">
          <span className="rikishi-card-rank">{item.rank}</span><span className="rikishi-card-name">{item.name}</span>
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
  const { t } = useTranslation('common');
  const [profile, setProfile] = React.useState<OfficialProfile | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not-found'>('loading');
  React.useEffect(() => {
    let active = true; setStatus('loading');
    fetchOfficialProfile(kind, id).then((data) => { if (active) { setProfile(data); setStatus(data ? 'ready' : 'not-found'); } });
    return () => { active = false; };
  }, [kind, id]);
  const label = t(`officials.${kind}`);
  return <div className="rikishi-page">
    <header className="rikishi-header"><nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
      <h1>{profile?.name ?? t('officials.detailTitle', { label })}</h1>{profile && <p>{profile.rank} / {toRomaji(profile.yomi)}</p>}
    </header>
    <main className="rikishi-main">
      {status === 'loading' && <p className="rikishi-status">{t('rikishi.loading')}</p>}
      {status === 'not-found' && <section className="rikishi-status warning"><h2>{t('officials.notFound')}</h2><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></section>}
      {status === 'ready' && profile && <article className="rikishi-profile-detail">
        <div className="rikishi-profile-hero"><div><p className="rikishi-profile-rank">{profile.rank}</p><h2>{profile.name}</h2><p>{profile.yomi} / {toRomaji(profile.yomi)}</p><a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer" className="rikishi-action-link">{t('officials.sourceLink')}</a></div></div>
        <dl className="rikishi-profile-fields"><Field label={t('officials.stageName')} value={profile.name}/><Field label={t('officials.rank')} value={profile.rank}/><Field label={t('officials.realName')} value={profile.realName}/><Field label={t('officials.affiliation')} value={profile.affiliation}/><Field label={t('rikishi.birthDate')} value={profile.birthDate}/><Field label={t('officials.birthplace')} value={profile.birthplace}/><Field label={t('rikishi.debut')} value={profile.debut}/></dl>
        <section className="rikishi-profile-source"><h2>{t('rikishi.sourceHeading')}</h2><p>{t('officials.sourceDescription')}</p><p>{t('officials.noPhotos')}</p><code>{officialApiPath(kind, profile.id)}</code><p>{t('rikishi.updatedAt', { date: formatUpdatedAt(profile.updatedAt) })}</p></section>
      </article>}
    </main>
    <footer className="rikishi-footer"><HomeLink placement="footer" /> <span> | </span><Link to={officialListPath(kind)}>{t('officials.backToList', { label })}</Link></footer>
  </div>;
}
