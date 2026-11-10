import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '../lib/auth-session';
import { useMyRikishi } from '../lib/my-rikishi';
import './auth-controls.css';

type AuthControlsProps = {
  returnTo?: string;
  variant?: 'default' | 'compact';
};

export default function AuthControls({ returnTo, variant = 'default' }: AuthControlsProps = {}) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { status, user, logout } = useAuthSession();
  const { syncing, syncError } = useMyRikishi();
  const compact = variant === 'compact';

  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const effectiveReturnTo = returnTo ?? (currentPath || '/');
  const signInHref = `/api/auth/google?returnTo=${encodeURIComponent(effectiveReturnTo)}`;

  if (status === 'loading') {
    return <p className="auth-controls__status" role="status">{t('myRikishi.auth.checking')}</p>;
  }

  if (status !== 'authenticated' || !user) {
    return (
      <div className={`auth-controls${compact ? ' auth-controls--compact' : ''}`}>
        <a className="auth-controls__action" href={signInHref}>
          {t('myRikishi.auth.signIn')}
        </a>
        {compact ? null : <span className="auth-controls__status">{t('myRikishi.auth.localOnly')}</span>}
        {compact ? null : <p className="auth-controls__hint">{t('myRikishi.auth.passwordHint')}</p>}
      </div>
    );
  }

  return (
    <div className={`auth-controls${compact ? ' auth-controls--compact' : ''}`}>
      <span className="auth-controls__account">{user.displayName}</span>
      <button className="auth-controls__action" type="button" onClick={() => void logout()}>
        {t('myRikishi.auth.signOut')}
      </button>
      {syncing ? <span className="auth-controls__status" role="status">{t('myRikishi.auth.syncing')}</span> : null}
      {syncError ? (
        <span className="auth-controls__status auth-controls__status--warning" role="status">
          {t('myRikishi.auth.syncFailed')} {t('myRikishi.auth.localRetained')}
        </span>
      ) : null}
    </div>
  );
}
