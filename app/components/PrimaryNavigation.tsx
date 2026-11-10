import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  findArchiveDay,
  getArchiveRouteConfigForPathname,
  parseTopLevelSlug,
  type ArchiveRouteConfig,
} from '../lib/torikumi-routes';
import { useMyRikishi } from '../lib/my-rikishi';
import AuthControls from './AuthControls';
import RikishiSearchDialog from './RikishiSearchDialog';

type PrimaryNavigationProps = {
  placement?: 'header' | 'footer';
};

type NavItemId = 'banzuke' | 'torikumi' | 'rikishi' | 'kimarite' | 'analytics' | 'archives';

type NavigationLink = {
  id: NavItemId;
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

function isTorikumiCurrent(pathname: string, archive: ArchiveRouteConfig): boolean {
  const normalized = normalizePath(pathname);
  if (normalized === normalizePath(archive.resultPath) || normalized === normalizePath(archive.schedulePath)) {
    return true;
  }
  const parsed = parseTopLevelSlug(pathname.slice(1));
  if (!parsed || parsed.dateKey.length !== 8 || !parsed.dateKey.startsWith(archive.monthKey)) {
    return false;
  }
  return Boolean(findArchiveDay(parsed.dateKey, parsed.mode));
}

function isItemActive(id: NavItemId, pathname: string, archive: ArchiveRouteConfig): boolean {
  switch (id) {
    case 'banzuke':
      return isActive(pathname, archive.banzukePath);
    case 'torikumi':
      return isTorikumiCurrent(pathname, archive);
    case 'rikishi':
      return isDirectoryRoute(pathname);
    case 'kimarite':
      return isActive(pathname, '/kimarite/');
    case 'analytics':
      return isActive(pathname, '/analytics/');
    case 'archives':
      return isActive(pathname, '/archives/');
    default: {
      const exhaustive: never = id;
      return exhaustive;
    }
  }
}

export default function PrimaryNavigation({ placement = 'header' }: PrimaryNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { ids: myRikishiIds } = useMyRikishi();
  const archive = getArchiveRouteConfigForPathname(location.pathname);
  const directoryActive = isDirectoryRoute(location.pathname);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const directoryTrayRef = useRef<HTMLDivElement>(null);
  const directoryTriggerRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const directoryPanelId = 'people-directory-navigation';
  const searchDialogId = useId();
  const myRikishiCountLabel = myRikishiIds.length > 0 ? ` (${myRikishiIds.length})` : '';
  const links: NavigationLink[] = [
    { id: 'banzuke', to: archive.banzukePath, label: t('global.nav.banzuke') },
    { id: 'torikumi', to: archive.resultPath, label: t('global.nav.torikumi') },
    { id: 'rikishi', to: '/rikishi/', label: t('global.nav.rikishi') },
    { id: 'kimarite', to: '/kimarite/', label: t('global.nav.kimarite') },
    { id: 'analytics', to: '/analytics/', label: t('global.nav.analytics') },
    { id: 'archives', to: '/archives/', label: t('global.nav.archives') },
  ];
  const directoryLinks: Array<{ to: string; label: string }> = [
    { to: '/rikishi/', label: t('global.nav.rikishi') },
    { to: '/my-rikishi/', label: `${t('myRikishi.navLabel')}${myRikishiCountLabel}` },
    { to: '/compare/', label: t('comparison.navLabel') },
    { to: '/gyoji/', label: t('global.nav.gyoji') },
    { to: '/yobidashi/', label: t('global.nav.yobidashi') },
  ];
  const currentDirectoryLink = directoryLinks.find((link) => isActive(location.pathname, link.to)) ?? directoryLinks[0];

  useEffect(() => {
    setDirectoryOpen(false);
    setSearchOpen(false);
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

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  return (
    <div className={`primary-navigation-shell primary-navigation-shell--${placement}`}>
      <div className="primary-navigation-bar">
        <nav className={`primary-navigation primary-navigation--${placement}`} aria-label={t('global.primaryNavigation')}>
          {links.map((link) => {
            const active = isItemActive(link.id, location.pathname, archive);
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
        <button
          ref={searchButtonRef}
          type="button"
          className={`primary-navigation__search${searchOpen ? ' is-active' : ''}`}
          aria-expanded={searchOpen}
          aria-controls={searchDialogId}
          aria-label={t('global.search.open')}
          onClick={() => setSearchOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16.5 20 20.5" />
          </svg>
        </button>
      </div>
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
      <AuthControls variant="compact" />
      {searchOpen ? <RikishiSearchDialog dialogId={searchDialogId} onClose={closeSearch} /> : null}
    </div>
  );
}
