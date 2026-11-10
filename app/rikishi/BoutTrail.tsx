import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getBashoStatus } from '../lib/basho-status';
import { formatBashoTitle } from '../lib/basho-meta';
import { canonicalShikona, divisionAnchorId } from '../lib/rikishi-display';
import { extractRikishiIdFromProfileUrl, rikishiProfilePath } from '../lib/rikishi-profile';
import { getRecentBouts, type RecentBoutResult } from '../lib/rikishi-compare-data';
import {
  torikumiData,
  torikumiMonthKey,
  type TorikumiArchiveDay,
  type TorikumiMatch,
} from '../lib/torikumi-data';
import { getDayPath } from '../lib/torikumi-routes';

export interface BoutTrailProps {
  shikona: string;
  /** Number of recent bouts to display */
  limit?: number;
}

/**
 * Compact "win trail" of a rikishi's most recent published bouts. Each
 * bout is a small square tagged ○ / ● / −. Visually similar to the
 * hoshitori stars on the banzuke page, but driven by the Yūgen palette.
 */
export function BoutTrail({ shikona, limit = 15 }: BoutTrailProps) {
  const { t } = useTranslation('common');
  const bouts = getRecentBouts(shikona, limit);
  if (bouts.length === 0) return null;

  const wins = bouts.filter((b: RecentBoutResult) => b.outcome === 'win').length;
  const losses = bouts.filter((b: RecentBoutResult) => b.outcome === 'loss').length;

  return (
    <div
      className="bout-trail"
      role="img"
      aria-label={t('rikishi.boutTrailLabel', { count: bouts.length, wins, losses })}
    >
      <h3 className="bout-trail__title">{t('rikishi.boutTrailTitle')}</h3>
      <ol className="bout-trail__list">
        {bouts.map((b, i) => (
          <li
            key={i}
            className={`bout-trail__cell bout-trail__cell--${b.outcome}`}
            aria-hidden="true"
          >
            {b.glyph}
          </li>
        ))}
      </ol>
    </div>
  );
}

type BoutOutcome = 'win' | 'loss' | 'pending' | 'absent' | 'draw';

export interface CurrentBashoBoutRow {
  day: number;
  label: string;
  opponentName: string;
  opponentHref: string | null;
  kimarite: string | null;
  outcome: BoutOutcome;
  dayHref: string;
}

export interface CurrentBashoCard {
  bashoLabel: string;
  today: CurrentBashoBoutRow | null;
  results: CurrentBashoBoutRow[];
}

interface RikishiIdentity {
  id: number;
  name: string;
  yomi: string;
}

function isThisRikishi(identity: RikishiIdentity, name: string, profileUrl: string): boolean {
  const id = extractRikishiIdFromProfileUrl(profileUrl);
  if (id != null && id === identity.id) return true;
  return name === identity.name || (identity.yomi.length > 0 && name === identity.yomi);
}

function findMatch(
  day: TorikumiArchiveDay,
  identity: RikishiIdentity,
): { division: '幕内' | '十両'; match: TorikumiMatch; side: 'east' | 'west' } | null {
  for (const divisionDay of [day.data.makuuchi, day.data.juryo]) {
    for (const match of divisionDay.matches) {
      if (isThisRikishi(identity, match.eastName, match.eastProfileUrl)) {
        return { division: divisionDay.division, match, side: 'east' };
      }
      if (isThisRikishi(identity, match.westName, match.westProfileUrl)) {
        return { division: divisionDay.division, match, side: 'west' };
      }
    }
  }
  return null;
}

function isAbsent(day: TorikumiArchiveDay, identity: RikishiIdentity): boolean {
  for (const divisionDay of [day.data.makuuchi, day.data.juryo]) {
    for (const absentee of divisionDay.absentees ?? []) {
      if (absentee.id === identity.id || absentee.name === identity.name) return true;
    }
  }
  return false;
}

function opponentOf(match: TorikumiMatch, side: 'east' | 'west'): { name: string; url: string } {
  if (side === 'east') {
    return { name: match.westName, url: match.westProfileUrl };
  }
  return { name: match.eastName, url: match.eastProfileUrl };
}

function outcomeOf(match: TorikumiMatch, side: 'east' | 'west'): BoutOutcome {
  if (!match.winner) {
    if (match.kimarite && match.kimarite !== '未定') return 'draw';
    return 'pending';
  }
  return match.winner === side ? 'win' : 'loss';
}

