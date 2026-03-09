import React from 'react';
import { Link } from 'react-router-dom';
import { torikumiData, type TorikumiDivisionDay, type TorikumiMatch } from '../lib/torikumi-data';
import './page.css';

const DIVISIONS: Array<'幕内' | '十両'> = ['幕内', '十両'];

const byDivision = (day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') =>
  division === '幕内' ? day.makuuchi.matches : day.juryo.matches;

const sectionMeta = (day: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay }, division: '幕内' | '十両') =>
  division === '幕内' ? day.makuuchi : day.juryo;

function TorikumiTable({ title, dayData }: { title: string; dayData: { makuuchi: TorikumiDivisionDay; juryo: TorikumiDivisionDay } }) {
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
                <div className="cell kimarite">決まり手</div>
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
                    {match.kimarite}
                    {match.winner ? ` (${match.winner === 'east' ? '東' : '西'}勝)` : ''}
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

export default function TorikumiPage() {
  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>{torikumiData.year}{torikumiData.bashoName} 取組表</h1>
        <p>更新日: {torikumiData.updatedAt} / 毎日18:00(JST)更新</p>
      </header>

      <main className="torikumi-main">
        <TorikumiTable title="今日の取組結果" dayData={torikumiData.today} />
        <TorikumiTable title="明日の取組予定" dayData={torikumiData.tomorrow} />
      </main>

      <footer className="torikumi-footer">
        <Link to="/">ホーム</Link>
        <span> | </span>
        <Link to="/202603-o-sumo">番付一覧</Link>
      </footer>
    </div>
  );
}
