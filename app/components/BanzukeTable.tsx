'use client';

import React from 'react';
import type { RankGroup, Rikishi } from '../lib/sumo-data';
import '../styles/banzuke.css';

interface BanzukeTableProps {
  rankGroup: RankGroup;
}

const Hoshitori = ({ results }: { results?: ('win' | 'loss' | 'draw')[] }) => {
  if (!results) return null;
  return (
    <div className="hoshitori-container">
      {results.map((res, i) => (
        <span key={i} className={`hoshi ${res}`}>
          {res === 'win' ? '○' : res === 'loss' ? '●' : '−'}
        </span>
      ))}
    </div>
  );
};

const RikishiCell = ({ rikishi }: { rikishi: Rikishi }) => {
  const getRankBadgeClass = (rank: string): string => {
    if (rank.includes('横綱')) return 'yokozuna';
    if (rank.includes('大関')) return 'ozeki';
    if (rank.includes('関脇')) return 'sekiwake';
    if (rank.includes('小結')) return 'komusubi';
    if (rank.includes('十両')) return 'juryo';
    return 'maegashira';
  };

  return (
    <div className="rikishi-cell">
      <div className="rikishi-info">
        <div className="rikishi-name">{rikishi.name}</div>
        <div className="rikishi-yomi">({rikishi.yomi})</div>
        <span className={`rank-badge ${getRankBadgeClass(rikishi.rank)}`}>
          {rikishi.rank}
        </span>
      </div>
      <div className="record">
        {rikishi.wins}勝{rikishi.losses}敗
        {rikishi.draws ? `${rikishi.draws}休` : ''}
      </div>
      <Hoshitori results={rikishi.results} />
    </div>
  );
};

export default function BanzukeTable({ rankGroup }: BanzukeTableProps) {
  return (
    <div className="rank-section">
      <h3 className="rank-title">{rankGroup.title}</h3>
      <table className="banzuke-table">
        <thead>
          <tr>
            <th>東</th>
            <th>西</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="east">
              {rankGroup.east.length > 0 ? (
                <RikishiCell rikishi={rankGroup.east[0]} />
              ) : (
                <span className="empty">—</span>
              )}
            </td>
            <td className="west">
              {rankGroup.west.length > 0 ? (
                <RikishiCell rikishi={rankGroup.west[0]} />
              ) : (
                <span className="empty">—</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
