import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CopyApiJsonLink({ path }: { path: string }) {
  const { t } = useTranslation('common');
  const [status, setStatus] = React.useState<'idle' | 'copied' | 'fallback'>('idle');
  const absoluteUrl = typeof window === 'undefined' ? path : new URL(path, window.location.origin).href;

  const copy = async () => {
    if (!navigator.clipboard?.writeText) {
      setStatus('fallback');
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setStatus('copied');
    } catch {
      setStatus('fallback');
    }
  };

  React.useEffect(() => {
    setStatus('idle');
  }, [path]);

  return (
    <>
      <button type="button" className="rikishi-copy-button" onClick={copy}>
        {status === 'copied' ? t('sharing.copyApiLinkDone') : t('sharing.copyApiLink')}
      </button>
      {status === 'fallback' ? (
        <label className="share-current-link__fallback">
          <span>{t('sharing.copyManually')}</span>
          <input type="text" value={absoluteUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        </label>
      ) : null}
    </>
  );
}
