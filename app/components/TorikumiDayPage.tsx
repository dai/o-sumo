import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { canonicalShikona, divisionAnchorId } from '../lib/rikishi-display';
import SortToggle from './SortToggle';
import { type SortOrder, sortMatches } from '../lib/sorting';
import { type TorikumiArchiveDay, type TorikumiDivisionDay, type TorikumiMatch } from '../lib/torikumi-data';
import { banzukeRikishiPath, extractRikishiIdFromProfileUrl } from '../lib/rikishi-profile';
import {
  getArchiveRouteConfigByMonthKey,
  getArchiveRouteConfigForDateKey,
  getAdjacentDay,
  getDayPath,
  isElapsedArchiveDay,
  type TorikumiPageMode,
} from '../lib/torikumi-routes';
import HomeLink from './HomeLink';
import AbsenteesNotice from './AbsenteesNotice';
import PageBreadcrumb from './PageBreadcrumb';
import '../torikumi/page.css';
import { formatUpdatedAt } from '../lib/updated-at';
import { getBanzukeDataByMonthKey, CURRENT_BASHO_ID } from '../lib/archive-basho-data';
import { useMyRikishi } from '../lib/my-rikishi';
import { formatBashoTitle } from '../lib/basho-meta';

const BOTTOM_TO_TOP_DIVISIONS: Array<'幕内' | '十両'> = ['十両', '幕内'];

function byDivision(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi.matches : day.juryo.matches;
}

function sectionMeta(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi : day.juryo;
}

function displayName(name: string, profileUrl: string): string {
  return canonicalShikona(profileUrl, name);
}

function formatRecord(record?: { wins: number; losses: number; draws: number }): string {
  if (!record) return '';
  return `（${record.wins}勝${record.losses}敗${record.draws > 0 ? `${record.draws}休` : ''}）`;
}

function createRecordMap(monthKey: string): Map<string, { wins: number; losses: number; draws: number }> {
  const banzuke = getBanzukeDataByMonthKey(monthKey);
  const groups = [...banzuke.makuuchi, ...banzuke.juryo];
  const map = new Map<string, { wins: number; losses: number; draws: number }>();
  groups.forEach((group) => {
    [...group.east, ...group.west].forEach((rikishi) => {
      map.set(rikishi.profileUrl, {
        wins: rikishi.wins ?? 0,
        losses: rikishi.losses ?? 0,
        draws: rikishi.draws ?? 0,
      });
    });
  });
  return map;
}

function RikishiMatchName({ name, profileUrl, banzukePath, record }: { name: string; profileUrl: string; banzukePath: string; record?: { wins: number; losses: number; draws: number } }) {
  const { t } = useTranslation('common');
  const { isSaved } = useMyRikishi();
  const id = extractRikishiIdFromProfileUrl(profileUrl);
  const shikona = displayName(name, profileUrl);
  const recordText = formatRecord(record);
  const isMyRikishi = id !== null && isSaved(id);

  const badge = isMyRikishi ? (
    <span className="my-rikishi-badge" aria-label={t('myRikishi.badgeLabel')}>
      <span className="my-rikishi-badge__icon" aria-hidden="true">★</span>
    </span>
  ) : null;

  if (!id) {
    return <div className="name">{shikona}{recordText}{badge}</div>;
  }

  return (
    <Link to={banzukeRikishiPath(banzukePath, id)} className="torikumi-rikishi-link">
      <span className="name">{shikona}{recordText}{badge}</span>
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
  const matchParticipantIds = new Set<number>();
  const fusenLoserIds = new Set<number>();
  for (const division of [dayData.makuuchi, dayData.juryo]) {
    for (const match of division.matches) {
      const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
      const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
      if (eastId !== null) matchParticipantIds.add(eastId);
      if (westId !== null) matchParticipantIds.add(westId);
      if (match.kimarite === '不戦' && match.winner === 'east' && westId !== null) fusenLoserIds.add(westId);
      if (match.kimarite === '不戦' && match.winner === 'west' && eastId !== null) fusenLoserIds.add(eastId);
    }
  }
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    if (matchParticipantIds.has(entry.id) && !fusenLoserIds.has(entry.id)) return false;
    return true;
  });
}

function matchInvolvesAbsent(match: TorikumiMatch, absenteeIds: Set<number>): boolean {
  if (match.winner && match.kimarite === '不戦') return false;
  if (absenteeIds.size === 0) return false;
  const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
  return (eastId !== null && absenteeIds.has(eastId))
    || (westId !== null && absenteeIds.has(westId));
}

