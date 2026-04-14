import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BanzukeTable from '../components/BanzukeTable';
import SortToggle from '../components/SortToggle';
import {
  MARCH2026_BASHO_NAME,
  MARCH2026_JURYO_DATA,
  MARCH2026_MAKUUCHI_DATA,
  MARCH2026_YEAR,
} from '../lib/march2026-banzuke-data';
import { type SortOrder, sortRankGroups } from '../lib/sorting';
import { makuuchiData, juryo } from '../lib/sumo-data';
import { getArchiveRouteConfigForPathname, getHubPathForMonthKey } from '../lib/torikumi-routes';
import './page.css';

function formatGregorianBashoLabel(monthKey: string): string {
  const year = monthKey.slice(0, 4);
  const month = String(Number(monthKey.slice(4, 6)));
  return `${year}年${month}月場所`;
}

function useBanzukeContext() {
  const location = useLocation();
  const routeConfig = getArchiveRouteConfigForPathname(location.pathname);
  const monthKey = routeConfig.monthKey;

  if (monthKey === '202603') {
    return {
      monthKey,
      bashoTitle: `${MARCH2026_YEAR}${MARCH2026_BASHO_NAME}`,
      gregorianBashoLabel: formatGregorianBashoLabel(monthKey),
      bandukePath: routeConfig.bandukePath,
      resultPath: routeConfig.resultPath,
      makuuchi: MARCH2026_MAKUUCHI_DATA,
      juryo: MARCH2026_JURYO_DATA,
    };
  }

  return {
    monthKey,
    bashoTitle: `${routeConfig.archive.year}${routeConfig.archive.bashoName}`,
    gregorianBashoLabel: formatGregorianBashoLabel(monthKey),
    bandukePath: routeConfig.bandukePath,
    resultPath: routeConfig.resultPath,
    makuuchi: makuuchiData,
    juryo,
  };
}

export default function BanzukePage() {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const { bashoTitle, gregorianBashoLabel, bandukePath, monthKey, makuuchi, juryo: juryoRanks } = useBanzukeContext();
  const sortedMakuuchi = sortRankGroups(makuuchi, sortOrder);
  const sortedJuryo = sortRankGroups(juryoRanks, sortOrder);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">大相撲</h1>
          <h2 className="page-subtitle">{bashoTitle} 番付一覧</h2>
          <p className="page-description">{gregorianBashoLabel}の幕内・十両力士の番付と成績 / URL: {bandukePath}</p>
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
              <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
            ))}
          </div>
        </section>

        <section className="banzuke-section">
          <h2 className="section-heading">十両</h2>
          <div className="banzuke-list">
            {sortedJuryo.map((rankGroup, index) => (
              <BanzukeTable key={index} rankGroup={rankGroup} monthKey={monthKey} />
            ))}
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-heading">このページについて</h2>
          <div className="info-content">
            <p>
              このページは、{bashoTitle}（{gregorianBashoLabel}）の大相撲幕内・十両力士の番付一覧を表示しています。
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
        <nav aria-label="番付ページの関連リンク">
          <Link to="/">ホームに戻る</Link>
          {" | "}
          <Link to={getHubPathForMonthKey(monthKey, 'result')}>取組結果一覧</Link>
          {" | "}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">
            Daisuke on X
          </a>
          {" | "}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
        </nav>
      </footer>
    </div>
  );
}
