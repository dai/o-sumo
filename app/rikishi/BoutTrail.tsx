import { useTranslation } from 'react-i18next';
import { getRecentBouts, type RecentBoutResult } from '../lib/rikishi-compare-data';

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
