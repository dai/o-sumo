import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RankGroup, Rikishi } from '../lib/sumo-data';
import { canonicalNameMap, buildResultLinkMap, displayShikona } from '../lib/rikishi-display';
import { toRomaji } from '../lib/romaji';
import {
  basicRikishiPlaceholderDataUrl,
  generatedRikishiAvatarDataUrl,
  shouldGenerateRikishiAvatar,
} from '../lib/rikishi-avatar';
import '../styles/banzuke.css';

interface BanzukeTableProps {
  rankGroup: RankGroup;
  monthKey?: string;
}

const profileNameMap = canonicalNameMap;

const Hoshitori = ({ rikishi, resultLinkMap }: { rikishi: Rikishi; resultLinkMap: Map<string, string> }) => {
  const { t } = useTranslation('common');
  if (!rikishi.results || rikishi.results.length === 0) return null;

  return (
    <div className="hoshitori-container">
      {rikishi.results.map((result, index) => {
        const day = index + 1;
        const href = resultLinkMap.get(`${rikishi.profileUrl}:${day}`);
        const markerLabel = result === 'win'
          ? t('banzuke.win')
          : result === 'loss'
            ? t('banzuke.loss')
            : t('banzuke.absence');
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

const RikishiCell = ({ rikishi, resultLinkMap }: { rikishi: Rikishi; resultLinkMap: Map<string, string> }) => {
  const { t } = useTranslation('common');
  const name = displayShikona(rikishi, profileNameMap);
  const wins = rikishi.wins ?? 0;
  const losses = rikishi.losses ?? 0;
  const draws = rikishi.draws ?? 0;
  const recordText = `${wins}${t('banzuke.winShort')}${losses}${t('banzuke.lossShort')}${draws > 0 ? `${draws}${t('banzuke.absenceShort')}` : ''}`;
  const fallbackPhotoUrl = shouldGenerateRikishiAvatar({ rank: rikishi.rank, name })
    ? generatedRikishiAvatarDataUrl({
      id: rikishi.id,
      name,
      side: rikishi.side,
    })
    : basicRikishiPlaceholderDataUrl(name);
  const photoUrl = rikishi.photoUrl || fallbackPhotoUrl;

  return (
    <div className="rikishi-cell">
      <a href={rikishi.profileUrl} target="_blank" rel="noreferrer" className="rikishi-photo-link" aria-label={`${name}のプロフィールを開く`}>
        <img
          className="rikishi-photo"
          src={photoUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('data:image')) {
              target.src = fallbackPhotoUrl;
            }
          }}
        />
      </a>
      <div className="rikishi-name">{name}</div>
      <div className="rikishi-en">({toRomaji(rikishi.yomi)})</div>
      <div className="record">{recordText}</div>
      <div className="record">
        <a href={rikishi.profileUrl} target="_blank" rel="noreferrer">{t('banzuke.profileLink')}</a>
        {rikishi.memo ? ` / ${rikishi.memo}` : ''}
      </div>
      <Hoshitori rikishi={rikishi} resultLinkMap={resultLinkMap} />
    </div>
  );
};

export default function BanzukeTable({ rankGroup, monthKey }: BanzukeTableProps) {
  const { t } = useTranslation('common');
  const resultLinkMap = useMemo(() => buildResultLinkMap(monthKey), [monthKey]);

  return (
    <div className="rank-section">
      <h3 className="rank-title">{rankGroup.title}</h3>
      <table className="banzuke-table">
        <caption className="sr-only">{rankGroup.title}の東西番付表</caption>
        <colgroup>
          <col style={{ width: '50%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{t('banzuke.east')}</th>
            <th scope="col">{t('banzuke.west')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="east">
              {rankGroup.east.length > 0 ? <RikishiCell rikishi={rankGroup.east[0]} resultLinkMap={resultLinkMap} /> : <span className="empty">—</span>}
            </td>
            <td className="west">
              {rankGroup.west.length > 0 ? <RikishiCell rikishi={rankGroup.west[0]} resultLinkMap={resultLinkMap} /> : <span className="empty">—</span>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
