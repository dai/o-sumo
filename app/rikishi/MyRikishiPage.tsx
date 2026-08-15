import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import MyRikishiToggle from '../components/MyRikishiToggle';
import { useMyRikishi } from '../lib/my-rikishi';
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from '../lib/rikishi-profile';
import { toRomaji } from '../lib/romaji';
import './page.css';

export default function MyRikishiPage() {
  const { t } = useTranslation('common');
  const { ids, clear } = useMyRikishi();
  const [rikishi, setRikishi] = React.useState<RikishiIndexItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [compareIds, setCompareIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    let active = true;
    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        setRikishi(data.rikishi);
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

  const savedRikishi = React.useMemo(() => {
    const byId = new Map(rikishi.map((item) => [item.id, item]));
    return ids.map((id) => byId.get(id)).filter((item): item is RikishiIndexItem => Boolean(item));
  }, [ids, rikishi]);

  React.useEffect(() => {
    setCompareIds((current) => current.filter((id) => ids.includes(id)));
  }, [ids]);

  const clearAll = () => {
    if (window.confirm(t('myRikishi.clearAllConfirm'))) clear();
  };

  const toggleCompare = (id: number) => {
    setCompareIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : current.length < 3 ? [...current, id] : current);
  };

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1>{t('myRikishi.listTitle')}</h1>
        <p>{t('myRikishi.listDescription')}</p>
        <p>{t('myRikishi.storageNote')}</p>
      </header>
      <main className="rikishi-main">
        {status === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {status === 'error' ? <p className="rikishi-status warning">{t('rikishi.loadError')}</p> : null}
        {status === 'ready' && savedRikishi.length === 0 ? (
          <section className="rikishi-status my-rikishi-empty">
            <h2>{t('myRikishi.emptyTitle')}</h2>
            <p>{t('myRikishi.emptyDescription')}</p>
            <Link to="/rikishi/" className="rikishi-action-link">{t('myRikishi.findRikishi')}</Link>
          </section>
        ) : null}
        {status === 'ready' && savedRikishi.length > 0 ? (
          <section className="rikishi-grid-section" aria-label={t('myRikishi.listTitle')}>
            <div className="my-rikishi-toolbar">
              <p role="status" aria-live="polite">{t('rikishi.searchResultCount', { count: savedRikishi.length })}</p>
              <div className="my-rikishi-toolbar__actions">
                {compareIds.length >= 2 ? (
                  <Link to={`/compare/?ids=${compareIds.join(',')}`} className="rikishi-action-link">{t('myRikishi.compareSelected')}</Link>
                ) : <span className="my-rikishi-compare-hint">{t('myRikishi.compareNeedMore')}</span>}
                <button type="button" className="my-rikishi-clear" onClick={clearAll}>{t('myRikishi.clearAll')}</button>
              </div>
            </div>
            <div className="rikishi-profile-grid">
              {savedRikishi.map((item) => (
                <article key={item.id} className="rikishi-profile-card">
                  <Link to={rikishiProfilePath(item.id)} className="rikishi-profile-card__link">
                    <span className="rikishi-card-rank">{item.currentRank}</span>
                    <span className="rikishi-card-name">{item.name}</span>
                    <span className="rikishi-card-yomi">{item.yomi}</span>
                    <span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
                  </Link>
                  <MyRikishiToggle rikishiId={item.id} />
                  <label className="my-rikishi-compare-option">
                    <input type="checkbox" checked={compareIds.includes(item.id)} onChange={() => toggleCompare(item.id)} />
                    {t('myRikishi.selectForCompare')}
                  </label>
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
          <Link to="/rikishi/">{t('myRikishi.findRikishi')}</Link>
        </nav>
      </footer>
    </div>
  );
}
