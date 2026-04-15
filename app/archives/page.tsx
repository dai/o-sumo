import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PAST_BASHO } from '../lib/archives-data';
import './page.css';

export default function ArchivesPage() {
  const { t } = useTranslation('common');

  return (
    <div className="archives-page">
      <header className="archives-header">
        <h1>{t('archives.pageTitle')}</h1>
        <p>{t('archives.pageDescription')}</p>
      </header>

      <main className="archives-main">
        <div className="archives-list">
          {PAST_BASHO.map((archive) => (
            <article key={archive.id} className="archive-item">
              <header className="archive-item-header">
                <h2>{archive.year} {archive.name}</h2>
              </header>
              <div className="archive-item-links">
                <Link to={archive.bandukePath} className="archive-link">
                  {t('archives.banduke')}
                </Link>
                <Link to={archive.resultPath} className="archive-link">
                  {t('archives.result')}
                </Link>
                <Link to={archive.schedulePath} className="archive-link">
                  {t('archives.schedule')}
                </Link>
              </div>
            </article>
          ))}

          {PAST_BASHO.length === 0 && (
            <p className="archives-empty">{t('archives.empty')}</p>
          )}
        </div>
      </main>

      <footer className="archives-footer">
        <Link to="/">{t('archives.backToHome')}</Link>
      </footer>
    </div>
  );
}
