import React from 'react';
import { Link } from 'react-router-dom';
import { type TorikumiArchiveDay, type TorikumiDivisionDay, type TorikumiMatch, torikumiArchive } from '../lib/torikumi-data';
import { banzukePath, getAdjacentDay, getDayPath, getHubPath, type TorikumiPageMode } from '../lib/torikumi-routes';
import '../202603-torikumi/page.css';

const DIVISIONS: Array<'幕内' | '十両'> = ['幕内', '十両'];

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

function TorikumiTable({ title, dayData, mode }: { title: string; dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }; mode: TorikumiPageMode }) {
  return (
    <section className="division-section">
      <h2>{title}</h2>
      {DIVISIONS.map((division) => {
        const meta = sectionMeta(dayData, division);
        const matches = byDivision(dayData, division);
        return (
          <div key={`${title}-${division}`}>
            <h3>{division} ({matches.length}番)</h3>
            <p className="status-message">{meta.dayHead}</p>
            <div className="torikumi-table" role="table" aria-label={`${title} ${division}`}>
              <div className="torikumi-head" role="rowgroup">
                <div className="cell east">東</div>
                <div className="cell kimarite">{mode === 'result' ? '決まり手' : '予定'}</div>
                <div className="cell west">西</div>
              </div>
              {matches.map((match: TorikumiMatch) => (
                <div className="torikumi-row" role="row" key={`${title}-${division}-${match.boutNo}`}>
                  <div className="cell east rikishi-card">
                    <div className="name">{match.eastName}</div>
                    <div className="yomi">{match.eastYomi}</div>
                    <div className="english">{match.eastEnglish}</div>
                  </div>
                  <div className="cell kimarite kimarite-value">
                    {mode === 'result'
                      ? `${match.kimarite}${match.winner ? ` (${match.winner === 'east' ? '東' : '西'}勝)` : ''}`
                      : '取組予定'}
                  </div>
                  <div className="cell west rikishi-card">
                    <div className="name">{match.westName}</div>
                    <div className="yomi">{match.westYomi}</div>
                    <div className="english">{match.westEnglish}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default function TorikumiDayPage({ day, mode }: { day: TorikumiArchiveDay; mode: TorikumiPageMode }) {
  const prevDay = getAdjacentDay(day, mode, 'prev');
  const nextDay = getAdjacentDay(day, mode, 'next');

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{torikumiArchive.year}{torikumiArchive.bashoName} {modeLabel(mode)}</h1>
        <p>{day.dayHead}</p>
        <p>更新日: {torikumiArchive.updatedAt} / 毎日19:00(JST)更新</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">{day.pathDate}</div>
            <h2>{day.label}の{modeLabel(mode)}</h2>
            <p>{modeDescription(mode)}</p>
            <p className="contact-inline">
              連絡先:
              {' '}
              <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">x.com/daisuke</a>
              {' / '}
              <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
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

        <TorikumiTable title={`${day.label}の${modeLabel(mode)}`} dayData={day.data} mode={mode} />
      </main>

      <footer className="torikumi-footer">
        <Link to="/">ホーム</Link>
        <span> | </span>
        <Link to={getHubPath('result')}>取組結果一覧</Link>
        <span> | </span>
        <Link to={getHubPath('schedule')}>取組予定一覧</Link>
        <span> | </span>
        <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
      </footer>
    </div>
  );
}
