import { useTranslation } from 'react-i18next';
import { useAuthSession } from '../lib/auth-session';
import { useMyRikishi } from '../lib/my-rikishi';
import './auth-controls.css';

export default function AuthControls() {
  const { t } = useTranslation('common');
  const { status, user, logout } = useAuthSession();
  const { syncing, syncError } = useMyRikishi();

  if (status === 'loading') {
    return <p className="auth-controls__status" role="status">{t('myRikishi.auth.checking')}</p>;
  }

  if (status !== 'authenticated' || !user) {
    return (
      <div className="auth-controls">
        <a className="auth-controls__action" href="/api/auth/google?returnTo=/my-rikishi/">
          {t('myRikishi.auth.signIn')}
        </a>
        <span className="auth-controls__status">{t('myRikishi.auth.localOnly')}</span>
      </div>
    );
  }

  return (
    <div className="auth-controls">
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
