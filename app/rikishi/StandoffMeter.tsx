import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getRecentBouts, type RecentBoutResult } from '../lib/rikishi-compare-data';

export interface StandoffMeterProps {
  /** First rikishi display name (East slot) */
  nameA: string;
  /** Second rikishi display name (West slot) */
  nameB: string;
  /** Number of recent bouts to display per side */
  limit?: number;
}

/**
 * Visualises the "standoff" between two rikishi by laying out their most
 * recent `limit` bout results as ○/●/− glyphs on either side of a central
 * shikiri (仕切り) marker. The Yūgen tone drives the palette.
 */
export function StandoffMeter({ nameA, nameB, limit = 5 }: StandoffMeterProps) {
  const { t } = useTranslation('common');

  const boutsA = useMemo<RecentBoutResult[]>(() => getRecentBouts(nameA, limit), [nameA, limit]);
  const boutsB = useMemo<RecentBoutResult[]>(() => getRecentBouts(nameB, limit), [nameB, limit]);

  if (boutsA.length === 0 && boutsB.length === 0) return null;

  const winsA = boutsA.filter((b) => b.outcome === 'win').length;
  const winsB = boutsB.filter((b) => b.outcome === 'win').length;
  const ariaLabel = t('comparison.standoffAriaLabel', {
    nameA,
    countA: boutsA.length,
    winsA,
    nameB,
    countB: boutsB.length,
    winsB,
  });

  return (
    <section className="standoff-meter" aria-labelledby="standoff-meter-title">
      <h2 id="standoff-meter-title" className="standoff-meter__title">
        {t('comparison.standoffTitle')}
      </h2>
      <p className="standoff-meter__subtitle">{t('comparison.standoffSubtitle')}</p>
      <div className="standoff-meter__arena" role="img" aria-label={ariaLabel}>
        <div className="standoff-meter__side standoff-meter__side--a">
          <span className="standoff-meter__name">{nameA}</span>
          <ol className="standoff-meter__bouts">
            {boutsA.map((b, i) => (
              <li
                key={`a-${i}`}
                className={`standoff-meter__bout standoff-meter__bout--${b.outcome}`}
              >
                {b.glyph}
              </li>
            ))}
            {boutsA.length === 0 ? <li className="standoff-meter__empty">—</li> : null}
          </ol>
        </div>
        <div className="standoff-meter__gap" aria-hidden="true">
          <span className="standoff-meter__shikiri">{t('comparison.standoffShikiri')}</span>
        </div>
        <div className="standoff-meter__side standoff-meter__side--b">
          <ol className="standoff-meter__bouts">
            {boutsB.map((b, i) => (
              <li
                key={`b-${i}`}
                className={`standoff-meter__bout standoff-meter__bout--${b.outcome}`}
              >
                {b.glyph}
              </li>
            ))}
            {boutsB.length === 0 ? <li className="standoff-meter__empty">—</li> : null}
          </ol>
          <span className="standoff-meter__name">{nameB}</span>
        </div>
      </div>
    </section>
  );
}
