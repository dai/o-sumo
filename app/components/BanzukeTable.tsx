import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RankGroup, Rikishi } from '../lib/sumo-data';
import { canonicalNameMap, buildResultLinkMap, displayShikona } from '../lib/rikishi-display';
import { rikishiProfilePath } from '../lib/rikishi-profile';
import { toRomaji } from '../lib/romaji';
import {
  basicRikishiPlaceholderDataUrl,
  generatedRikishiAvatarDataUrl,
  localRikishiImagePath,
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
  const results = rikishi.results ?? [];
  const days = Array.from({ length: 15 }, (_, index) => {
    const result = results[index];
    if (result === 'win' || result === 'loss' || result === 'draw') return result;
    return 'empty';
  });

  return (
    <div className="hoshitori-section">
      <div className="record-label">{t('banzuke.hoshitoriLabel')}</div>
      <div className="hoshitori-container">
        {days.map((result, index) => {
          const day = index + 1;
          const href = resultLinkMap.get(`${rikishi.profileUrl}:${day}`);
          const markerLabel = result === 'win'
            ? t('banzuke.win')
            : result === 'loss'
              ? t('banzuke.loss')
              : result === 'draw'
                ? t('banzuke.absence')
                : '';
          const marker = result === 'win'
            ? <span className="hoshi win">○</span>
            : result === 'loss'
              ? <span className="hoshi loss">●</span>
              : result === 'draw'
                ? <span className="hoshi draw">−</span>
                : <span className="hoshi empty">・</span>;

          return href && result !== 'empty' ? (
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
  const photoUrl = localRikishiImagePath(rikishi.id);

  return (
    <div className="rikishi-cell">
      <Link to={rikishiProfilePath(rikishi.id)} className="rikishi-photo-link" aria-label={`${name}のo-sumoプロフィールを開く`}>
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
      </Link>
      <Link to={rikishiProfilePath(rikishi.id)} className="rikishi-name-link">
        <div className="rikishi-name">{name}</div>
      </Link>
      <div className="rikishi-en">({toRomaji(rikishi.yomi)})</div>
      <div className="record">{recordText}</div>
      <div className="record">
        <Link to={rikishiProfilePath(rikishi.id)} className="profile-link">{t('banzuke.profileLink')}</Link>
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
