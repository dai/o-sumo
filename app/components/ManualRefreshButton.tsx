import React from 'react';
import { useTranslation } from 'react-i18next';

export type ManualRefreshStatus = 'idle' | 'loading' | 'upToDate' | 'error';

export interface ManualRefreshResult {
  updated: boolean;
}

export interface ManualRefreshButtonProps {
  onRefresh: () => Promise<ManualRefreshResult>;
  className?: string;
  disabled?: boolean;
}

const UPTODATE_RESET_MS = 2000;
const ERROR_RESET_MS = 3000;

/**
 * Viewport-fixed "最新に更新" button for torikumi day pages (schedule + result).
 * Stays visible while the user scrolls the bout list. The parent owns fetch +
 * scroll restore; this button owns the status state machine, ARIA wiring, and
 * timed reset for no-op / failure transient states.
 */
export default function ManualRefreshButton({
  onRefresh,
  className,
  disabled,
}: ManualRefreshButtonProps) {
  const { t } = useTranslation('common');
  const [status, setStatus] = React.useState<ManualRefreshStatus>('idle');
  const mountedRef = React.useRef(true);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // iOS Safari 15+ fires :focus-visible on tap; blur after refresh so the
  // outline ring clears. Do this in an effect after status leaves loading,
  // because blur() is a no-op while the button is disabled.
  const prevStatusRef = React.useRef<ManualRefreshStatus>('idle');
  React.useEffect(() => {
    if (prevStatusRef.current === 'loading' && status !== 'loading') {
      buttonRef.current?.blur();
    }
    prevStatusRef.current = status;
  }, [status]);

  const handleClick = React.useCallback(async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const result = await onRefresh();
      if (!mountedRef.current) return;
      if (result.updated) {
        setStatus('idle');
      } else {
        setStatus('upToDate');
        window.setTimeout(() => {
          if (mountedRef.current) setStatus('idle');
        }, UPTODATE_RESET_MS);
      }
    } catch {
      if (!mountedRef.current) return;
      setStatus('error');
      window.setTimeout(() => {
        if (mountedRef.current) setStatus('idle');
      }, ERROR_RESET_MS);
    }
  }, [onRefresh, status]);

  const isLoading = status === 'loading';
  const label = isLoading
    ? `${t('torikumi.day.manualRefresh')}…`
    : status === 'error'
      ? t('torikumi.day.refreshFailed')
      : status === 'upToDate'
        ? t('torikumi.day.upToDate')
        : t('torikumi.day.manualRefresh');

  const classNames = ['torikumi-refresh-btn'];
  if (className) classNames.push(className);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classNames.join(' ')}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <span aria-hidden="true" className="torikumi-refresh-btn__spinner" />
      <span className="torikumi-refresh-btn__label">{label}</span>
    </button>
  );
}
