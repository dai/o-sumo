import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { divisionAnchorId } from '../lib/rikishi-display';
import { banzukeRikishiPath, extractRikishiIdFromProfileUrl } from '../lib/rikishi-profile';
import {
  describeClashOutcome,
  formatMonthDay,
  getFeaturedHeadingRel,
  type FeaturedHeadingRel,
  type YushoArasoiSummary,
  type YushoClashOutcome,
  type YushoConditionRow,
} from '../lib/yusho-arasoi';
import { getJstIsoDate } from '../lib/relative-date';

type TFn = ReturnType<typeof useTranslation>['t'];

function joinNames(names: string[], isJa: boolean): string {
  return names.join(isJa ? '・' : ', ');
}

function RikishiLink({ banzukePath, id, name, className }: { banzukePath: string; id: number | null; name: string; className: string }) {
  if (id !== null) {
    return (
      <Link to={banzukeRikishiPath(banzukePath, id)} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

function BasisLine({ summary, t, basisLabel, targetLabel }: { summary: YushoArasoiSummary; t: TFn; basisLabel: string; targetLabel: string }) {
  const done = t('torikumi.yusho.basisDone', { day: basisLabel });
  const text =
    summary.basisDay !== summary.targetDay
      ? `${done} ・ ${t('torikumi.yusho.basisUpcoming', { day: targetLabel })}`
      : done;
  return <span className="yusho-arasoi-basis">{text}</span>;
}

function resolveToday(summary: YushoArasoiSummary, todayIsoDate: string | undefined): FeaturedHeadingRel | null {
  if (!summary.pageIsoDate) return null;
  const now = todayIsoDate ? new Date(`${todayIsoDate}T12:00:00+09:00`) : new Date();
  if (Number.isNaN(now.getTime())) return null;
  const todayIso = todayIsoDate ?? getJstIsoDate(now);
  return getFeaturedHeadingRel(summary.pageIsoDate, todayIso);
}

function FeaturedHeading({ summary, rel, t, lang, targetLabel }: { summary: YushoArasoiSummary; rel: FeaturedHeadingRel | null; t: TFn; lang: string; targetLabel: string }) {
  if (!summary.pageIsoDate || !rel) {
    return <h3>{t('torikumi.yusho.featuredTitle')}</h3>;
  }
  const date = formatMonthDay(summary.pageIsoDate, lang);
  const key =
    rel === 'today'
      ? 'torikumi.yusho.featToday'
      : rel === 'yesterday'
        ? 'torikumi.yusho.featYesterday'
        : rel === 'tomorrow'
          ? 'torikumi.yusho.featTomorrow'
          : 'torikumi.yusho.featDateOnly';
  return <h3>{t(key, { date, day: targetLabel })}</h3>;
}

function ContendersTable({
  summary,
  banzukePath,
  isToday,
  t,
}: {
  summary: YushoArasoiSummary;
  banzukePath: string;
  isToday: boolean;
  t: TFn;
}) {
  const opponentHeader = t(isToday ? 'torikumi.yusho.contTableOpponentToday' : 'torikumi.yusho.contTableOpponent');
  return (
    <table className="yusho-table yusho-contenders-table" aria-label={t('torikumi.yusho.contendersTitle')}>
      <thead>
        <tr>
          <th scope="col">{t('torikumi.yusho.contTableDiff')}</th>
          <th scope="col">{t('torikumi.yusho.contTableRikishi')}</th>
          <th scope="col">{t('torikumi.yusho.contTableRecord')}</th>
          <th scope="col">{t('torikumi.yusho.contTableRemaining')}</th>
          <th scope="col">{t('torikumi.yusho.contTableMax')}</th>
          <th scope="col">{opponentHeader}</th>
        </tr>
      </thead>
      <tbody>
        {summary.contenders.map((contender) => (
          <tr key={contender.profileUrl} className={contender.diffFromLeader === 0 ? 'is-leader' : undefined}>
            <td className="yusho-cell-diff">
              <span className="yusho-contender-diff">
                {contender.diffFromLeader === 0
                  ? t('torikumi.yusho.leaderLabel')
                  : t('torikumi.yusho.diffLabel', { diff: contender.diffFromLeader })}
              </span>
            </td>
            <td className="yusho-cell-name">
              <RikishiLink banzukePath={banzukePath} id={contender.id} name={contender.name} className="yusho-contender-name" />
            </td>
            <td className="yusho-cell-record">
              {t('torikumi.yusho.record', { wins: contender.wins, losses: contender.losses })}
            </td>
            <td className="yusho-cell-num">{contender.remainingBouts}</td>
            <td className="yusho-cell-record">
              {t('torikumi.yusho.record', { wins: contender.maxPossibleWins, losses: contender.losses })}
            </td>
            <td className="yusho-cell-name">
              {contender.dayOpponent ? (
                contender.dayOpponent.name ? (
                  <RikishiLink
                    banzukePath={banzukePath}
                    id={extractRikishiIdFromProfileUrl(contender.dayOpponent.profileUrl)}
                    name={contender.dayOpponent.name}
                    className="yusho-contender-name"
                  />
                ) : (
                  <span aria-hidden="true">―</span>
                )
              ) : (
                <span className="yusho-no-bout">{t('torikumi.yusho.contTableNoBout')}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HeadToHeadMatrix({
  summary,
  banzukePath,
  rel,
  t,
  isJa,
}: {
  summary: YushoArasoiSummary;
  banzukePath: string;
  rel: FeaturedHeadingRel | null;
  t: TFn;
  isJa: boolean;
}) {
  const cellByPair = new Map(summary.headToHead.map((cell) => [`${cell.aProfileUrl}|${cell.bProfileUrl}`, cell]));
  const lookup = (rowUrl: string, colUrl: string) =>
    cellByPair.get(`${rowUrl}|${colUrl}`) ?? cellByPair.get(`${colUrl}|${rowUrl}`);
  return (
    <table className="yusho-table yusho-matrix" aria-label={t('torikumi.yusho.matchupsTitle')}>
      <thead>
        <tr>
          <th scope="col">
            <span className="yusho-matrix-corner">{t('torikumi.yusho.matrixCorner')}</span>
          </th>
          {summary.contenders.map((c) => (
            <th scope="col" key={c.profileUrl}>
              <RikishiLink banzukePath={banzukePath} id={c.id} name={c.name} className="yusho-matrix-head-name" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {summary.contenders.map((row) => (
          <tr key={row.profileUrl}>
            <th scope="row">
              <RikishiLink banzukePath={banzukePath} id={row.id} name={row.name} className="yusho-matrix-head-name" />
            </th>
            {summary.contenders.map((col) => {
              if (row.profileUrl === col.profileUrl) {
                return (
                  <td key={col.profileUrl} className="yusho-matrix-cell is-self">
                    <span aria-hidden="true">―</span>
                  </td>
                );
              }
              const cell = lookup(row.profileUrl, col.profileUrl);
              if (!cell) {
                return (
                  <td key={col.profileUrl} className="yusho-matrix-cell is-unplayed">
                    {t('torikumi.yusho.matrixUnplayed')}
                  </td>
                );
              }
              if (cell.played) {
                const rowWon = cell.played.winnerProfileUrl === row.profileUrl;
                const winner = rowWon ? row.name : col.name;
                const loser = rowWon ? col.name : row.name;
                return (
                  <td
                    key={col.profileUrl}
                    className={`yusho-matrix-cell ${rowWon ? 'is-win' : 'is-loss'}`}
                    title={t('torikumi.yusho.playedLine', {
                      day: cell.played.dayLabel,
                      winner,
                      loser,
                      kimarite: cell.played.kimarite,
                    })}
                  >
                    {rowWon ? '○' : '●'} {cell.played.dayLabel}
                  </td>
                );
              }
              if (cell.scheduledDay !== null) {
                const label =
                  rel === 'today'
                    ? t('torikumi.yusho.matrixScheduledToday')
                    : rel === 'tomorrow'
                      ? t('torikumi.yusho.matrixScheduledTomorrow')
                      : t('torikumi.yusho.matrixUnplayed');
                const scheduledDayText = isJa
                  ? (cell.scheduledDayLabel ?? '')
                  : t('torikumi.day.dayHead', { day: cell.scheduledDay });
                return (
                  <td
                    key={col.profileUrl}
                    className="yusho-matrix-cell is-scheduled"
                    title={t('torikumi.yusho.matrixScheduledTitle', {
                      a: cell.aName,
                      b: cell.bName,
                      day: scheduledDayText,
                    })}
                  >
                    {label}
                  </td>
                );
              }
              return (
                <td
                  key={col.profileUrl}
                  className="yusho-matrix-cell is-unplayed"
                  title={t('torikumi.yusho.matrixUnplayedTitle', { a: cell.aName, b: cell.bName })}
                >
                  {t('torikumi.yusho.matrixUnplayed')}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConditionMain({ row, t, isJa }: { row: YushoConditionRow; t: TFn; isJa: boolean }) {
  const d = row.detail;
  switch (d.kind) {
    case 'leaderClinch': {
      const reachable = d.clinchWinsNeeded <= row.remainingBouts;
      const lines: string[] = [];
      if (reachable) {
        lines.push(
          d.clinchWinsNeeded === row.remainingBouts
            ? t('torikumi.yusho.condRowLeaderClinch', { maxWins: row.maxPossibleWins, maxLosses: row.maxLosses })
            : t('torikumi.yusho.condRowLeaderClinchWins', { winsNeeded: d.clinchWinsNeeded, clinchWins: d.clinchTargetWins }),
        );
        if (d.tieTierNames.length > 0) {
          lines.push(
            t('torikumi.yusho.condRowLeaderTie', {
              finishWins: d.tieFinishWins,
              finishLosses: row.maxLosses + 1,
              names: joinNames(d.tieTierNames, isJa),
            }),
          );
        }
      } else if (d.tieTierNames.length > 0) {
        lines.push(
          t('torikumi.yusho.condRowLeaderTieMax', {
            maxWins: row.maxPossibleWins,
            names: joinNames(d.tieTierNames, isJa),
          }),
        );
      } else {
        lines.push(
          t('torikumi.yusho.condRowLeaderClinch', { maxWins: row.maxPossibleWins, maxLosses: row.maxLosses }),
        );
      }
      return (
        <>
          {lines.map((line, idx) => (
            <span key={idx} className="yusho-cond-line">
              {line}
            </span>
          ))}
        </>
      );
    }
    case 'coLeader':
      return (
        <>
          {t(
            d.directClashNames.length > 0
              ? 'torikumi.yusho.condRowCoLeaderClash'
              : 'torikumi.yusho.condRowCoLeader',
            {
              maxWins: row.maxPossibleWins,
              maxLosses: row.maxLosses,
              names: joinNames(d.coLeaderNames, isJa),
              clashNames: joinNames(d.directClashNames, isJa),
            },
          )}
        </>
      );
    case 'chaserSweep':
      return (
        <>
          {t('torikumi.yusho.condRowChaserSweep', { maxWins: row.maxPossibleWins, maxLosses: row.maxLosses, top: row.topName })}
        </>
      );
    case 'chaserEqual':
      return (
        <>
          {t('torikumi.yusho.condRowChaserEqual', { maxWins: row.maxPossibleWins, maxLosses: row.maxLosses, top: row.topName })}
        </>
      );
    case 'chaser':
      return (
        <>
          {d.tieAdditionalLosses <= 0
            ? t('torikumi.yusho.condRowChaserZero', {
                maxWins: row.maxPossibleWins,
                maxLosses: row.maxLosses,
                top: row.topName,
              })
            : t('torikumi.yusho.condRowChaser', {
                maxWins: row.maxPossibleWins,
                maxLosses: row.maxLosses,
                top: row.topName,
                totalLosses: d.tieTotalLosses,
                belowWins: d.belowWins,
                belowLosses: d.belowLosses,
              })}
        </>
      );
    case 'playoffOnly':
      return (
        <>
          {t('torikumi.yusho.condRowPlayoffOnly', {
            maxWins: row.maxPossibleWins,
            maxLosses: row.maxLosses,
            top: row.topName,
          })}
        </>
      );
    case 'eliminated':
      return (
        <>
          {t('torikumi.yusho.condRowEliminated', {
            maxWins: row.maxPossibleWins,
            top: row.topName,
            topWins: row.leaderWins,
          })}
        </>
      );
  }
}

function ConditionFate({ row, t }: { row: YushoConditionRow; t: TFn }) {
  if (row.detail.kind === 'playoffOnly') {
    return <>{t('torikumi.yusho.fatePlayoffOnly')}</>;
  }
  if (row.detail.kind === 'eliminated') {
    return <>{t('torikumi.yusho.fateEliminated')}</>;
  }
  return null;
}

function ConditionsTable({
  summary,
  banzukePath,
  t,
  isJa,
}: {
  summary: YushoArasoiSummary;
  banzukePath: string;
  t: TFn;
  isJa: boolean;
}) {
  return (
    <table className="yusho-table yusho-conditions-table" aria-label={t('torikumi.yusho.conditionsTitle')}>
      <thead>
        <tr>
          <th scope="col">{t('torikumi.yusho.condTableRikishi')}</th>
          <th scope="col">{t('torikumi.yusho.condTableRecord')}</th>
          <th scope="col">{t('torikumi.yusho.condTableRemaining')}</th>
          <th scope="col">{t('torikumi.yusho.condTableMax')}</th>
          <th scope="col">{t('torikumi.yusho.condTableCondition')}</th>
          <th scope="col">{t('torikumi.yusho.condTableFate')}</th>
        </tr>
      </thead>
      <tbody>
        {summary.conditionRows.map((row) => (
          <tr key={row.profileUrl}>
            <td className="yusho-cell-name" data-label={t('torikumi.yusho.condTableRikishi')}>
              <RikishiLink banzukePath={banzukePath} id={row.id} name={row.name} className="yusho-contender-name" />
            </td>
            <td className="yusho-cell-record" data-label={t('torikumi.yusho.condTableRecord')}>
              {t('torikumi.yusho.record', { wins: row.wins, losses: row.losses })}
            </td>
            <td className="yusho-cell-num" data-label={t('torikumi.yusho.condTableRemaining')}>
              {row.remainingBouts}
            </td>
            <td className="yusho-cell-record" data-label={t('torikumi.yusho.condTableMax')}>
              {t('torikumi.yusho.record', { wins: row.maxPossibleWins, losses: row.losses })}
            </td>
            <td className="yusho-cell-condition" data-label={t('torikumi.yusho.condTableCondition')}>
              <ConditionMain row={row} t={t} isJa={isJa} />
            </td>
            <td className="yusho-cell-fate" data-label={t('torikumi.yusho.condTableFate')}>
              <ConditionFate row={row} t={t} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClashLine({ outcome, t }: { outcome: YushoClashOutcome; t: TFn }) {
  const relation =
    outcome.relation === 'sole'
      ? t('torikumi.yusho.clashRelSole')
      : outcome.relation === 'tied'
        ? t('torikumi.yusho.clashRelTied')
        : t('torikumi.yusho.clashRelChasing', { gap: outcome.gap });
  const note =
    outcome.loserFate === 'playoff-only'
      ? t('torikumi.yusho.clashNotePlayoff', { name: outcome.loserName })
      : outcome.loserFate === 'eliminated'
        ? t('torikumi.yusho.clashNoteEliminated', { name: outcome.loserName })
        : '';
  return (
    <>
      {t('torikumi.yusho.clashOutcome', {
        winner: outcome.winnerName,
        winnerWins: outcome.winnerWins,
        winnerLosses: outcome.winnerLosses,
        loser: outcome.loserName,
        loserWins: outcome.loserWins,
        loserLosses: outcome.loserLosses,
        relation,
        note,
      })}
    </>
  );
}

export default function YushoArasoiSection({
  summary,
  banzukePath,
  todayIsoDate,
}: {
  summary: YushoArasoiSummary;
  banzukePath: string;
  /** 検証用の閲覧日上書き（YYYY-MM-DD）。未指定時は端末の現在日（JST）。 */
  todayIsoDate?: string;
}) {
  const { t, i18n } = useTranslation('common');
  const isJa = i18n.language.startsWith('ja');
  const lang = isJa ? 'ja' : 'en';
  const rel = resolveToday(summary, todayIsoDate);
  const showClash = rel === 'today' || rel === 'tomorrow' || rel === 'future';
  const basisLabel = isJa ? summary.basisDayLabel : t('torikumi.day.dayHead', { day: summary.basisDay });
  const targetLabel = isJa ? summary.targetDayLabel : t('torikumi.day.dayHead', { day: summary.targetDay });

  if (summary.isDecided && summary.champion) {
    return (
      <section className="division-section yusho-arasoi-section yusho-arasoi-section--decided" aria-label={t('torikumi.yusho.title')}>
        <div className="yusho-arasoi-header">
          <h2>{t('torikumi.yusho.title')}</h2>
          <BasisLine summary={summary} t={t} basisLabel={basisLabel} targetLabel={targetLabel} />
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
        <BasisLine summary={summary} t={t} basisLabel={basisLabel} targetLabel={targetLabel} />
      </div>

      {/* 1. 首位グループの一覧＋表 */}
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
              <RikishiLink banzukePath={banzukePath} id={contender.id} name={contender.name} className="yusho-contender-name" />
              <span className="yusho-contender-record">
                {t('torikumi.yusho.record', { wins: contender.wins, losses: contender.losses })}
              </span>
            </li>
          ))}
        </ul>
        <ContendersTable summary={summary} banzukePath={banzukePath} isToday={rel === 'today'} t={t} />
      </div>

      {/* 2. 注目対戦（日付基準の見出し＋終了分は結果付き） */}
      {summary.featuredBouts.length > 0 && (
        <div className="yusho-arasoi-subsection">
          <FeaturedHeading summary={summary} rel={rel} t={t} lang={lang} targetLabel={targetLabel} />
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

      {/* 3. 首位グループの直接対決（マトリクス表） */}
      {summary.headToHead.length > 0 && (
        <div className="yusho-arasoi-subsection">
          <h3>{t('torikumi.yusho.matchupsTitle')}</h3>
          <div className="yusho-matrix-scroll">
            <HeadToHeadMatrix summary={summary} banzukePath={banzukePath} rel={rel} t={t} isJa={isJa} />
          </div>
        </div>
      )}

      {/* 4. 優勝条件（力士ごとの表） */}
      {summary.conditionRows.length > 0 && (
        <div className="yusho-arasoi-subsection">
          <h3>{t('torikumi.yusho.conditionsTitle')}</h3>
          <div className="yusho-matrix-scroll">
            <ConditionsTable summary={summary} banzukePath={banzukePath} t={t} isJa={isJa} />
          </div>
          {showClash &&
            summary.clashOutlines.map((outline) => (
              <p key={outline.boutNo} className="yusho-clash-line">
                <ClashLine outcome={describeClashOutcome(outline.east, outline.west, outline.othersBestWins)} t={t} />{' '}
                <ClashLine outcome={describeClashOutcome(outline.west, outline.east, outline.othersBestWins)} t={t} />
              </p>
            ))}
        </div>
      )}
    </section>
  );
}
