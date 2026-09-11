import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generatedRikishiAvatarDataUrl } from '../lib/rikishi-avatar';
import {
  buildMatchupWinsMap,
  getDailyHighlights,
  resolveDailyHighlightsTargets,
  type DailyHighlightsResult,
  type EnrichedFeaturedMatchup,
  type MatchupWinsMap,
} from '../lib/daily-highlights-data';
import type { TorikumiDataSet, TorikumiArchiveDay } from '../lib/torikumi-data';
import type { BashoStatus } from '../lib/basho-status';
import { fetchRikishiMatchups } from '../lib/rikishi-profile';
import { getRelativeHighlightsTitle, getRelativeMonomosuText } from '../lib/relative-date';
import DailyMonomosuBox from './DailyMonomosuBox';

export interface DailyHighlightsSectionProps {
  monthKey: string;
  archive: TorikumiDataSet;
  bashoStatus: BashoStatus;
  now?: Date;
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
  const getAikuchiBadgeText = (): string => {
    if (!aikuchi) return '';
    if (aikuchi.totalBouts === 0) return t('highlights.aikuchiNone');
    if (aikuchi.leader === null) return t('highlights.aikuchiEven');
    const leaderName = aikuchi.leader === 0 ? matchup.east.name : matchup.west.name;
    return t('highlights.aikuchiLead', { name: leaderName, diff: aikuchi.diff });
  };

