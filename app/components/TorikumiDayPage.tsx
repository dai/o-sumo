import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { canonicalShikona, divisionAnchorId } from '../lib/rikishi-display';
import SortToggle from './SortToggle';
import { type SortOrder, sortMatches } from '../lib/sorting';
import { type TorikumiArchiveDay, type TorikumiDivisionDay, type TorikumiMatch } from '../lib/torikumi-data';
import { extractRikishiIdFromProfileUrl, rikishiProfilePath } from '../lib/rikishi-profile';
import {
  getArchiveRouteConfigByMonthKey,
  getArchiveRouteConfigForDateKey,
  getAdjacentDay,
  getDayPath,
  type TorikumiPageMode,
} from '../lib/torikumi-routes';
import HomeLink from './HomeLink';
import AbsenteesNotice from './AbsenteesNotice';
import '../torikumi/page.css';
import { formatUpdatedAt } from '../lib/updated-at';

const DIVISIONS: Array<'幕内' | '十両'> = ['幕内', '十両'];

function byDivision(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi.matches : day.juryo.matches;
}

function sectionMeta(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi : day.juryo;
}

function displayName(name: string, profileUrl: string): string {
  return canonicalShikona(profileUrl, name);
}

function RikishiMatchName({ name, profileUrl }: { name: string; profileUrl: string }) {
  const id = extractRikishiIdFromProfileUrl(profileUrl);
  const shikona = displayName(name, profileUrl);

  if (!id) {
    return <div className="name">{shikona}</div>;
  }

  return (
    <Link to={rikishiProfilePath(id)} className="torikumi-rikishi-link">
      <span className="name">{shikona}</span>
    </Link>
  );
}

function winnerLabel(match: TorikumiMatch): string {
  if (!match.winner) return match.kimarite;
  const winnerName = match.winner === 'east'
    ? canonicalShikona(match.eastProfileUrl, match.eastName)
    : canonicalShikona(match.westProfileUrl, match.westName);
  return `${match.kimarite}（${winnerName}）`;
}

