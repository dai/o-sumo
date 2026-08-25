import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generatedRikishiAvatarDataUrl } from '../lib/rikishi-avatar';
import {
  getDailyHighlights,
  resolveDailyHighlightsTarget,
  type DailyHighlightsResult,
  type EnrichedFeaturedMatchup,
} from '../lib/daily-highlights-data';
import type { TorikumiDataSet } from '../lib/torikumi-data';
import type { BashoStatus } from '../lib/basho-status';

import DailyMonomosuBox from './DailyMonomosuBox';

export interface DailyHighlightsSectionProps {
  monthKey: string;
  archive: TorikumiDataSet;
  bashoStatus: BashoStatus;
}

function FeaturedMatchupCard({
  matchup,
}: {
  matchup: EnrichedFeaturedMatchup;
}) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language === 'en';

  const avatarEast = generatedRikishiAvatarDataUrl({
    id: matchup.east.id,
    name: matchup.east.name,
    side: 'east',
  });
  const avatarWest = generatedRikishiAvatarDataUrl({
    id: matchup.west.id,
    name: matchup.west.name,
    side: 'west',
  });

  const tag = isEn ? matchup.tagEn || matchup.tagJa : matchup.tagJa;
  const title = isEn ? matchup.titleEn || matchup.titleJa : matchup.titleJa;
  const description = isEn ? matchup.descriptionEn || matchup.descriptionJa : matchup.descriptionJa;

  const aikuchi = matchup.aikuchi;
  const getAikuchiBadgeText = () => {
    if (aikuchi.totalBouts === 0) return t('highlights.aikuchiNone');
    if (aikuchi.leader === null) return t('highlights.aikuchiEven');
    const leaderName = aikuchi.leader === 0 ? matchup.east.name : matchup.west.name;
    return t('highlights.aikuchiLead', { name: leaderName, diff: aikuchi.diff });
  };

  return (
    <article className="daily-highlight-card" aria-labelledby={`highlight-title-${matchup.id}`}>
      {/* Header Tag & Title */}
      <div className="daily-highlight-card__header">
        {tag ? <span className="daily-highlight-card__tag">{tag}</span> : null}
        {title ? (
          <h3 id={`highlight-title-${matchup.id}`} className="daily-highlight-card__title">
            {title}
          </h3>
        ) : null}
      </div>

      {/* VS Rikishi Faceoff */}
      <div className="daily-highlight-card__faceoff">
        {/* East Rikishi */}
        <div className="daily-highlight-side daily-highlight-side--east">
          <img
            src={avatarEast}
            alt=""
            className="daily-highlight-avatar"
            width="64"
            height="64"
          />
          <div className="daily-highlight-info">
            <span className="daily-highlight-rank">{matchup.east.rank}</span>
            <span className="daily-highlight-name">
              <Link to={`/rikishi/${matchup.east.id}/`}>{matchup.east.name}</Link>
            </span>
            {typeof matchup.east.wins === 'number' && typeof matchup.east.losses === 'number' ? (
              <span className="daily-highlight-record">
                {matchup.east.wins}勝{matchup.east.losses}敗
              </span>
            ) : null}
          </div>
        </div>

        {/* VS Badge */}
        <div className="daily-highlight-vs" aria-hidden="true">
          <span className="daily-highlight-vs__badge">VS</span>
        </div>

        {/* West Rikishi */}
        <div className="daily-highlight-side daily-highlight-side--west">
          <img
            src={avatarWest}
            alt=""
            className="daily-highlight-avatar"
            width="64"
            height="64"
          />
          <div className="daily-highlight-info">
            <span className="daily-highlight-rank">{matchup.west.rank}</span>
            <span className="daily-highlight-name">
              <Link to={`/rikishi/${matchup.west.id}/`}>{matchup.west.name}</Link>
            </span>
            {typeof matchup.west.wins === 'number' && typeof matchup.west.losses === 'number' ? (
              <span className="daily-highlight-record">
                {matchup.west.wins}勝{matchup.west.losses}敗
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Aikuchi (Head-to-Head) Bar */}
      <div className="daily-highlight-aikuchi" aria-label={t('highlights.aikuchiLabel')}>
        <div className="daily-highlight-aikuchi__top">
          <span className="daily-highlight-aikuchi__name">{matchup.east.name} <strong>{aikuchi.winsA}勝</strong></span>
          <span className="daily-highlight-aikuchi__badge">{getAikuchiBadgeText()}</span>
          <span className="daily-highlight-aikuchi__name"><strong>{aikuchi.winsB}勝</strong> {matchup.west.name}</span>
        </div>
        {aikuchi.totalBouts > 0 ? (
          <div className="daily-highlight-aikuchi__meter" aria-hidden="true">
            <div
              className="daily-highlight-aikuchi__bar daily-highlight-aikuchi__bar--east"
              style={{ width: `${aikuchi.winRateA}%` }}
            />
            <div
              className="daily-highlight-aikuchi__bar daily-highlight-aikuchi__bar--west"
              style={{ width: `${aikuchi.winRateB}%` }}
            />
          </div>
        ) : null}
      </div>

      {/* Description Preview */}
      <p className="daily-highlight-card__description">{description}</p>

      {/* Actions */}
      <div className="daily-highlight-card__actions">
        <Link to={matchup.compareHref} className="cta-button secondary daily-highlight-btn">
          📊 {t('highlights.compareAction')}
        </Link>
        {matchup.boutHref ? (
          <Link to={matchup.boutHref} className="daily-highlight-bout-link">
            📅 {t('highlights.viewBoutAction')}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function useMobileHighlights(): boolean {
  const query = '(max-width: 600px)';
  const [isMobile, setIsMobile] = React.useState(() => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false
  ));

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(query);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return isMobile;
}

export default function DailyHighlightsSection({
  monthKey,
  archive,
  bashoStatus,
}: DailyHighlightsSectionProps) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language === 'en';
  const isMobile = useMobileHighlights();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const additionalMatchupsId = React.useId();

  const target = React.useMemo(() => resolveDailyHighlightsTarget({
    archive,
    bashoStatus,
  }), [archive, bashoStatus]);

  const highlightsResult: DailyHighlightsResult | null = React.useMemo(() => {
    if (!target) return null;
    return getDailyHighlights({
      monthKey,
      target,
    });
  }, [monthKey, target]);

  if (!highlightsResult || highlightsResult.matchups.length === 0) {
    return null;
  }

  const sectionTitle = bashoStatus.kind === 'upcoming'
    ? t('highlights.previewTitle')
    : bashoStatus.kind === 'final'
      ? t('highlights.finalTitle')
      : t('highlights.sectionTitle');

  const sectionSubtitle = bashoStatus.kind === 'upcoming'
    ? t('highlights.previewSubtitle')
    : bashoStatus.kind === 'final'
      ? t('highlights.finalSubtitle')
      : t('highlights.sectionSubtitle');

  const dateBadge = isEn ? highlightsResult.dateTextEn : highlightsResult.dateTextJa;
  const showSampleNotice = bashoStatus.kind === 'upcoming';
  const monomosuComment = bashoStatus.kind === 'upcoming'
    ? t('highlights.monomosuUpcomingText')
    : bashoStatus.kind === 'final'
      ? t('highlights.monomosuFinalText')
      : t('highlights.monomosuLiveText');
  const [primaryMatchup, ...additionalMatchups] = highlightsResult.matchups;
  const showAdditionalMatchups = !isMobile || isMoreOpen;

  return (
    <section className="daily-highlights-section" aria-labelledby="daily-highlights-title">
      <div className="daily-highlights-section__header">
        <div className="daily-highlights-section__title-wrap">
          <span className="daily-highlights-section__icon" aria-hidden="true">⚔️</span>
          <h2 id="daily-highlights-title" className="daily-highlights-section__title">
            {sectionTitle}
          </h2>
          <span className="daily-highlights-section__badge">{dateBadge}</span>
          {showSampleNotice ? (
            <span className="daily-highlights-section__sample-badge" aria-label={t('highlights.devBadge')}>
              {t('highlights.devBadge')}
            </span>
          ) : null}
        </div>
        <p className="daily-highlights-section__subtitle">{sectionSubtitle}</p>
        {showSampleNotice ? (
          <p className="daily-highlights-section__dev-note">{t('highlights.devNote')}</p>
        ) : null}
      </div>

      {/* 一言物申す モダン1行ギミックボックス */}
      <DailyMonomosuBox
        monthKey={highlightsResult.monthKey}
        day={highlightsResult.day}
        shareTitle={dateBadge}
        customComment={monomosuComment}
      />

      <div className="daily-highlights-grid">
        <FeaturedMatchupCard matchup={primaryMatchup} />
        <div
          id={additionalMatchupsId}
          className="daily-highlights-grid__additional"
          hidden={!showAdditionalMatchups}
        >
          {additionalMatchups.map((matchup) => (
          <FeaturedMatchupCard
            key={matchup.id}
            matchup={matchup}
          />
          ))}
        </div>
      </div>
      {isMobile && additionalMatchups.length > 0 ? (
        <button
          type="button"
          className="daily-highlights-more-toggle"
          aria-expanded={isMoreOpen}
          aria-controls={additionalMatchupsId}
          onClick={() => setIsMoreOpen((open) => !open)}
        >
          {isMoreOpen ? t('highlights.hideMore') : t('highlights.showMore')}
        </button>
      ) : null}
    </section>
  );
}
