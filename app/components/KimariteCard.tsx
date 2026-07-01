import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KIMARITE_LIST } from '../lib/kimarite-data';

const HIGHLIGHTS: ReadonlyArray<{ id: string; ja: string; romaji: string; en: string }> = [
  { id: 'yorikiri', ja: '寄り切り', romaji: 'yorikiri', en: 'frontal force out' },
  { id: 'oshidashi', ja: '押し出し', romaji: 'oshidashi', en: 'frontal push out' },
  { id: 'uwatenage', ja: '上手投げ', romaji: 'uwatenage', en: 'overarm throw' },
  { id: 'hatakikomi', ja: '叩き込み', romaji: 'hatakikomi', en: 'slap down' },
  { id: 'tsuriotoshi', ja: '吊り落とし', romaji: 'tsuriotoshi', en: 'overarm throw down' },
];

export default function KimariteCard() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ja';
  const isJa = locale.startsWith('ja');

  return (
    <section className="kimarite-home-section" aria-labelledby="kimarite-home-title">
      <div className="kimarite-home-header">
        <div className="kimarite-home-title-block">
          <h2 id="kimarite-home-title" className="kimarite-home-title">
            {t('kimarite.cardTitle')}
          </h2>
          <p className="kimarite-home-subtitle">{t('kimarite.cardSubtitle')}</p>
        </div>
        <Link to="/kimarite/" className="kimarite-home-see-all">
          {t('kimarite.cardSeeAll')}
          <span aria-hidden="true" className="kimarite-home-see-all-arrow">
            →
          </span>
        </Link>
      </div>

      <ul className="kimarite-home-list" aria-label={t('kimarite.cardListLabel')}>
        {HIGHLIGHTS.map((h) => (
          <li key={h.id} className={`kimarite-home-item kimarite-home-item--${h.id}`}>
            <Link to="/kimarite/" className="kimarite-home-link">
              <span className="kimarite-home-name">{h.ja}</span>
              <span className="kimarite-home-meta">
                <span className="kimarite-home-romaji">{h.romaji}</span>
                {isJa ? null : <span className="kimarite-home-en">{h.en}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="kimarite-home-count">{t('kimarite.totalCount', { count: KIMARITE_LIST.length })}</p>
    </section>
  );
}