function hasAnyMatches(dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }) {
  return dayData.makuuchi.matches.length > 0 || dayData.juryo.matches.length > 0;
}

function getDisplaySortOrder(mode: TorikumiPageMode, division: '幕内' | '十両', sortOrder: SortOrder): SortOrder {
  if (mode === 'result' && division === '十両') {
    return sortOrder === 'asc' ? 'desc' : 'asc';
  }
  return sortOrder;
}

type UnifiedResultSection = {
  division: '幕内' | '十両';
  matches: TorikumiMatch[];
};

function getUnifiedResultSections(dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }): UnifiedResultSection[] {
  // 結果ページでは十両 → 幕内の順で結合し、十両の先頭取組(1)が最上段、横綱戦が最下段になるよう、
  // 各 division を boutNo 昇順で並べる。
  return BOTTOM_TO_TOP_DIVISIONS
    .map((division) => ({ division, matches: sortMatches(byDivision(dayData, division), 'asc') }))
    .filter((section) => section.matches.length > 0);
}

function matchInvolvesMyRikishi(match: TorikumiMatch, isSaved: (id: number) => boolean): boolean {
  const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
  return (eastId !== null && isSaved(eastId)) || (westId !== null && isSaved(westId));
}

function renderUnifiedResultRows({
  sections,
  title,
  t,
  banzukePath,
  recordMap,
  absenteeIds,
  isSaved,
}: {
  sections: UnifiedResultSection[];
  title: string;
  t: ReturnType<typeof useTranslation>['t'];
  banzukePath: string;
  recordMap: Map<string, { wins: number; losses: number; draws: number }>;
  absenteeIds: Set<number>;
  isSaved: (id: number) => boolean;
}) {
  return (
    <div className="torikumi-table" role="table" aria-label={title}>
      <div className="torikumi-head" role="rowgroup">
        <div className="cell east">{t('banzuke.east')}</div>
        <div className="cell kimarite">{t('torikumi.day.kimariteResult')}</div>
        <div className="cell west">{t('banzuke.west')}</div>
      </div>
      {sections.map(({ division, matches }) => (
        <React.Fragment key={`${title}-${division}`}>
          <div className="division-divider" role="row">
            <span>{t('torikumi.day.divisionMatchCount', { division, count: matches.length })}</span>
          </div>
          {matches.map((match) => {
            const isMyMatch = matchInvolvesMyRikishi(match, isSaved);
            return matchInvolvesAbsent(match, absenteeIds) ? (
              <div
                className={`torikumi-row torikumi-row-absent${isMyMatch ? ' is-my-rikishi-match' : ''}`}
                role="row"
                key={`${title}-${division}-${match.boutNo}`}
                id={divisionAnchorId(division, match.boutNo)}
                aria-label={t('torikumi.day.absentBout', { boutNo: match.boutNo })}
              >
                <div className="cell absent-placeholder" />
                <div className="cell kimarite absent-placeholder">{t('torikumi.day.absent')}</div>
                <div className="cell absent-placeholder" />
              </div>
            ) : (
              <div
                className={`torikumi-row${isMyMatch ? ' is-my-rikishi-match' : ''}`}
                role="row"
                key={`${title}-${division}-${match.boutNo}`}
                id={divisionAnchorId(division, match.boutNo)}
              >
                <div className={`cell east rikishi-card ${match.winner === 'east' ? 'winner' : ''}`}>
                  {match.winner === 'east' ? <span className="winner-badge">{t('torikumi.day.winner')}</span> : null}
                  <RikishiMatchName name={match.eastName} profileUrl={match.eastProfileUrl} banzukePath={banzukePath} record={recordMap.get(match.eastProfileUrl)} />
                  <div className="english">{match.eastEnglish}</div>
                </div>
                <div className={`cell kimarite kimarite-value ${match.winner ? `winner-${match.winner}` : ''}`}>
                  {winnerLabel(match)}
                </div>
                <div className={`cell west rikishi-card ${match.winner === 'west' ? 'winner' : ''}`}>
                  {match.winner === 'west' ? <span className="winner-badge">{t('torikumi.day.winner')}</span> : null}
                  <RikishiMatchName name={match.westName} profileUrl={match.westProfileUrl} banzukePath={banzukePath} record={recordMap.get(match.westProfileUrl)} />
                  <div className="english">{match.westEnglish}</div>
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function getVisibleDayData(
  day: TorikumiArchiveDay,
  archive: { scheduleDays?: TorikumiArchiveDay[] },
  mode: TorikumiPageMode,
): { data: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }; source: 'result' | 'schedule' } {
  if (mode !== 'result' || day.status !== 'pending' || hasAnyMatches(day.data)) {
    return { data: day.data, source: mode };
  }
  if (isElapsedArchiveDay(day)) {
    return { data: day.data, source: 'result' };
  }

  const scheduleDay = (archive.scheduleDays ?? []).find((candidate) => candidate.pathDate === day.pathDate);
  if (!scheduleDay || !hasAnyMatches(scheduleDay.data)) {
    return { data: day.data, source: 'result' };
  }

  return { data: scheduleDay.data, source: 'schedule' };
}

function TorikumiTable({
  title,
  dayData,
  mode,
  sortOrder,
  t,
  banzukePath,
  recordMap,
  absenteeIds,
  myRikishiOnly,
  isSaved,
}: {
  title: string;
  dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay };
  mode: TorikumiPageMode;
  sortOrder: SortOrder;
  t: ReturnType<typeof useTranslation>['t'];
  banzukePath: string;
  recordMap: Map<string, { wins: number; losses: number; draws: number }>;
  absenteeIds: Set<number>;
  myRikishiOnly: boolean;
  isSaved: (id: number) => boolean;
}) {
  if (mode === 'result') {
    let sections = getUnifiedResultSections(dayData);
    if (myRikishiOnly) {
      sections = sections
        .map((sec) => ({
          ...sec,
          matches: sec.matches.filter((m) => matchInvolvesMyRikishi(m, isSaved)),
        }))
        .filter((sec) => sec.matches.length > 0);
    }

    return (
      <section className="division-section">
        <h2>{title}</h2>
        {myRikishiOnly && sections.length === 0 ? (
          <div className="empty-division-message">
            {t('torikumi.day.noMyRikishiMatches')}
          </div>
        ) : sections.length === 0 ? (
          <div className="empty-division-message">
            {t('torikumi.day.resultNotUpdated', { division: '十両' })}
          </div>
        ) : (
          renderUnifiedResultRows({ sections, title, t, banzukePath, recordMap, absenteeIds, isSaved })
        )}
      </section>
    );
  }

  return (
    <section className="division-section">
      <h2>{title}</h2>
      {BOTTOM_TO_TOP_DIVISIONS.map((division) => {
        const meta = sectionMeta(dayData, division);
        let matches = sortMatches(byDivision(dayData, division), getDisplaySortOrder(mode, division, sortOrder));
        if (myRikishiOnly) {
          matches = matches.filter((m) => matchInvolvesMyRikishi(m, isSaved));
        }

        return (
          <div key={`${title}-${division}`}>
            <h3>{t('torikumi.day.divisionMatchCount', { division, count: matches.length })}</h3>
            <p className="status-message">{meta.dayHead}</p>
            {myRikishiOnly && matches.length === 0 ? (
              <div className="empty-division-message">
                {t('torikumi.day.noMyRikishiMatches')}
              </div>
            ) : matches.length === 0 ? (
              <div className="empty-division-message">
                {t('torikumi.day.scheduleNotUpdated', { division })}
              </div>
            ) : (
              <div className="torikumi-table" role="table" aria-label={`${title} ${division}`}>
                <div className="torikumi-head" role="rowgroup">
                  <div className="cell east">{t('banzuke.east')}</div>
                  <div className="cell kimarite">{t('torikumi.day.kimariteSchedule')}</div>
                  <div className="cell west">{t('banzuke.west')}</div>
                </div>
                {matches.map((match: TorikumiMatch) => {
                  const isMyMatch = matchInvolvesMyRikishi(match, isSaved);
                  return matchInvolvesAbsent(match, absenteeIds) ? (
                    <div
                      className={`torikumi-row torikumi-row-absent${isMyMatch ? ' is-my-rikishi-match' : ''}`}
                      role="row"
                      key={`${title}-${division}-${match.boutNo}`}
                      id={divisionAnchorId(division, match.boutNo)}
                      aria-label={t('torikumi.day.absentBout', { boutNo: match.boutNo })}
                    >
                      <div className="cell absent-placeholder" />
                      <div className="cell kimarite absent-placeholder">{t('torikumi.day.absent')}</div>
                      <div className="cell absent-placeholder" />
                    </div>
                  ) : (
                    <div
                      className={`torikumi-row${isMyMatch ? ' is-my-rikishi-match' : ''}`}
                      role="row"
                      key={`${title}-${division}-${match.boutNo}`}
                      id={divisionAnchorId(division, match.boutNo)}
                    >
                      <div className={`cell east rikishi-card ${match.winner === 'east' ? 'winner' : ''}`}>
                        <RikishiMatchName name={match.eastName} profileUrl={match.eastProfileUrl} banzukePath={banzukePath} record={recordMap.get(match.eastProfileUrl)} />
                        <div className="english">{match.eastEnglish}</div>
                      </div>
                      <div className={`cell kimarite kimarite-value ${match.winner && match.kimarite === '不戦' ? `winner-${match.winner}` : ''}`}>
                        {match.winner
                          ? winnerLabel(match)
                          : t('torikumi.day.matchScheduled')}
                      </div>
                      <div className={`cell west rikishi-card ${match.winner === 'west' ? 'winner' : ''}`}>
                        <RikishiMatchName name={match.westName} profileUrl={match.westProfileUrl} banzukePath={banzukePath} record={recordMap.get(match.westProfileUrl)} />
                        <div className="english">{match.westEnglish}</div>
                      </div>
                    </div>
                  );
                })}
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
      monthKey: config.monthKey,
      archive: config.archive,
      resultPath: config.resultPath,
      schedulePath: config.schedulePath,
      banzukePath: config.banzukePath,
    };
  }

  const fallback = getArchiveRouteConfigByMonthKey(CURRENT_BASHO_ID);
  if (!fallback) {
    throw new Error(`Missing default archive route config for ${CURRENT_BASHO_ID}`);
  }

  return {
    monthKey: fallback.monthKey,
    archive: fallback.archive,
    resultPath: fallback.resultPath,
    schedulePath: fallback.schedulePath,
    banzukePath: fallback.banzukePath,
  };
}

function getMokufudaLabel(dayNumber: number, isJa: boolean): { main: string; sub?: string } {
  if (isJa) {
    if (dayNumber === 1) return { main: '初', sub: '日' };
    if (dayNumber === 8) return { main: '中', sub: '日' };
    if (dayNumber === 15) return { main: '楽', sub: '日' };
    return { main: `${dayNumber}`, sub: '日' };
  }
  return { main: `${dayNumber}`, sub: 'D' };
}

function TorikumiDayBar({
  archive,
  currentDay,
  mode,
  t,
  isJa,
}: {
  archive: { resultDays?: TorikumiArchiveDay[]; scheduleDays?: TorikumiArchiveDay[] };
  currentDay: TorikumiArchiveDay;
  mode: TorikumiPageMode;
  t: ReturnType<typeof useTranslation>['t'];
  isJa: boolean;
}) {
  const days = (mode === 'result' ? archive.resultDays : archive.scheduleDays) ?? archive.resultDays ?? [];
  const activeRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    if (activeRef.current && typeof activeRef.current.scrollIntoView === 'function') {
      activeRef.current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [currentDay.pathDate]);

  return (
    <nav className="torikumi-day-bar" aria-label={t('torikumi.day.dayNavigationLabel')}>
      <div className="torikumi-day-bar__scroll">
        {days.map((dayItem) => {
          const isActive = dayItem.pathDate === currentDay.pathDate;
          const dayNo = dayItem.day ?? (days.indexOf(dayItem) + 1);
          const { main, sub } = getMokufudaLabel(dayNo, isJa);
          const isPending = dayItem.status === 'pending';

          return (
            <Link
              key={dayItem.pathDate}
              to={getDayPath(dayItem, mode)}
              ref={isActive ? activeRef : undefined}
              className={`mokufuda-chip${isActive ? ' active' : ''}${isPending ? ' pending' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              title={`${dayItem.label} (${mode === 'result' ? '結果' : '予定'})`}
            >
              <span className="mokufuda-chip__main">{main}</span>
              <span className="mokufuda-chip__sub">{sub}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function TorikumiDayPage({ day, mode }: { day: TorikumiArchiveDay; mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [myRikishiOnly, setMyRikishiOnly] = React.useState(false);
  const { isSaved } = useMyRikishi();
  const { t, i18n } = useTranslation('common');
  const { monthKey, archive, resultPath, schedulePath, banzukePath } = getArchiveForPath(day.pathDate);
  const bashoTitle = formatBashoTitle({ year: archive.year, bashoName: archive.bashoName, monthKey }, i18n.language);
  const prevDay = getAdjacentDay(day, mode, 'prev');
  const nextDay = getAdjacentDay(day, mode, 'next');
  const visibleDay = getVisibleDayData(day, archive, mode);
  const visibleDayData = visibleDay.data;

  const modeLabel = mode === 'result'
    ? t('torikumi.day.modeResult')
    : t('torikumi.day.modeSchedule');
  const absentees = uniqueAbsentees(visibleDayData);
  const absenteeIds = React.useMemo(() => {
    const ids = new Set<number>();
    for (const division of [visibleDayData.makuuchi, visibleDayData.juryo]) {
      for (const entry of division.absentees ?? []) {
        ids.add(entry.id);
      }
    }
    return ids;
  }, [visibleDayData]);
  const updatedAt = visibleDay.source === 'schedule' ? archive.scheduleUpdatedAt : mode === 'result' ? archive.resultUpdatedAt : archive.scheduleUpdatedAt;
  const recordMap = React.useMemo(() => createRecordMap(monthKey), [monthKey]);

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <div className="site-header-heading-group">
            <h1 className="site-header-title">{bashoTitle}{modeLabel}</h1>
            <span className="page-subtitle">{day.dayHead}</span>
          </div>
        </div>
        {absentees.length > 0 ? (
          <div className="site-header-desc-row">
            <AbsenteesNotice entries={absentees} />
          </div>
        ) : null}
        <div className="site-header-meta-row">
          <p>{t('torikumi.day.updateDate', { date: formatUpdatedAt(updatedAt) })}</p>
        </div>
      </header>

      <main className="torikumi-main">
        <div className="torikumi-top-toolbar">
          <PageBreadcrumb
            ariaLabel={t('rikishi.breadcrumbLabel')}
            items={[
              { label: t('global.homeLink'), href: '/' },
              { label: bashoTitle, href: mode === 'result' ? resultPath : schedulePath },
              { label: day.dayHead },
            ]}
          />
          <nav className="archive-nav" aria-label={`${modeLabel}ページの主要導線`}>
            <Link to={mode === 'result' ? resultPath : schedulePath} className="archive-link">{t('archives.list')}</Link>
            <Link to={banzukePath} className="archive-link">{t('archives.banzuke')}</Link>
          </nav>
        </div>

        {/* 15-day Mokufuda navigation bar */}
        <TorikumiDayBar
          archive={archive}
          currentDay={day}
          mode={mode}
          t={t}
          isJa={i18n.language.startsWith('ja')}
        />

        <section className="day-summary-card day-summary-card--compact">
          <div className="day-summary-card__info">
            <h2 className="day-summary-card__title">{day.label}の{modeLabel}</h2>
            {day.status === 'pending' ? <span className="status-message warning">{day.statusMessage}</span> : null}
          </div>
          <div className="day-summary-card__actions">
            <button
              type="button"
              className={`my-rikishi-filter-btn${myRikishiOnly ? ' active' : ''}`}
              onClick={() => setMyRikishiOnly((current) => !current)}
              aria-pressed={myRikishiOnly}
            >
              {t('torikumi.day.filterMyRikishi')}
            </button>
            <nav className="pager-nav pager-nav--inline" aria-label={`${modeLabel}の日別ナビゲーション`}>
              <span>{prevDay ? <Link to={getDayPath(prevDay, mode)}>← {prevDay.label}</Link> : t('torikumi.day.prevDayNone')}</span>
              <span>{nextDay ? <Link to={getDayPath(nextDay, mode)}>{nextDay.label} →</Link> : t('torikumi.day.nextDayNone')}</span>
            </nav>
          </div>
        </section>

        {mode === 'schedule' && (
          <section className="sort-toolbar-section">
            <SortToggle value={sortOrder} onChange={setSortOrder} label={t('torikumi.day.sortLabel', { mode: modeLabel })} />
          </section>
        )}

        <TorikumiTable
          title={`${day.label}の${modeLabel}`}
          dayData={visibleDayData}
          mode={mode}
          sortOrder={sortOrder}
          t={t}
          banzukePath={banzukePath}
          recordMap={recordMap}
          absenteeIds={absenteeIds}
          myRikishiOnly={myRikishiOnly}
          isSaved={isSaved}
        />
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