function uniqueAbsentees(dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }) {
  const entries = [...(dayData.makuuchi.absentees ?? []), ...(dayData.juryo.absentees ?? [])];
  const seen = new Set<number>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function TorikumiTable({
  title,
  dayData,
  mode,
  sortOrder,
  t,
}: {
  title: string;
  dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay };
  mode: TorikumiPageMode;
  sortOrder: SortOrder;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <section className="division-section">
      <h2>{title}</h2>
      {DIVISIONS.map((division) => {
        const meta = sectionMeta(dayData, division);
        const matches = sortMatches(byDivision(dayData, division), sortOrder);
        return (
          <div key={`${title}-${division}`}>
            <h3>{t('torikumi.day.divisionMatchCount', { division, count: matches.length })}</h3>
            <p className="status-message">{meta.dayHead}</p>
            {matches.length === 0 ? (
              <div className="empty-division-message">
                {mode === 'result'
                  ? t('torikumi.day.resultNotUpdated', { division })
                  : t('torikumi.day.scheduleNotUpdated', { division })}
              </div>
            ) : (
              <div className="torikumi-table" role="table" aria-label={`${title} ${division}`}>
                <div className="torikumi-head" role="rowgroup">
                  <div className="cell east">{t('banzuke.east')}</div>
                  <div className="cell kimarite">{mode === 'result' ? t('torikumi.day.kimariteResult') : t('torikumi.day.kimariteSchedule')}</div>
                  <div className="cell west">{t('banzuke.west')}</div>
                </div>
                {matches.map((match: TorikumiMatch) => (
                  <div className="torikumi-row" role="row" key={`${title}-${division}-${match.boutNo}`} id={divisionAnchorId(division, match.boutNo)}>
                    <div className={`cell east rikishi-card ${match.winner === 'east' ? 'winner' : ''}`}>
                      <RikishiMatchName name={match.eastName} profileUrl={match.eastProfileUrl} />
                      <div className="english">{match.eastEnglish}</div>
                    </div>
                    <div className={`cell kimarite kimarite-value ${mode === 'result' && match.winner ? `winner-${match.winner}` : ''}`}>
                      {mode === 'result' ? winnerLabel(match) : t('torikumi.day.matchScheduled')}
                    </div>
                    <div className={`cell west rikishi-card ${match.winner === 'west' ? 'winner' : ''}`}>
                      <RikishiMatchName name={match.westName} profileUrl={match.westProfileUrl} />
                      <div className="english">{match.westEnglish}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

// Determine which archive to use based on pathDate
function getArchiveForPath(pathDate: string) {
  const config = getArchiveRouteConfigForDateKey(pathDate);
  if (config) {
    return {
      archive: config.archive,
      resultPath: config.resultPath,
      schedulePath: config.schedulePath,
      bandukePath: config.bandukePath,
    };
  }

  const fallback = getArchiveRouteConfigByMonthKey('202605');
  if (!fallback) {
    throw new Error('Missing default archive route config for 202605');
  }

  return {
    archive: fallback.archive,
    resultPath: fallback.resultPath,
    schedulePath: fallback.schedulePath,
    bandukePath: fallback.bandukePath,
  };
}

export default function TorikumiDayPage({ day, mode }: { day: TorikumiArchiveDay; mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const { t } = useTranslation('common');
  const { archive, resultPath, schedulePath, bandukePath } = getArchiveForPath(day.pathDate);
  const prevDay = getAdjacentDay(day, mode, 'prev');
  const nextDay = getAdjacentDay(day, mode, 'next');

  const modeLabel = mode === 'result'
    ? t('torikumi.day.modeResult')
    : t('torikumi.day.modeSchedule');
  const modeDescription = mode === 'result'
    ? t('torikumi.day.modeDescriptionResult')
    : t('torikumi.day.modeDescriptionSchedule');
  const absentees = mode === 'schedule' ? uniqueAbsentees(day.data) : [];
  const updatedAt = mode === 'result' ? archive.resultUpdatedAt : archive.scheduleUpdatedAt;

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1>{archive.year}{archive.bashoName}{modeLabel}</h1>
        <p>{day.dayHead}</p>
        <p>{t('torikumi.day.updateDate', { date: formatUpdatedAt(updatedAt) })}</p>
        <AbsenteesNotice entries={absentees} />
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">{day.pathDate}</div>
            <h2>{day.label}の{modeLabel}</h2>
            <p>{modeDescription}</p>
            {day.status === 'pending' ? <p className="status-message warning">{day.statusMessage}</p> : null}
          </div>
          <nav className="archive-nav" aria-label={`${modeLabel}ページの主要導線`}>
            <Link to={mode === 'result' ? resultPath : schedulePath} className="archive-link">{t('archives.list')}</Link>
            <Link to={bandukePath} className="archive-link">{t('archives.banduke')}</Link>
          </nav>
        </section>

        <nav className="pager-nav" aria-label={`${modeLabel}の日別ナビゲーション`}>
          <span>{prevDay ? <Link to={getDayPath(prevDay, mode)}>← {prevDay.label}</Link> : t('torikumi.day.prevDayNone')}</span>
          <span>{nextDay ? <Link to={getDayPath(nextDay, mode)}>{nextDay.label} →</Link> : t('torikumi.day.nextDayNone')}</span>
        </nav>

        <section className="sort-toolbar-section">
          <SortToggle value={sortOrder} onChange={setSortOrder} label={t('torikumi.day.sortLabel', { mode: modeLabel })} />
        </section>

        <TorikumiTable title={`${day.label}の${modeLabel}`} dayData={day.data} mode={mode} sortOrder={sortOrder} t={t} />
      </main>

      <footer className="torikumi-footer">
        <nav aria-label={`${modeLabel}ページフッターリンク`}>
          <HomeLink placement="footer" />
          <span> | </span>
          <Link to={resultPath}>{t('archives.result')}</Link>
          <span> | </span>
          <Link to={schedulePath}>{t('archives.schedule')}</Link>
          <span> | </span>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">{t('torikumi.day.footerDaisuke')}</a>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">{t('torikumi.day.footerGithub')}</a>
        </nav>
      </footer>
    </div>
  );
}
