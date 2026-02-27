'use client';

import React from 'react';
import type { RankGroup } from '../lib/sumo-data';
import '../styles/banzuke.css';

interface BanzukeTableProps {
  rankGroup: RankGroup;
}

export default function BanzukeTable({ rankGroup }: BanzukeTableProps) {
  const getRankBadgeClass = (rank: string): string => {
    if (rank.includes('横綱')) return 'yokozuna';
    if (rank.includes('大関')) return 'ozeki';
    if (rank.includes('関脇')) return 'sekiwake';
    if (rank.includes('小結')) return 'komusubi';
    if (rank.includes('十両')) return 'juryo';
    return 'maegashira';
  };

  return (
    <div className="rank-section">
      <h3 className="rank-title">{rankGroup.title}</h3>
      <table className="banzuke-table">
        <thead>
          <tr>
            <th>東</th>
            <th>成績</th>
            <th>西</th>
            <th>成績</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="east">
              {rankGroup.east.length > 0 ? (
                <div>
                  <div className="rikishi-name">{rankGroup.east[0].name}</div>
                  <div className="rikishi-yomi">({rankGroup.east[0].yomi})</div>
                  <span className={`rank-badge ${getRankBadgeClass(rankGroup.east[0].rank)}`}>
                    {rankGroup.east[0].rank}
                  </span>
                </div>
              ) : (
                <span className="empty">—</span>
              )}
            </td>
            <td className="east">
              {rankGroup.east.length > 0 && rankGroup.east[0].wins !== undefined ? (
                <div className="record">
                  {rankGroup.east[0].wins}勝{rankGroup.east[0].losses}敗
                  {rankGroup.east[0].draws ? `${rankGroup.east[0].draws}休` : ''}
                </div>
              ) : (
                <span>—</span>
              )}
            </td>
            <td className="west">
              {rankGroup.west.length > 0 ? (
                <div>
                  <div className="rikishi-name">{rankGroup.west[0].name}</div>
                  <div className="rikishi-yomi">({rankGroup.west[0].yomi})</div>
                  <span className={`rank-badge ${getRankBadgeClass(rankGroup.west[0].rank)}`}>
                    {rankGroup.west[0].rank}
                  </span>
                </div>
              ) : (
                <span className="empty">—</span>
              )}
            </td>
            <td className="west">
              {rankGroup.west.length > 0 && rankGroup.west[0].wins !== undefined ? (
                <div className="record">
                  {rankGroup.west[0].wins}勝{rankGroup.west[0].losses}敗
                  {rankGroup.west[0].draws ? `${rankGroup.west[0].draws}休` : ''}
                </div>
              ) : (
                <span>—</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
