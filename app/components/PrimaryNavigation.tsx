import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArchiveRouteConfigForPathname } from '../lib/torikumi-routes';

type PrimaryNavigationProps = {
  placement?: 'header' | 'footer';
};

function isActive(pathname: string, target: string): boolean {
  if (target === '/') return pathname === '/';
  return pathname.startsWith(target.replace(/\/$/, ''));
}

export default function PrimaryNavigation({ placement = 'header' }: PrimaryNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const archive = getArchiveRouteConfigForPathname(location.pathname);
  const links = [
    { to: '/', label: t('global.nav.home') },
    { to: archive.banzukePath, label: t('global.nav.banzuke') },
    { to: archive.schedulePath, label: t('global.nav.schedule') },
    { to: archive.resultPath, label: t('global.nav.result') },
    { to: '/rikishi/', label: t('global.nav.rikishi') },
  ];

  return (
    <nav className={`primary-navigation primary-navigation--${placement}`} aria-label={t('global.primaryNavigation')}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`primary-navigation__link${isActive(location.pathname, link.to) ? ' is-active' : ''}`}
          aria-current={isActive(location.pathname, link.to) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
