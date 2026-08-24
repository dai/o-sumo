import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import './page.css';

export default function AboutPage() {
  const { t } = useTranslation('common');

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <h1 className="about-header-title">{t('about.pageTitle')}</h1>
        </div>
        <div className="site-header-desc-row">
          <p className="about-header-description">{t('about.pageDescription')}</p>
        </div>
      </header>

      <main className="about-main">
        {/* Site Overview */}
        <section className="about-section" aria-labelledby="about-site-heading">
          <h2 id="about-site-heading" className="about-section-heading">
            {t('about.siteSection.title')}
          </h2>
          <p className="about-text">{t('about.siteSection.description')}</p>
          <h3 className="about-subsection-heading">{t('about.siteSection.featuresTitle')}</h3>
          <ul className="about-features-list">
            <li>{t('about.siteSection.feature1')}</li>
            <li>{t('about.siteSection.feature2')}</li>
            <li>{t('about.siteSection.feature3')}</li>
            <li>{t('about.siteSection.feature4')}</li>
          </ul>
        </section>

        {/* Data Sources and Disclaimer */}
        <section className="about-section" aria-labelledby="about-data-heading">
          <h2 id="about-data-heading" className="about-section-heading">
            {t('about.dataSection.title')}
          </h2>
          <p className="about-text">{t('about.dataSection.sourceText')}</p>
          <p className="about-text">{t('about.dataSection.disclaimerText')}</p>
        </section>

        {/* Privacy Policy & AdSense / Analytics */}
        <section className="about-section" aria-labelledby="about-privacy-heading">
          <h2 id="about-privacy-heading" className="about-section-heading">
            {t('about.privacySection.title')}
          </h2>

          <h3 className="about-subsection-heading">{t('about.privacySection.adsTitle')}</h3>
          <p className="about-text">{t('about.privacySection.adsText')}</p>
          <p className="about-text">{t('about.privacySection.optoutText')}</p>

          <h3 className="about-subsection-heading">{t('about.privacySection.analyticsTitle')}</h3>
          <p className="about-text">{t('about.privacySection.analyticsText')}</p>
        </section>

        {/* Operator Information & Contact */}
        <section className="about-section" aria-labelledby="about-operator-heading">
          <h2 id="about-operator-heading" className="about-section-heading">
            {t('about.operatorSection.title')}
          </h2>
          <p className="about-text">
            <strong>{t('about.operatorSection.operatorLabel')}:</strong> {t('about.operatorSection.operatorValue')}
          </p>
          <p className="about-text">{t('about.operatorSection.contactText')}</p>
          <div className="about-contact-links">
            <a
              href="https://x.com/daisuke"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              {t('about.operatorSection.xLink')}
            </a>
            <a
              href="https://github.com/dai/o-sumo"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              {t('about.operatorSection.githubLink')}
            </a>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <nav aria-label="Aboutページのフッターリンク">
          <HomeLink placement="footer" />
          <span> | </span>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">
            {t('home.footerDaisuke')}
          </a>
          <span> | </span>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            {t('home.footerGithub')}
          </a>
        </nav>
      </footer>
    </div>
  );
}
