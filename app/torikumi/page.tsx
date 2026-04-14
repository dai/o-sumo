import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SortToggle from '../components/SortToggle';
import { type SortOrder, sortArchiveDays } from '../lib/sorting';
import { type TorikumiDataSet } from '../lib/torikumi-data';
import {
  getArchiveRouteConfigForPathname,
  getDayPath,
  type TorikumiPageMode,
} from '../lib/torikumi-routes';
import './page.css';

function modeLabel(mode: TorikumiPageMode): string {
  return mode === 'result' ? ' 取組結果' : ' 取組予定';
}

// Determine which archive to use based on current path
function useArchive(): { archive: TorikumiDataSet; resultPath: string; schedulePath: string; bandukePath: string } {
  const location = useLocation();
  const config = getArchiveRouteConfigForPathname(location.pathname);
  return {
    archive: config.archive,
    resultPath: config.resultPath,
    schedulePath: config.schedulePath,
    bandukePath: config.bandukePath,
  };
}

export default function TorikumiHubPage({ mode }: { mode: TorikumiPageMode }) {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const { archive, resultPath, schedulePath, bandukePath } = useArchive();
  const sourceDays = mode === 'result' ? archive.resultDays : archive.scheduleDays;
  const days = sortArchiveDays(sourceDays ?? [], sortOrder);

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{archive.year}{archive.bashoName}{modeLabel(mode)}一覧</h1>
        <p>更新日: {archive.updatedAt}</p>
      </header>

      <main className="torikumi-main">
        <section className="day-summary-card">
          <div>
            <div className="archive-eyebrow">
              {mode === 'result' ? resultPath.slice(1) : schedulePath.slice(1)}
            </div>
            <h2>{modeLabel(mode)}の日別アーカイブ</h2>
            <p>
              {mode === 'result'
                ? '初日から千秋楽までの結果ページを日付ごとに辿れます。未更新日は空状態で先に公開します。'
                : '初日から千秋楽までの予定ページを日付ごとに確認できます。未更新日は取組予定未更新として表示します。'}
            </p>
          </div>
          <nav className="archive-nav" aria-label={`${modeLabel(mode)}一覧の主要導線`}>
            <Link
              to={mode === 'result' ? schedulePath : resultPath}
              className="archive-link"
            >
              {mode === 'result' ? '予定一覧' : '結果一覧'}
            </Link>
            <Link to={bandukePath} className="archive-link">番付</Link>
          </nav>
        </section>

        <section className="sort-toolbar-section">
          <SortToggle
            value={sortOrder}
            onChange={setSortOrder}
            label={`${modeLabel(mode)}一覧の並び順`}
          />
        </section>

        <section className="archive-grid-section">
          <div className="archive-grid">
            {days.map((day) => (
              <Link
                key={`${mode}-${day.pathDate}`}
                to={getDayPath(day, mode)}
                className={`archive-card${day.status === 'pending' ? ' pending' : ''}`}
              >
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
        <nav aria-label={`${modeLabel(mode)}一覧フッターリンク`}>
          <Link to="/">ホーム</Link>
          <span> | </span>
          <Link to={bandukePath}>番付一覧</Link>
          <span> | </span>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
