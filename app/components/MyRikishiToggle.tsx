import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMyRikishi } from '../lib/my-rikishi';

type MyRikishiToggleProps = {
  rikishiId: number;
  className?: string;
};

export default function MyRikishiToggle({ rikishiId, className = '' }: MyRikishiToggleProps) {
  const { t } = useTranslation('common');
  const { has, maxCount, toggle } = useMyRikishi();
  const saved = has(rikishiId);
  const [status, setStatus] = React.useState<'idle' | 'limit'>('idle');

  const onToggle = () => {
    const change = toggle(rikishiId);
    setStatus(change.action === 'limit' ? 'limit' : 'idle');
  };

  return (
    <div className={`my-rikishi-toggle ${className}`.trim()}>
      <button
        type="button"
        className={`my-rikishi-toggle__button${saved ? ' is-saved' : ''}`}
        aria-pressed={saved}
        onClick={onToggle}
      >
        {saved ? t('myRikishi.remove') : t('myRikishi.add')}
      </button>
      {status === 'limit' ? <span className="my-rikishi-toggle__status" role="status">{t('myRikishi.limitReached', { count: maxCount })}</span> : null}
    </div>
  );
}
