import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from '../lib/rikishi-profile';
import { toRomaji } from '../lib/romaji';
import { formatUpdatedAt } from '../lib/updated-at';
import './page.css';

export default function RikishiPage() {
  const { t } = useTranslation('common');
  const [rikishi, setRikishi] = React.useState<RikishiIndexItem[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState('');
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

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
            <div className="rikishi-profile-grid">
              {rikishi.map((item) => (
                <Link key={item.id} to={rikishiProfilePath(item.id)} className="rikishi-profile-card">
                  <span className="rikishi-card-rank">{item.currentRank}</span>
                  <span className="rikishi-card-name">{item.name}</span>
                  <span className="rikishi-card-yomi">{item.yomi}</span>
                  <span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
                </Link>
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
