import React from 'react';
import { Link } from 'react-router-dom';
import SortToggle from './SortToggle';
import { type SortOrder, sortMatches } from '../lib/sorting';
import { type TorikumiArchiveDay, type TorikumiDivisionDay, type TorikumiMatch, torikumiArchive } from '../lib/torikumi-data';
import { banzukePath, getAdjacentDay, getDayPath, getHubPath, type TorikumiPageMode } from '../lib/torikumi-routes';
import { juryo, makuuchiData } from '../lib/sumo-data';
import '../torikumi/page.css';

const DIVISIONS: Array<'幕内' | '十両'> = ['幕内', '十両'];
const rikishiNameByProfileUrl = new Map(
  [...makuuchiData, ...juryo].flatMap((group) =>
    [...group.east, ...group.west].map((rikishi) => [rikishi.profileUrl, rikishi.name] as const),
  ),
);

function byDivision(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi.matches : day.juryo.matches;
}

function sectionMeta(day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') {
  return division === '幕内' ? day.makuuchi : day.juryo;
}

function modeLabel(mode: TorikumiPageMode): string {
  return mode === 'result' ? '取組結果' : '取組予定';
}

function modeDescription(mode: TorikumiPageMode): string {
  return mode === 'result'
    ? '初日から順に結果を追えるアーカイブです。'
    : '初日から順に予定番付を確認できるアーカイブです。';
}

function displayName(name: string, yomi: string, profileUrl: string): string {
  const canonicalName = rikishiNameByProfileUrl.get(profileUrl) ?? name;
  return canonicalName === yomi ? canonicalName : `${canonicalName}（${yomi}）`;
}

function emptyDivisionMessage(division: '幕内' | '十両', mode: TorikumiPageMode): string {
  return mode === 'result'
    ? `${division}の結果はまだ更新されていません。`
    : `${division}の取組予定はまだ更新されていません。`;
}

function TorikumiTable({
  title,
  dayData,
  mode,
  sortOrder,
}: {
  title: string;
  dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay };
  mode: TorikumiPageMode;
  sortOrder: SortOrder;
}) {
  return (
    <section className="division-section">
      <h2>{title}</h2>
      {DIVISIONS.map((division) => {
        const meta = sectionMeta(dayData, division);
        const matches = sortMatches(byDivision(dayData, division), sortOrder);
        return (
          <div key={`${title}-${division}`}>
            <h3>{division} ({matches.length}番)</h3>
            <p className="status-message">{meta.dayHead}</p>
            {matches.length === 0 ? (
              <div className="empty-division-message">{emptyDivisionMessage(division, mode)}</div>
            ) : (
              <div className="torikumi-table" role="table" aria-label={`${title} ${division}`}>
                <div className="torikumi-head" role="rowgroup">
                  <div className="cell east">東</div>
                  <div className="cell kimarite">{mode === 'result' ? '決まり手' : '予定'}</div>
                  <div className="cell west">西</div>
                </div>
                {matches.map((match: TorikumiMatch) => (
                  <div className="torikumi-row" role="row" key={`${title}-${division}-${match.boutNo}`}>
                    <div className="cell east rikishi-card">
                      <div className="name">{displayName(match.eastName, match.eastYomi, match.eastProfileUrl)}</div>
                      <div className="english">{match.eastEnglish}</div>
                    </div>
                    <div className="cell kimarite kimarite-value">
                      {mode === 'result'
                        ? `${match.kimarite}${match.winner ? ` (${match.winner === 'east' ? '東' : '西'}勝)` : ''}`
                        : '取組予定'}
                    </div>
                    <div className="cell west rikishi-card">
                      <div className="name">{displayName(match.westName, match.westYomi, match.westProfileUrl)}</div>
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

export default function TorikumiDayPage({ day, mode }: { day: TorikumiArchiveDay; mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const prevDay = getAdjacentDay(day, mode, 'prev');
  const nextDay = getAdjacentDay(day, mode, 'next');
  const liveUpdateMessage = '15:00-18:55(JST)は5分ごと / 19:00(JST)確定更新';

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{torikumiArchive.year}{torikumiArchive.bashoName} {modeLabel(mode)}</h1>
        <p>{day.dayHead}</p>
        <p>更新日: {torikumiArchive.updatedAt} / {liveUpdateMessage}</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">{day.pathDate}</div>
            <h2>{day.label}の{modeLabel(mode)}</h2>
            <p>{modeDescription(mode)}</p>
            {day.status === 'pending' ? <p className="status-message warning">{day.statusMessage}</p> : null}
          </div>
          <div className="archive-nav">
            <Link to={getHubPath(mode)} className="archive-link">一覧</Link>
            <Link to={banzukePath} className="archive-link">番付</Link>
          </div>
        </section>

        <nav className="pager-nav" aria-label={`${modeLabel(mode)}の日別ナビゲーション`}>
          <span>{prevDay ? <Link to={getDayPath(prevDay, mode)}>← {prevDay.label}</Link> : '← 前日なし'}</span>
          <span>{nextDay ? <Link to={getDayPath(nextDay, mode)}>{nextDay.label} →</Link> : '翌日なし →'}</span>
        </nav>

        <section className="sort-toolbar-section">
          <SortToggle value={sortOrder} onChange={setSortOrder} label={`${modeLabel(mode)}の並び順`} />
        </section>

        <TorikumiTable title={`${day.label}の${modeLabel(mode)}`} dayData={day.data} mode={mode} sortOrder={sortOrder} />
      </main>

      <footer className="torikumi-footer">
        <Link to="/">ホーム</Link>
        <span> | </span>
        <Link to={getHubPath('result')}>取組結果一覧</Link>
        <span> | </span>
        <Link to={getHubPath('schedule')}>取組予定一覧</Link>
        <span> | </span>
        <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
        <span> | </span>
        <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  );
}
