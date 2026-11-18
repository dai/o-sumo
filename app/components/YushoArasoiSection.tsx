import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { divisionAnchorId } from '../lib/rikishi-display';
import { banzukeRikishiPath } from '../lib/rikishi-profile';
import type { YushoArasoiSummary, YushoConditionLine } from '../lib/yusho-arasoi';

function renderConditionText(
  condition: YushoConditionLine,
  t: ReturnType<typeof useTranslation>['t'],
  isJa: boolean,
): string {
  const joiner = isJa ? '・' : ', ';
  switch (condition.kind) {
    case 'decided':
      return t(
        condition.viaPlayoff
          ? 'torikumi.yusho.decidedPlayoffSummary'
          : 'torikumi.yusho.decidedSummary',
        {
          name: condition.championName,
          wins: condition.wins,
          losses: condition.losses,
        },
      );
    case 'leaderSingle':
      return t(
        condition.isSelfDetermined
          ? 'torikumi.yusho.condLeaderSingleSelf'
          : 'torikumi.yusho.condLeaderSingle',
        {
          name: condition.name,
          wins: condition.wins,
          losses: condition.losses,
          maxWins: condition.maxWins,
        },
      );
    case 'leaderTied':
      return t(
        condition.hasUnplayedDirectClash
          ? 'torikumi.yusho.condLeaderTiedDirect'
          : 'torikumi.yusho.condLeaderTied',
        {
          names: condition.names.join(joiner),
          wins: condition.wins,
          losses: condition.losses,
          maxWins: condition.maxWins,
        },
      );
    case 'chaserGroup':
      return t('torikumi.yusho.condChaser', {
        names: condition.names.join(joiner),
        wins: condition.wins,
        losses: condition.losses,
        maxWins: condition.maxWins,
        totalLosses: condition.needLeaderTotalLosses,
        addLosses: condition.needLeaderAdditionalLosses,
      });
  }
}