  return (
    <article className="daily-highlight-card" aria-labelledby={`highlight-title-${matchup.id}`}>
      <div className="daily-highlight-card__header">
        {tag ? <span className="daily-highlight-card__tag">{tag}</span> : null}
        {title ? (
          <h3 id={`highlight-title-${matchup.id}`} className="daily-highlight-card__title">
            {title}
          </h3>
        ) : null}
      </div>

      <div className="daily-highlight-card__faceoff">
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

        <div className="daily-highlight-vs" aria-hidden="true">
          <span className="daily-highlight-vs__badge">VS</span>
        </div>

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

      {aikuchi ? (
        <div
          className="daily-highlight-aikuchi"
          role="group"
          aria-label={t('highlights.aikuchiSummary', {
            nameA: matchup.east.name,
            winsA: aikuchi.winsA,
            winsB: aikuchi.winsB,
            nameB: matchup.west.name,
          })}
        >
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
      ) : null}

      <p className="daily-highlight-card__description">{description}</p>

      <div className="daily-highlight-card__actions">
        <Link to={matchup.compareHref} className="cta-button secondary daily-highlight-btn">
          {t('highlights.compareAction')}
        </Link>
        {matchup.boutHref ? (
          <Link to={matchup.boutHref} className="daily-highlight-bout-link">
            {t('highlights.viewBoutAction')}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function extractPairIds(target: { day: TorikumiArchiveDay }): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (const match of [
    ...target.day.data.makuuchi.matches,
    ...target.day.data.juryo.matches,
  ]) {
    const eastMatch = match.eastProfileUrl.match(/\/profile\/(\d+)\/?/);
    const westMatch = match.westProfileUrl.match(/\/profile\/(\d+)\/?/);
    if (!eastMatch || !westMatch) continue;
    const eastId = Number(eastMatch[1]);
    const westId = Number(westMatch[1]);
    if (Number.isInteger(eastId) && Number.isInteger(westId)) {
      pairs.push([eastId, westId]);
    }
  }
  return pairs;
}

export default function DailyHighlightsSection({
  monthKey,
  archive,
  bashoStatus,
  now,
}: DailyHighlightsSectionProps) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language === 'en';

  const targets = React.useMemo(() => resolveDailyHighlightsTargets({
    archive,
    bashoStatus,
    now,
  }), [archive, bashoStatus, now]);

  const [activeTab, setActiveTab] = React.useState<'today' | 'tomorrow'>('today');

  const hasTomorrow = Boolean(targets.tomorrow);
  const currentTab = hasTomorrow ? activeTab : 'today';
  const activeTarget = currentTab === 'tomorrow' && targets.tomorrow
    ? targets.tomorrow
    : targets.today;

  const [matchupWinsMap, setMatchupWinsMap] = React.useState<MatchupWinsMap>(() => new Map());

  React.useEffect(() => {
    if (!activeTarget) {
      setMatchupWinsMap(new Map());
      return undefined;
    }
    let active = true;
    const ids = extractPairIds(activeTarget);
    fetchRikishiMatchups()
      .then((response) => {
        if (!active) return;
        setMatchupWinsMap(buildMatchupWinsMap(response, ids));
      })
      .catch(() => {
        if (!active) return;
        setMatchupWinsMap(new Map());
      });
    return () => {
      active = false;
    };
  }, [activeTarget]);

  const highlightsResult: DailyHighlightsResult | null = React.useMemo(() => {
    if (!activeTarget) return null;
    return getDailyHighlights({
      monthKey,
      target: activeTarget,
      matchupWinsMap: matchupWinsMap.size > 0 ? matchupWinsMap : undefined,
    });
  }, [monthKey, activeTarget, matchupWinsMap]);

  if (!activeTarget) return null;

  const isFinal = bashoStatus.kind === 'final';
  const sectionTitle = getRelativeHighlightsTitle(activeTarget.dayDiff ?? null, isFinal, t);
  const sectionSubtitle = isFinal
    ? t('highlights.finalSubtitle')
    : t('highlights.sectionSubtitle');

  const dateBadge = isEn
    ? `Day ${activeTarget.day.day}`
    : activeTarget.day.label || `第${activeTarget.day.day}日目`;

  return (
    <section className="daily-highlights-section" aria-labelledby="daily-highlights-title">
      <div className="daily-highlights-section__header">
        <div className="daily-highlights-section__title-wrap">
          <h2 id="daily-highlights-title" className="daily-highlights-section__title">
            {sectionTitle}
          </h2>
          <span className="daily-highlights-section__badge">
            {highlightsResult
              ? (isEn ? highlightsResult.dateTextEn : highlightsResult.dateTextJa)
              : dateBadge}
          </span>
          {highlightsResult === null && (
            <span className="daily-highlights-section__pending-badge">
              {t('highlights.pendingBadge')}
            </span>
          )}
        </div>
        <p className="daily-highlights-section__subtitle">{sectionSubtitle}</p>
        {hasTomorrow && (
          <div className="daily-highlights-tabs" role="tablist" aria-label={t('highlights.tabListLabel')}>
            <button
              type="button"
              role="tab"
              id="highlights-tab-today"
              aria-selected={currentTab === 'today'}
              aria-controls="daily-highlights-tabpanel"
              className={`daily-highlights-tab${currentTab === 'today' ? ' active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              {t('highlights.tabToday')}
            </button>
            <button
              type="button"
              role="tab"
              id="highlights-tab-tomorrow"
              aria-selected={currentTab === 'tomorrow'}
              aria-controls="daily-highlights-tabpanel"
              className={`daily-highlights-tab${currentTab === 'tomorrow' ? ' active' : ''}`}
              onClick={() => setActiveTab('tomorrow')}
            >
              {t('highlights.tabTomorrow')}
            </button>
          </div>
        )}
      </div>

      <div
        id="daily-highlights-tabpanel"
        role={hasTomorrow ? 'tabpanel' : undefined}
        aria-labelledby={hasTomorrow ? (currentTab === 'tomorrow' ? 'highlights-tab-tomorrow' : 'highlights-tab-today') : undefined}
      >
        {highlightsResult === null ? (
          <p className="daily-highlights-section__pending-body">
            {t('highlights.pendingBody')}
          </p>
        ) : (
          <>
            <DailyMonomosuBox
              monthKey={highlightsResult.monthKey}
              day={highlightsResult.day}
              shareTitle={isEn ? highlightsResult.dateTextEn : highlightsResult.dateTextJa}
              customComment={getRelativeMonomosuText(activeTarget.dayDiff ?? null, isFinal, t)}
            />

            <div className="daily-highlights-grid">
              {highlightsResult.matchups.map((matchup) => (
                <FeaturedMatchupCard key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
