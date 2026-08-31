import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import CopyApiJsonLink from '../components/CopyApiJsonLink';
import MyRikishiToggle from '../components/MyRikishiToggle';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { usePageMetaOverride } from '../components/MetaHead';
import {
  fetchRikishiIndex,
  fetchRikishiProfile,
  rikishiApiPath,
  rikishiProfilePath,
  type RikishiIndexItem,
  type RikishiProfile,
} from '../lib/rikishi-profile';
import { isLocalRikishiImagePath } from '../lib/rikishi-avatar';
import { toRomaji } from '../lib/romaji';
import { formatUpdatedAt } from '../lib/updated-at';
import { SITE_ORIGIN } from '../lib/site-url';
import './page.css';

const SAME_RANK_LIMIT = 8;

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

function formatCareerRecord(profile: RikishiProfile): {
  record: string;
  bouts: number;
  winRatePercent: number;
} {
  const wins = profile.careerStats.wins;
  const losses = profile.careerStats.losses;
  const draws = profile.careerStats.draws;
  const bouts = wins + losses + draws;
  const decided = wins + losses;
  const winRatePercent = decided > 0 ? Math.round((wins / decided) * 100) : 0;
  return {
    record: `${wins}勝 ${losses}敗 ${draws}分`,
    bouts,
    winRatePercent,
  };
}

export default function RikishiProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const [profile, setProfile] = React.useState<RikishiProfile | null>(null);
  const [sameRank, setSameRank] = React.useState<RikishiIndexItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const numericId = Number(id);
  const unknownLabel = t('rikishi.unknown');

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
    if (!profile) {
      setSameRank([]);
      return;
    }
    let active = true;
    fetchRikishiIndex()
      .then((index) => {
        if (!active) return;
        const others = index.rikishi
          .filter((item) => item.currentRank === profile.currentRank && item.id !== profile.id)
          .slice(0, SAME_RANK_LIMIT);
        setSameRank(others);
      })
      .catch(() => {
        if (!active) return;
        setSameRank([]);
      });
    return () => {
      active = false;
    };
  }, [profile?.id, profile?.currentRank]);

  const career = profile ? formatCareerRecord(profile) : null;
  usePageMetaOverride(profile ? {
    pathname: rikishiProfilePath(profile.id),
    title: t('rikishi.profileMetaTitle', { name: profile.name }),
    description: t('rikishi.profileMetaDescription', { name: profile.name }),
    socialUrl: new URL(rikishiProfilePath(profile.id), SITE_ORIGIN).toString(),
  } : null);

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <h1 className="site-header-title">{profile ? profile.name : t('rikishi.detailTitle')}</h1>
        </div>
        <div className="site-header-desc-row">
          <p>{profile ? `${profile.currentRank} / ${toRomaji(profile.yomi)}` : t('rikishi.detailDescription')}</p>
        </div>
        {profile?.updatedAt ? (
          <div className="site-header-meta-row">
            <p>{t('rikishi.updatedAt', { date: formatUpdatedAt(profile.updatedAt) })}</p>
          </div>
        ) : null}
      </header>

      <main className="rikishi-main">
        {profile ? (
          <PageBreadcrumb
            ariaLabel={t('rikishi.breadcrumbLabel')}
            items={[
              { label: t('global.homeLink'), href: '/' },
              { label: t('rikishi.listTitle'), href: '/rikishi/' },
              { label: profile.name },
            ]}
          />
        ) : null}

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
                  <MyRikishiToggle rikishiId={profile.id} />
                  <Link to={`/compare/?ids=${profile.id}`} className="rikishi-action-link">{t('comparison.compareThis')}</Link>
                  <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer" className="rikishi-action-link">
                    {t('rikishi.kyokaiProfileLink')}
                  </a>
                  <div className="rikishi-api-json-path">
                    <span className="rikishi-api-json-label">{t('rikishi.apiJsonPathLabel')}</span>
                    <code>{rikishiApiPath(profile.id)}</code>
                    <CopyApiJsonLink path={rikishiApiPath(profile.id)} />
                  </div>
                </div>
              </div>
            </div>

            {career ? (
              <section className="rikishi-profile-career" aria-labelledby="rikishi-career-title">
                <h2 id="rikishi-career-title">{t('rikishi.careerHeading')}</h2>
                <dl className="rikishi-profile-career__stats">
                  <div>
                    <dt>{t('rikishi.careerRecord')}</dt>
                    <dd>{career.record}</dd>
                  </div>
                  <div>
                    <dt>{t('rikishi.careerWinRate')}</dt>
                    <dd>{t('rikishi.careerWinRateValue', { percent: career.winRatePercent })}</dd>
                  </div>
                  <div>
                    <dt>{t('rikishi.careerBouts')}</dt>
                    <dd>{t('rikishi.careerBoutsValue', { count: career.bouts })}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

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

            {sameRank.length > 0 ? (
              <section className="rikishi-profile-same-rank" aria-labelledby="rikishi-same-rank-title">
                <h2 id="rikishi-same-rank-title">{t('rikishi.sameRankHeading', { rank: profile.currentRank })}</h2>
                <ul className="rikishi-profile-same-rank__list">
                  {sameRank.map((item) => (
                    <li key={item.id}>
                      <Link to={rikishiProfilePath(item.id)} className="rikishi-profile-same-rank__link">
                        <span className="rikishi-profile-same-rank__name">{item.name}</span>
                        <span className="rikishi-profile-same-rank__yomi">{item.yomi}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

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
