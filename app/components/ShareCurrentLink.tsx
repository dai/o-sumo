import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ShareCurrentLink() {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [status, setStatus] = React.useState<'idle' | 'copied' | 'fallback'>('idle');
  const shareUrl = typeof window === 'undefined'
    ? `${location.pathname}${location.search}`
    : `${window.location.origin}${location.pathname}${location.search}`;

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
    } catch {
      setStatus('fallback');
    }
  };

  React.useEffect(() => {
    setStatus('idle');
  }, [location.pathname, location.search]);

  return (
    <div className="share-current-link">
      <button type="button" className="share-current-link__button" onClick={copy}>
        {status === 'copied' ? t('sharing.copied') : t('sharing.copyLink')}
      </button>
      {status === 'fallback' ? (
        <label className="share-current-link__fallback">
          <span>{t('sharing.copyManually')}</span>
          <input type="text" value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        </label>
      ) : null}
    </div>
  );
}
