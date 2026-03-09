import React from 'react';
import { Link } from 'react-router-dom';
import { torikumiArchive } from '../lib/torikumi-data';
import { banzukePath, getDayPath, getHubPath, type TorikumiPageMode } from '../lib/torikumi-routes';
import './page.css';

function modeLabel(mode: TorikumiPageMode): string {
  return mode === 'result' ? '取組結果' : '取組予定';
}

export default function TorikumiHubPage({ mode }: { mode: TorikumiPageMode }) {
  const days = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{torikumiArchive.year}{torikumiArchive.bashoName} {modeLabel(mode)}一覧</h1>
        <p>更新日: {torikumiArchive.updatedAt} / 毎日19:00(JST)更新</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">{mode === 'result' ? getHubPath('result').slice(1) : getHubPath('schedule').slice(1)}</div>
            <h2>{modeLabel(mode)}の日別アーカイブ</h2>
            <p>{mode === 'result' ? '初日から当日までの結果を日付ごとに辿れます。' : '初日から翌日分までの予定を日付ごとに確認できます。'}</p>
            <p className="contact-inline">
              連絡先:
              {' '}
              <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">x.com/daisuke</a>
              {' / '}
              <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>
          <div className="archive-nav">
            <Link to={getHubPath(mode === 'result' ? 'schedule' : 'result')} className="archive-link">
              {mode === 'result' ? '予定一覧' : '結果一覧'}
            </Link>
            <Link to={banzukePath} className="archive-link">番付</Link>
          </div>
        </section>

        <section className="archive-grid-section">
          <div className="archive-grid">
            {days.map((day) => (
              <Link key={`${mode}-${day.pathDate}`} to={getDayPath(day, mode)} className="archive-card">
                <div className="archive-card-date">{day.pathDate}</div>
                <h3>{day.label}</h3>
                <p>{day.dayHead}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="torikumi-footer">
        <Link to="/">ホーム</Link>
        <span> | </span>
        <Link to={banzukePath}>番付一覧</Link>
        <span> | </span>
        <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
      </footer>
    </div>
  );
}
