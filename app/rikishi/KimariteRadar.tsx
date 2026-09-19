import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getRikishiKimariteStats } from '../lib/rikishi-compare-data';

export interface KimariteRadarProps {
  shikona: string;
  /** How many top kimarite to render */
  limit?: number;
}

/**
 * Horizontal "radar" of a rikishi's most-used winning techniques. The
 * fills use the Yūgen amber gradient; the section background uses the
 * Yūgen base so it stands apart from the surrounding Washi surface.
 */
export function KimariteRadar({ shikona, limit = 4 }: KimariteRadarProps) {
  const { t } = useTranslation('common');
  const stats = useMemo(() => getRikishiKimariteStats(shikona, limit), [shikona, limit]);
  if (stats.length === 0) return null;
  const max = Math.max(...stats.map((s) => s.count));

  return (
    <section className="kimarite-radar" aria-labelledby="kimarite-radar-title">
      <h2 id="kimarite-radar-title" className="kimarite-radar__title">
        {t('rikishi.kimariteRadarTitle')}
      </h2>
      <p className="kimarite-radar__subtitle">{t('rikishi.kimariteRadarSubtitle')}</p>
      <ol className="kimarite-radar__list">
        {stats.map((item) => (
          <li key={item.name} className="kimarite-radar__row">
            <span className="kimarite-radar__name">{item.name}</span>
            <div className="kimarite-radar__bar" aria-hidden="true">
              <div
                className="kimarite-radar__fill"
                style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
              />
            </div>
            <span className="kimarite-radar__count">
              {t('rikishi.kimariteCount', { count: item.count })}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
