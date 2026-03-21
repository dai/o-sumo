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
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="#efe7dc"/><circle cx="48" cy="34" r="18" fill="#c9b49c"/><path d="M20 84c5-16 18-24 28-24s23 8 28 24" fill="#b9956f"/><text x="48" y="90" text-anchor="middle" font-size="12" fill="#6f5338" font-family="sans-serif">${label}</text></svg>`,
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
        const marker = (
          <span className={`hoshi ${result}`} aria-label={`${day}日目 ${markerLabel}`}>
            {result === 'win' ? '○' : result === 'loss' ? '●' : '−'}
          </span>
        );

        if (!href) {
          return (
            <span key={day} className="hoshi-link is-disabled" aria-hidden="true">
              {marker}
            </span>
          );
        }

        return (
          <Link key={day} to={href} className="hoshi-link" aria-label={`${displayShikona(rikishi, profileNameMap)} ${day}日目の取組結果へ`}>
            {marker}
          </Link>
        );
      })}
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

  const wins = rikishi.wins ?? 0;
  const losses = rikishi.losses ?? 0;
  const name = displayShikona(rikishi, profileNameMap);

  return (
    <div className="rikishi-cell">
      <div className="rikishi-info">
        <a href={rikishi.profileUrl} target="_blank" rel="noreferrer" className="rikishi-photo-link" aria-label={`${name}のプロフィールを開く`}>
          <img
            className="rikishi-photo"
            src={profilePlaceholderSvg(name)}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <span className="rikishi-photo-note">写真準備中</span>
        </a>
        <div className="rikishi-meta">
          <div className="rikishi-name">{name}</div>
          <div className="rikishi-yomi">({rikishi.yomi})</div>
          <div className="rikishi-en">{toRomaji(rikishi.yomi)}</div>
          <span className={`rank-badge ${getRankBadgeClass(rikishi.rank)}`}>
            {rikishi.rank}
          </span>
        </div>
      </div>
      <div className="record">
        {wins}勝{losses}敗
        {rikishi.draws ? `${rikishi.draws}休` : ''}
      </div>
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
