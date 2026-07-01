import React from 'react';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import {
  KIMARITE_LIST,
  CATEGORY_ORDER,
  CATEGORY_COUNTS,
  getKimariteByCategory,
  type KimariteCategory,
} from '../lib/kimarite-data';
import './page.css';

const CATEGORY_KEYS: Record<KimariteCategory, { ja: string; en: string }> = {
  kihon: { ja: '基本技', en: 'Basic techniques' },
  nage: { ja: '投げ手', en: 'Throwing techniques' },
  kake: { ja: '掛け手', en: 'Leg tripping techniques' },
  hineri: { ja: '捻り手', en: 'Twist down techniques' },
  sori: { ja: '反り手', en: 'Backwards body drop techniques' },
  tokushu: { ja: '特殊技', en: 'Special techniques' },
};

export default function KimaritePage() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ja';
  const isJa = locale.startsWith('ja');
  const grouped = React.useMemo(() => getKimariteByCategory(), []);

  return (
    <div className="kimarite-page">
      <header className="kimarite-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <h1 className="kimarite-header-title">{t('kimarite.pageTitle')}</h1>
        <p className="kimarite-header-description">{t('kimarite.pageDescription')}</p>
        <p className="kimarite-header-count">{t('kimarite.totalCount', { count: KIMARITE_LIST.length })}</p>
      </header>

      <main className="kimarite-main">
        <nav className="kimarite-toc" aria-label={t('kimarite.tocLabel')}>
          <h2 className="kimarite-toc-heading">{t('kimarite.tocHeading')}</h2>
          <ol className="kimarite-toc-list">
            {CATEGORY_ORDER.map((cat) => (
              <li key={cat}>
                <a href={`#cat-${cat}`} className="kimarite-toc-link">
                  <span className="kimarite-toc-ja">{CATEGORY_KEYS[cat].ja}</span>
                  <span className="kimarite-toc-en">{CATEGORY_KEYS[cat].en}</span>
                  <span className="kimarite-toc-count">{CATEGORY_COUNTS[cat]}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {CATEGORY_ORDER.map((cat) => (
          <section key={cat} className="kimarite-category" aria-labelledby={`cat-${cat}-heading`}>
            <header className="kimarite-category-header">
              <h2 id={`cat-${cat}-heading`} className="kimarite-category-heading">
                <span className="kimarite-category-heading-ja">{CATEGORY_KEYS[cat].ja}</span>
                <span className="kimarite-category-heading-en">{CATEGORY_KEYS[cat].en}</span>
              </h2>
              <p className="kimarite-category-count">{t('kimarite.categoryCount', { count: grouped[cat].length })}</p>
            </header>
            <ol className="kimarite-entry-list">
              {grouped[cat].map((k) => (
                <li key={k.id} className="kimarite-entry">
                  <div className="kimarite-entry-ja">
                    <p className="kimarite-entry-name">{k.nameJa}</p>
                    <p className="kimarite-entry-reading">{k.reading}</p>
                    <p className="kimarite-entry-description">{k.descriptionJa}</p>
                  </div>
                  <div className="kimarite-entry-en">
                    <p className="kimarite-entry-romaji">{k.romaji}</p>
                    <p className="kimarite-entry-english">{k.english}</p>
                    <p className="kimarite-entry-description">{k.descriptionEn}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="kimarite-sources" aria-labelledby="kimarite-sources-heading">
          <h2 id="kimarite-sources-heading" className="kimarite-sources-heading">
            {t('kimarite.sourcesHeading')}
          </h2>
          <ul className="kimarite-sources-list">
            <li>
              <a
                href="https://www.sumo.or.jp/IrohaKyokai/Kimarite/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('kimarite.sourceJsa')}
              </a>
            </li>
            <li>
              <a
                href="https://abema.tv/lp/sumo-winning-technique"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('kimarite.sourceAbema')}
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Kimarite"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('kimarite.sourceWikipedia')}
              </a>
            </li>
          </ul>
          {isJa ? null : (
            <p className="kimarite-sources-note">{t('kimarite.dualLanguageNote')}</p>
          )}
        </section>
      </main>

      <footer className="kimarite-footer">
        <nav aria-label={t('kimarite.footerNavigation')}>
          <HomeLink placement="footer" />
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            {t('banzuke.footerGithub')}
          </a>
        </nav>
      </footer>
    </div>
  );
}