import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArchiveRouteConfigForPathname } from '../lib/torikumi-routes';
import { useMyRikishi } from '../lib/my-rikishi';

type PrimaryNavigationProps = {
  placement?: 'header' | 'footer';
};

type NavigationLink = {
  to: string;
  label: string;
};

function normalizePath(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function isActive(pathname: string, target: string): boolean {
  const normalizedPathname = normalizePath(pathname);
  const normalizedTarget = normalizePath(target);
  if (normalizedTarget === '/') return normalizedPathname === '/';
  return normalizedPathname === normalizedTarget || normalizedPathname.startsWith(`${normalizedTarget}/`);
}

function isDirectoryRoute(pathname: string): boolean {
  return ['/rikishi/', '/my-rikishi/', '/compare/', '/gyoji/', '/yobidashi/'].some((path) => isActive(pathname, path));
}

export default function PrimaryNavigation({ placement = 'header' }: PrimaryNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { ids: myRikishiIds } = useMyRikishi();
  const archive = getArchiveRouteConfigForPathname(location.pathname);
  const directoryActive = isDirectoryRoute(location.pathname);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const directoryTrayRef = useRef<HTMLDivElement>(null);
  const directoryTriggerRef = useRef<HTMLButtonElement>(null);
  const directoryPanelId = 'people-directory-navigation';
  const myRikishiCountLabel = myRikishiIds.length > 0 ? ` (${myRikishiIds.length})` : '';
  const links: NavigationLink[] = [
    { to: archive.banzukePath, label: t('global.nav.banzuke') },
    { to: archive.schedulePath, label: t('global.nav.schedule') },
    { to: archive.resultPath, label: t('global.nav.result') },
    { to: '/rikishi/', label: t('global.nav.directory') },
  ];
  const directoryLinks: NavigationLink[] = [
    { to: '/rikishi/', label: t('global.nav.rikishi') },
    { to: '/my-rikishi/', label: `${t('myRikishi.navLabel')}${myRikishiCountLabel}` },
    { to: '/compare/', label: t('comparison.navLabel') },
    { to: '/gyoji/', label: t('global.nav.gyoji') },
    { to: '/yobidashi/', label: t('global.nav.yobidashi') },
  ];
  const currentDirectoryLink = directoryLinks.find((link) => isActive(location.pathname, link.to)) ?? directoryLinks[0];

  useEffect(() => {
    setDirectoryOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!directoryOpen) return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !directoryTrayRef.current?.contains(event.target)) {
        setDirectoryOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [directoryOpen]);

  const handleDirectoryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !directoryOpen) return;
    event.preventDefault();
    setDirectoryOpen(false);
    directoryTriggerRef.current?.focus();
  };

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
        <div
          ref={directoryTrayRef}
          className="directory-navigation-tray"
          onKeyDown={handleDirectoryKeyDown}
        >
          <button
            ref={directoryTriggerRef}
            type="button"
            className="directory-navigation-trigger"
            aria-expanded={directoryOpen}
            aria-controls={directoryPanelId}
            onClick={() => setDirectoryOpen((open) => !open)}
          >
            <span className="directory-navigation-trigger__section">{t('global.directoryNavigation')}</span>
            <span className="directory-navigation-trigger__separator" aria-hidden="true" />
            <span className="directory-navigation-trigger__current">{currentDirectoryLink.label}</span>
            <svg
              className={`directory-navigation-trigger__icon${directoryOpen ? ' is-open' : ''}`}
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 6.25 8 10l4-3.75" />
            </svg>
          </button>
          <nav
            id={directoryPanelId}
            className="directory-navigation"
            aria-label={t('global.directoryNavigation')}
            hidden={!directoryOpen}
          >
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
        </div>
      ) : null}
    </div>
  );
}