export default function YushoArasoiSection({
  summary,
  banzukePath,
}: {
  summary: YushoArasoiSummary;
  banzukePath: string;
}) {
  const { t, i18n } = useTranslation('common');
  const isJa = i18n.language.startsWith('ja');

  if (summary.isDecided && summary.champion) {
    return (
      <section className="division-section yusho-arasoi-section yusho-arasoi-section--decided" aria-label={t('torikumi.yusho.title')}>
        <div className="yusho-arasoi-header">
          <h2>{t('torikumi.yusho.title')}</h2>
          <span className="yusho-arasoi-decided-badge">{t('torikumi.yusho.decidedBadge')}</span>
        </div>
        <p className="yusho-arasoi-decided-text">
          {t(
            summary.champion.viaPlayoff
              ? 'torikumi.yusho.decidedPlayoffSummary'
              : 'torikumi.yusho.decidedSummary',
            {
              name: summary.champion.name,
              wins: summary.champion.wins,
              losses: summary.champion.losses,
            },
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="division-section yusho-arasoi-section" aria-label={t('torikumi.yusho.title')}>
      <div className="yusho-arasoi-header">
        <h2>{t('torikumi.yusho.title')}</h2>
      </div>

      {/* 1. 首位グループの一覧 */}
      <div className="yusho-arasoi-subsection">
        <h3>{t('torikumi.yusho.contendersTitle')}</h3>
        <ul className="yusho-contenders-list">
          {summary.contenders.map((contender) => (
            <li
              key={contender.profileUrl}
              className={`yusho-contender-item${contender.diffFromLeader === 0 ? ' is-leader' : ''}`}
            >
              <span className="yusho-contender-diff">
                {contender.diffFromLeader === 0
                  ? t('torikumi.yusho.leaderLabel')
                  : t('torikumi.yusho.diffLabel', { diff: contender.diffFromLeader })}
              </span>
              {contender.id !== null ? (
                <Link to={banzukeRikishiPath(banzukePath, contender.id)} className="yusho-contender-name">
                  {contender.name}
                </Link>
              ) : (
                <span className="yusho-contender-name">{contender.name}</span>
              )}
              <span className="yusho-contender-record">
                {t('torikumi.yusho.record', { wins: contender.wins, losses: contender.losses })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 本日の注目対戦 */}
      {summary.featuredBouts.length > 0 && (
        <div className="yusho-arasoi-subsection">
          <h3>{t('torikumi.yusho.featuredTitle')}</h3>
          <ul className="yusho-featured-bouts">
            {summary.featuredBouts.map((bout) => {
              const eastRecordText = bout.eastRecord
                ? `（${t('torikumi.yusho.record', { wins: bout.eastRecord.wins, losses: bout.eastRecord.losses })}）`
                : '';
              const westRecordText = bout.westRecord
                ? `（${t('torikumi.yusho.record', { wins: bout.westRecord.wins, losses: bout.westRecord.losses })}）`
                : '';
              const eastMark = bout.winner === 'east' ? '○ ' : bout.winner === 'west' ? '● ' : '';
              const westMark = bout.winner === 'west' ? '○ ' : bout.winner === 'east' ? '● ' : '';

              return (
                <li
                  key={bout.boutNo}
                  className={`yusho-featured-bout${bout.isDirectMatchup ? ' is-direct' : ''}`}
                >
                  <a href={`#${divisionAnchorId('幕内', bout.boutNo)}`} className="yusho-featured-bout-link">
                    <span className="yusho-featured-matchup">
                      {eastMark}{bout.eastName}{eastRecordText} − {westMark}{bout.westName}{westRecordText}
                    </span>
                    {bout.isDirectMatchup ? (
                      <span className="yusho-direct-badge">{t('torikumi.yusho.directMatchupBadge')}</span>
                    ) : null}
                    {bout.winner ? (
                      <span className="yusho-featured-kimarite">{bout.kimarite}</span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 3. 残りの直接対決（未対戦・対戦済み） */}
      {(summary.unplayedMatchups.length > 0 || summary.playedMatchups.length > 0) && (
        <div className="yusho-arasoi-subsection">
          <h3>{t('torikumi.yusho.matchupsTitle')}</h3>
          {summary.unplayedMatchups.length > 0 && (
            <div className="yusho-matchups-group">
              <div className="yusho-matchups-label">
                {t('torikumi.yusho.unplayedLabel', { count: summary.unplayedMatchups.length })}
              </div>
              <ul className="yusho-unplayed-list">
                {summary.unplayedMatchups.map((pair) => (
                  <li
                    key={`${pair.rikishiA.profileUrl}-${pair.rikishiB.profileUrl}`}
                    className={`yusho-unplayed-chip${pair.isLeaderClash ? ' is-leader-clash' : ''}`}
                  >
                    <span>{pair.rikishiA.name} − {pair.rikishiB.name}</span>
                    {pair.isLeaderClash ? (
                      <span className="yusho-leader-clash-badge">{t('torikumi.yusho.leaderClashBadge')}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {summary.playedMatchups.length > 0 && (
            <div className="yusho-matchups-group">
              <div className="yusho-matchups-label">
                {t('torikumi.yusho.playedLabel', { count: summary.playedMatchups.length })}
              </div>
              <ul className="yusho-played-list">
                {summary.playedMatchups.map((item) => (
                  <li key={`${item.day}-${item.winnerProfileUrl}-${item.loserProfileUrl}`} className="yusho-played-item">
                    {t('torikumi.yusho.playedLine', {
                      day: item.dayLabel,
                      winner: item.winnerName,
                      loser: item.loserName,
                      kimarite: item.kimarite,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4. 優勝条件の短文 */}
      {summary.conditions.length > 0 && (
        <div className="yusho-arasoi-subsection">
          <h3>{t('torikumi.yusho.conditionsTitle')}</h3>
          <ul className="yusho-conditions-list">
            {summary.conditions.map((cond, idx) => (
              <li key={idx} className="yusho-condition-item">
                {renderConditionText(cond, t, isJa)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
