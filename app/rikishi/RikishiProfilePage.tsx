import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import {
  fetchRikishiProfile,
  rikishiApiPath,
  type RikishiProfile,
} from '../lib/rikishi-profile';
import { isLocalRikishiImagePath } from '../lib/rikishi-avatar';
import { toRomaji } from '../lib/romaji';
import { formatUpdatedAt } from '../lib/updated-at';
import './page.css';

function textOrUnknown(value: string | undefined, unknownLabel: string): string {
  return value && value.trim() ? value : unknownLabel;
}

function numberOrUnknown(value: number | undefined, unit: string, unknownLabel: string): string {
  return value && value > 0 ? `${value}${unit}` : unknownLabel;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rikishi-profile-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function RikishiProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const [profile, setProfile] = React.useState<RikishiProfile | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const numericId = Number(id);
  const unknownLabel = t('rikishi.unknown');

  const copyApiJsonPath = async () => {
    if (!profile) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setCopyStatus('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(rikishiApiPath(profile.id));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  React.useEffect(() => {
    let active = true;

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setStatus('not-found');
      return () => {
        active = false;
      };
    }

    setStatus('loading');
    fetchRikishiProfile(numericId)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setStatus('not-found');
          return;
        }
        setProfile(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [numericId]);

  React.useEffect(() => {
    setCopyStatus('idle');
  }, [profile?.id]);

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1>{profile ? profile.name : t('rikishi.detailTitle')}</h1>
        <p>{profile ? `${profile.currentRank} / ${toRomaji(profile.yomi)}` : t('rikishi.detailDescription')}</p>
        {profile?.updatedAt ? <p>{t('rikishi.updatedAt', { date: formatUpdatedAt(profile.updatedAt) })}</p> : null}
      </header>

      <main className="rikishi-main">
        {status === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {status === 'error' ? <p className="rikishi-status warning">{t('rikishi.loadError')}</p> : null}
        {status === 'not-found' ? (
          <section className="rikishi-status warning">
            <h2>{t('rikishi.notFoundTitle')}</h2>
            <p>{t('rikishi.notFoundDescription')}</p>
            <Link to="/rikishi/" className="rikishi-action-link">{t('rikishi.backToList')}</Link>
          </section>
        ) : null}

        {status === 'ready' && profile ? (
          <article className="rikishi-profile-detail">
            <div className="rikishi-profile-hero">
              {profile.photoUrl ? (
                <img className="rikishi-profile-photo" src={profile.photoUrl} alt="" aria-hidden="true" loading="lazy" />
              ) : (
                <div className="rikishi-profile-photo-placeholder" aria-hidden="true">{profile.name.slice(0, 1)}</div>
              )}
              <div>
                <p className="rikishi-profile-rank">{profile.currentRank}</p>
                <h2>{profile.name}</h2>
                <p>{profile.yomi} / {toRomaji(profile.yomi)}</p>
                <div className="rikishi-profile-actions">
                  <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer" className="rikishi-action-link">
                    {t('rikishi.kyokaiProfileLink')}
                  </a>
                  <div className="rikishi-api-json-path">
                    <span className="rikishi-api-json-label">{t('rikishi.apiJsonPathLabel')}</span>
                    <code>{rikishiApiPath(profile.id)}</code>
                    <button type="button" className="rikishi-copy-button" onClick={copyApiJsonPath}>
                      {copyStatus === 'copied' ? t('rikishi.copyApiJsonPathDone') : t('rikishi.copyApiJsonPath')}
                    </button>
                    {copyStatus === 'failed' ? (
                      <span className="rikishi-copy-status" role="status">{t('rikishi.copyApiJsonPathFailed')}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <dl className="rikishi-profile-fields">
              <ProfileField label={t('rikishi.name')} value={profile.name} />
              <ProfileField label={t('rikishi.yomi')} value={profile.yomi} />
              <ProfileField label={t('rikishi.rank')} value={profile.currentRank} />
              <ProfileField label={t('rikishi.birthDate')} value={textOrUnknown(profile.birthDate, unknownLabel)} />
              <ProfileField label={t('rikishi.height')} value={numberOrUnknown(profile.height, 'cm', unknownLabel)} />
              <ProfileField label={t('rikishi.weight')} value={numberOrUnknown(profile.weight, 'kg', unknownLabel)} />
              <ProfileField label={t('rikishi.shusshin')} value={textOrUnknown(profile.shusshin, unknownLabel)} />
              <ProfileField label={t('rikishi.debut')} value={textOrUnknown(profile.debut, unknownLabel)} />
            </dl>

            <section className="rikishi-profile-source">
              <h2>{t('rikishi.sourceHeading')}</h2>
              <p>{t('rikishi.sourceDescription')}</p>
              {isLocalRikishiImagePath(profile.photoUrl) ? (
                <p>{t('rikishi.imageSourceDescription')}</p>
              ) : null}
              <p>{t('rikishi.updatedAt', { date: formatUpdatedAt(profile.updatedAt) })}</p>
            </section>
          </article>
        ) : null}
      </main>

      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}>
          <HomeLink placement="footer" />
          <span> | </span>
          <Link to="/rikishi/">{t('rikishi.backToList')}</Link>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            {t('banzuke.footerGithub')}
          </a>
        </nav>
      </footer>
    </div>
  );
}
