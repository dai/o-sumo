import React from 'react';
import { Link } from 'react-router-dom';
import SortToggle from '../components/SortToggle';
import { bashoTitle } from '../lib/basho-meta';
import { type SortOrder, sortArchiveDays } from '../lib/sorting';
import { torikumiArchive } from '../lib/torikumi-data';
import { banzukePath, getDayPath, getHubPath, type TorikumiPageMode } from '../lib/torikumi-routes';
import './page.css';

function modeLabel(mode: TorikumiPageMode): string {
  return mode === 'result' ? '取組結果' : '取組予定';
}

export default function TorikumiHubPage({ mode }: { mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const sourceDays = mode === 'result' ? torikumiArchive.resultDays : torikumiArchive.scheduleDays;
  const days = sortArchiveDays(sourceDays, sortOrder);

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{bashoTitle} {modeLabel(mode)}一覧</h1>
        <p>更新日: {torikumiArchive.updatedAt} / 15:00-18:55(JST)は5分ごと / 19:00(JST)確定更新</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">{mode === 'result' ? getHubPath('result').slice(1) : getHubPath('schedule').slice(1)}</div>
            <h2>{modeLabel(mode)}の日別アーカイブ</h2>
            <p>{mode === 'result' ? '初日から千秋楽までの結果ページを日付ごとに辿れます。未更新日は空状態で先に公開します。' : '初日から千秋楽までの予定ページを日付ごとに確認できます。未更新日は更新待ちとして表示します。'}</p>
          </div>
          <div className="archive-nav">
            <Link to={getHubPath(mode === 'result' ? 'schedule' : 'result')} className="archive-link">
              {mode === 'result' ? '予定一覧' : '結果一覧'}
            </Link>
            <Link to={banzukePath} className="archive-link">番付</Link>
          </div>
        </section>

        <section className="sort-toolbar-section">
          <SortToggle value={sortOrder} onChange={setSortOrder} label={`${modeLabel(mode)}一覧の並び順`} />
        </section>

        <section className="archive-grid-section">
          <div className="archive-grid">
            {days.map((day) => (
              <Link key={`${mode}-${day.pathDate}`} to={getDayPath(day, mode)} className="archive-card">
                <div className="archive-card-date">{day.pathDate}</div>
                <h3>{day.label}</h3>
                <p>{day.dayHead}</p>
                <p className={`archive-status${day.status === 'pending' ? ' pending' : ''}`}>
                  {day.statusMessage ?? '公開中'}
                </p>
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
        <span> | </span>
        <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  );
}
