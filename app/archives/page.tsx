import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CURRENT_BASHO_ID, PAST_BASHO } from '../lib/archives-data';
import { getArchiveRouteConfigByMonthKey, stripTrailingSlash } from '../lib/torikumi-routes';
import { getBashoStatus } from '../lib/basho-status';
import HomeLink from '../components/HomeLink';
import PageBreadcrumb from '../components/PageBreadcrumb';
import './page.css';

export default function ArchivesPage() {
  const { t } = useTranslation('common');
  const current = getArchiveRouteConfigByMonthKey(CURRENT_BASHO_ID);
  const archives = current && getBashoStatus(current.archive).kind === 'final'
    ? [
        {
          id: current.monthKey,
          year: current.archive.year,
          name: current.archive.bashoName,
          data: current.archive,
          banzukePath: stripTrailingSlash(current.banzukePath),
          resultPath: stripTrailingSlash(current.resultPath),
          schedulePath: stripTrailingSlash(current.schedulePath),
        },
        ...PAST_BASHO.filter((archive) => archive.id !== current.monthKey),
      ]
    : PAST_BASHO;

  return (
    <div className="archives-page">
      <header className="archives-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <h1 className="site-header-title">{t('archives.pageTitle')}</h1>
        </div>
        <div className="site-header-desc-row">
          <p>{t('archives.pageDescription')}</p>
        </div>
      </header>

      <main className="archives-main">
        <PageBreadcrumb
          ariaLabel={t('rikishi.breadcrumbLabel')}
          items={[
            { label: t('global.homeLink'), href: '/' },
            { label: t('archives.crumb') },
          ]}
        />
        <div className="archives-list">
          {archives.map((archive) => (
            <article key={archive.id} className="archive-item">
              <header className="archive-item-header">
                <h2>{archive.year} {archive.name}</h2>
              </header>
              <div className="archive-item-links">
                <Link to={`${archive.banzukePath}/`} className="archive-link">
                  {t('archives.banzuke')}
                </Link>
                <Link to={`${archive.resultPath}/`} className="archive-link">
                  {t('archives.result')}
                </Link>
                <Link to={`${archive.schedulePath}/`} className="archive-link">
                  {t('archives.schedule')}
                </Link>
              </div>
            </article>
          ))}

          {archives.length === 0 && (
            <p className="archives-empty">{t('archives.empty')}</p>
          )}
        </div>
      </main>

      <footer className="archives-footer">
        <HomeLink placement="footer" />
      </footer>
    </div>
  );
}