export function getCurrentBashoCard(
  identity: RikishiIdentity,
  now: Date = new Date(),
  lang = 'ja',
): CurrentBashoCard | null {
  const resultDays = torikumiData.resultDays ?? [];
  const scheduleDays = torikumiData.scheduleDays ?? [];
  const dayNumbers = [...new Set([...resultDays, ...scheduleDays].map((day) => day.day))]
    .sort((left, right) => left - right);
  const status = getBashoStatus(torikumiData, now);
  const rows: CurrentBashoBoutRow[] = [];

  for (const dayNumber of dayNumbers) {
    const resultDay = resultDays.find((day) => day.day === dayNumber);
    const scheduleDay = scheduleDays.find((day) => day.day === dayNumber);
    const resultMatch = resultDay ? findMatch(resultDay, identity) : null;
    const scheduleMatch = scheduleDay ? findMatch(scheduleDay, identity) : null;
    const matched = resultMatch ?? scheduleMatch;
    const sourceDay = resultMatch ? resultDay : scheduleMatch ? scheduleDay : resultDay ?? scheduleDay;
    if (!sourceDay) continue;

    if (!matched) {
      const absent = (resultDay != null && isAbsent(resultDay, identity))
        || (scheduleDay != null && isAbsent(scheduleDay, identity));
      if (!absent) continue;
      rows.push({
        day: dayNumber,
        label: sourceDay.label,
        opponentName: '',
        opponentHref: null,
        kimarite: null,
        outcome: 'absent',
        dayHref: getDayPath(sourceDay, 'result'),
      });
      continue;
    }

    const day = (resultMatch ? resultDay : scheduleDay) ?? sourceDay;
    const opponent = opponentOf(matched.match, matched.side);
    const outcome = resultMatch ? outcomeOf(matched.match, matched.side) : 'pending';
    const opponentId = extractRikishiIdFromProfileUrl(opponent.url);
    const kimarite = matched.match.kimarite && matched.match.kimarite !== '未定'
      ? matched.match.kimarite
      : null;
    rows.push({
      day: dayNumber,
      label: day.label,
      opponentName: canonicalShikona(opponent.url, opponent.name),
      opponentHref: opponentId == null ? null : rikishiProfilePath(opponentId),
      kimarite: outcome === 'pending' ? null : kimarite,
      outcome,
      dayHref: `${getDayPath(day, outcome === 'pending' ? 'schedule' : 'result')}#${divisionAnchorId(matched.division, matched.match.boutNo)}`,
    });
  }

  if (rows.length === 0) return null;

  const today = status.kind === 'live' && status.day != null
    ? rows.find((row) => row.day === status.day) ?? null
    : null;
  const results = rows.filter((row) => (
    row.outcome !== 'pending'
    && (status.kind !== 'live' || status.day == null || row.day <= status.day)
  ));

  return {
    bashoLabel: formatBashoTitle({
      year: torikumiData.year,
      bashoName: torikumiData.bashoName,
      monthKey: torikumiMonthKey,
    }, lang),
    today,
    results,
  };
}

function boutOutcomeLabel(outcome: BoutOutcome, t: TFunction, isEn: boolean): string {
  switch (outcome) {
    case 'win':
      return t('myRikishi.matchWin');
    case 'loss':
      return t('myRikishi.matchLoss');
    case 'pending':
      return t('myRikishi.matchPending');
    case 'draw':
      return t('myRikishi.matchDraw');
    case 'absent':
      return isEn ? 'Absent' : '休場';
    default: {
      const unreachable: never = outcome;
      return unreachable;
    }
  }
}

function OpponentLink({ row }: { row: CurrentBashoBoutRow }) {
  if (!row.opponentName) return null;
  if (!row.opponentHref) return <span>{row.opponentName}</span>;
  return <Link to={row.opponentHref}>{row.opponentName}</Link>;
}

export function CurrentBashoBouts({ id, name, yomi }: RikishiIdentity) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language.startsWith('en');
  const card = getCurrentBashoCard({ id, name, yomi }, new Date(), i18n.language);
  if (!card) return null;

  const heading = isEn ? 'Bouts this basho' : '今場所の取組';
  const todayLabel = isEn ? "Today's opponent" : '今日の相手';
  const resultsLabel = isEn ? 'Results so far' : 'これまでの結果';

  return (
    <section className="rikishi-current-basho" aria-labelledby="rikishi-current-basho-title">
      <h2 id="rikishi-current-basho-title">{heading}</h2>
      <p className="rikishi-current-basho__basho">{card.bashoLabel}</p>
      {card.today ? (
        <div className="rikishi-current-basho__today">
          <span className="rikishi-current-basho__label">{todayLabel}</span>
          <OpponentLink row={card.today} />
          <span>{boutOutcomeLabel(card.today.outcome, t, isEn)}</span>
          {card.today.kimarite ? (
            <span className="rikishi-current-basho__kimarite">{card.today.kimarite}</span>
          ) : null}
        </div>
      ) : null}
      {card.results.length > 0 ? (
        <>
          <h3 className="rikishi-current-basho__results-title">{resultsLabel}</h3>
          <ol className="rikishi-current-basho__list">
            {card.results.map((row) => (
              <li key={row.day} className="rikishi-current-basho__row">
                <Link to={row.dayHref}>{row.label}</Link>
                <OpponentLink row={row} />
                <span>{boutOutcomeLabel(row.outcome, t, isEn)}</span>
                {row.kimarite ? (
                  <span className="rikishi-current-basho__kimarite">{row.kimarite}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}
