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
 * Viewport-following "最新に更新" button for torikumi day pages. Drives an async refresh
 * provided by the parent (which captures scroll, fetches /api/v1/torikumi.json
 * with cache: 'no-store', and dispatches the torikumi-updated event). The
 * button itself owns the status state machine, ARIA wiring, and the
 * timed reset for the no-op / failure transient states.
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

  // iOS Safari 15+ はタップで :focus-visible を発火するため、リフレッシュ
  // 完了後に focus を外して outline リング (focus-visible の唯一の視覚
  // 表現) も自動で消す。useEffect で status 遷移後に blur() することで、
  // loading 中の disabled 状態で blur が効かない問題を回避する
  // (handleClick 末尾に inline で書くと status='loading' の間 button が
  // disabled になり、jsdom / 実機 Safari の両方で blur() が no-op になる)。
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
        // Parent updated live data; re-render returns to idle.
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
