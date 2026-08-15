import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArchiveRouteConfigForPathname } from '../lib/torikumi-routes';

type PrimaryNavigationProps = {
  placement?: 'header' | 'footer';
};

type NavigationLink = {
  to: string;
  label: string;
};

function isActive(pathname: string, target: string): boolean {
  if (target === '/') return pathname === '/';
  return pathname.startsWith(target.replace(/\/$/, ''));
}

function isDirectoryRoute(pathname: string): boolean {
  return ['/rikishi/', '/my-rikishi/', '/compare/', '/gyoji/', '/yobidashi/'].some((path) => isActive(pathname, path));
}

export default function PrimaryNavigation({ placement = 'header' }: PrimaryNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const archive = getArchiveRouteConfigForPathname(location.pathname);
  const directoryActive = isDirectoryRoute(location.pathname);
  const links: NavigationLink[] = [
    { to: '/', label: t('global.nav.home') },
    { to: archive.banzukePath, label: t('global.nav.banzuke') },
    { to: archive.schedulePath, label: t('global.nav.schedule') },
    { to: archive.resultPath, label: t('global.nav.result') },
    { to: '/rikishi/', label: t('global.nav.directory') },
  ];
  const directoryLinks: NavigationLink[] = [
    { to: '/rikishi/', label: t('global.nav.rikishi') },
    { to: '/my-rikishi/', label: t('myRikishi.navLabel') },
    { to: '/compare/', label: t('comparison.navLabel') },
    { to: '/gyoji/', label: t('global.nav.gyoji') },
    { to: '/yobidashi/', label: t('global.nav.yobidashi') },
  ];

  return (
    <div className={`primary-navigation-shell primary-navigation-shell--${placement}`}>
      <nav className={`primary-navigation primary-navigation--${placement}`} aria-label={t('global.primaryNavigation')}>
        {links.map((link) => {
          const active = link.to === '/rikishi/' ? directoryActive : isActive(location.pathname, link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`primary-navigation__link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      {directoryActive ? (
        <nav className="directory-navigation" aria-label={t('global.directoryNavigation')}>
          <span className="directory-navigation__label">{t('global.directoryNavigation')}</span>
          {directoryLinks.map((link) => {
            const active = isActive(location.pathname, link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`directory-navigation__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
