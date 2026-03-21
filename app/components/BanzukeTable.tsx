import { Link } from 'react-router-dom';
import type { RankGroup, Rikishi } from '../lib/sumo-data';
import { buildProfileNameMap, buildResultLinkMap, displayShikona } from '../lib/rikishi-display';
import { toRomaji } from '../lib/romaji';
import '../styles/banzuke.css';

interface BanzukeTableProps {
  rankGroup: RankGroup;
}

const profileNameMap = buildProfileNameMap();
const resultLinkMap = buildResultLinkMap();

function profilePlaceholderSvg(name: string): string {
  const label = name.slice(0, 2);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect width="112" height="112" rx="16" fill="#efe7dc"/><circle cx="56" cy="39" r="21" fill="#c9b49c"/><path d="M22 95c6-20 21-30 34-30s28 10 34 30" fill="#b9956f"/><text x="56" y="102" text-anchor="middle" font-size="12" fill="#6f5338" font-family="sans-serif">${label}</text></svg>`,
  )}`;
}

const Hoshitori = ({ rikishi }: { rikishi: Rikishi }) => {
  if (!rikishi.results || rikishi.results.length === 0) return null;

  return (
    <div className="hoshitori-container">
      {rikishi.results.map((result, index) => {
        const day = index + 1;
        const href = resultLinkMap.get(`${rikishi.profileUrl}:${day}`);
        const markerLabel = result === 'win' ? '勝ち' : result === 'loss' ? '負け' : '休場';
        const marker = <span className={`hoshi ${result}`}>{result === 'win' ? '○' : result === 'loss' ? '●' : '−'}</span>;

        return href ? (
          <Link key={day} to={href} className="hoshi-link" aria-label={`${displayShikona(rikishi, profileNameMap)} ${day}日目の取組結果へ (${markerLabel})`}>
            {marker}
          </Link>
        ) : (
          <span key={day} className="hoshi-link is-disabled" aria-hidden="true">
            {marker}
          </span>
        );
      })}
    </div>
  );
};

const RikishiCell = ({ rikishi }: { rikishi: Rikishi }) => {
  const name = displayShikona(rikishi, profileNameMap);
  const wins = rikishi.wins ?? 0;
  const losses = rikishi.losses ?? 0;
  const draws = rikishi.draws ?? 0;
  const recordText = `${wins}勝${losses}敗${draws > 0 ? `${draws}休` : ''}`;

  return (
    <div className="rikishi-cell">
      <a href={rikishi.profileUrl} target="_blank" rel="noreferrer" className="rikishi-photo-link" aria-label={`${name}のプロフィールを開く`}>
        <img
          className="rikishi-photo"
          src={profilePlaceholderSvg(name)}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      </a>
      <div className="rikishi-name">{name}</div>
      <div className="rikishi-en">({toRomaji(rikishi.yomi)})</div>
      <div className="record">{recordText}</div>
      <div className="record">
        <a href={rikishi.profileUrl} target="_blank" rel="noreferrer">プロフィール</a>
        {rikishi.memo ? ` / ${rikishi.memo}` : ''}
      </div>
      <Hoshitori rikishi={rikishi} />
    </div>
  );
};

export default function BanzukeTable({ rankGroup }: BanzukeTableProps) {
  return (
    <div className="rank-section">
      <h3 className="rank-title">{rankGroup.title}</h3>
      <table className="banzuke-table">
        <colgroup>
          <col style={{ width: '50%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>東</th>
            <th>西</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="east">
              {rankGroup.east.length > 0 ? <RikishiCell rikishi={rankGroup.east[0]} /> : <span className="empty">—</span>}
            </td>
            <td className="west">
              {rankGroup.west.length > 0 ? <RikishiCell rikishi={rankGroup.west[0]} /> : <span className="empty">—</span>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
