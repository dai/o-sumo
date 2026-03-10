import React from 'react';
import { Link } from 'react-router-dom';
import BanzukeTable from '../components/BanzukeTable';
import SortToggle from '../components/SortToggle';
import { type SortOrder, sortRankGroups } from '../lib/sorting';
import { makuuchiData, juryo } from '../lib/sumo-data';
import { getHubPath } from '../lib/torikumi-routes';
import './page.css';

export default function BanzukePage() {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const sortedMakuuchi = sortRankGroups(makuuchiData, sortOrder);
  const sortedJuryo = sortRankGroups(juryo, sortOrder);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">大相撲</h1>
          <h2 className="page-subtitle">令和8年3月場所 番付一覧</h2>
          <p className="page-description">2026年3月場所の幕内・十両力士の番付と成績 / URL: /202603-banduke</p>
        </div>
      </header>

      <main className="page-main">
        <section className="page-toolbar">
          <SortToggle value={sortOrder} onChange={setSortOrder} label="番付の並び順" />
        </section>

        <section className="banzuke-section">
          <h2 className="section-heading">幕内</h2>
          <div className="banzuke-list">
            {sortedMakuuchi.map((rankGroup, index) => (
              <BanzukeTable key={index} rankGroup={rankGroup} />
            ))}
          </div>
        </section>

        <section className="banzuke-section">
          <h2 className="section-heading">十両</h2>
          <div className="banzuke-list">
            {sortedJuryo.map((rankGroup, index) => (
              <BanzukeTable key={index} rankGroup={rankGroup} />
            ))}
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-heading">このページについて</h2>
          <div className="info-content">
            <p>
              このページは、令和8年3月場所（2026年3月）の大相撲幕内・十両力士の番付一覧を表示しています。
            </p>
            <p>
              <strong>東</strong>と<strong>西</strong>の欄に力士の四股名と読み仮名、番付が表示されます。
            </p>
            <p>
              技術スタック: <strong>Cloudflare Pages</strong>、<strong>React</strong>、<strong>TypeScript</strong>
            </p>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
        <p>
          <Link to="/">ホームに戻る</Link>
          {" | "}
          <Link to={getHubPath('result')}>取組結果一覧</Link>
          {" | "}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">
            Daisuke on X
          </a>
          {" | "}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}
