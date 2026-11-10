import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  arePastArchivesReady,
  getLoadedArchiveDocument,
  loadArchiveDocument,
  loadPastArchiveDocuments,
  subscribeArchiveCache,
} from './archive-client';
import type { ArchiveDocument } from './archive-types';

export interface ArchiveDocumentState {
  document: ArchiveDocument | undefined;
  error: Error | undefined;
  loading: boolean;
  reload: () => void;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

export function useArchiveDocument(monthKey: string): ArchiveDocumentState {
  const loaded = useSyncExternalStore(
    subscribeArchiveCache,
    () => getLoadedArchiveDocument(monthKey) ?? null,
    () => getLoadedArchiveDocument(monthKey) ?? null,
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!/^\d{6}$/.test(monthKey) || getLoadedArchiveDocument(monthKey)) {
      return undefined;
    }
    let cancelled = false;
    setError(undefined);
    loadArchiveDocument(monthKey).catch((reason: unknown) => {
      if (!cancelled) setError(toError(reason));
    });
    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  const reload = useCallback(() => {
    if (!/^\d{6}$/.test(monthKey)) return;
    setError(undefined);
    loadArchiveDocument(monthKey, { force: true }).catch((reason: unknown) => {
      setError(toError(reason));
    });
  }, [monthKey]);

  const document = loaded ?? undefined;
  return {
    document,
    error,
    loading: Boolean(monthKey) && !document && !error,
    reload,
  };
}

export function usePastArchivesReady(): boolean {
  const ready = useSyncExternalStore(subscribeArchiveCache, arePastArchivesReady, arePastArchivesReady);
  useEffect(() => {
    if (arePastArchivesReady()) return undefined;
    void loadPastArchiveDocuments().catch(() => {
      // Basho pages surface the failure. Profile widgets stay blank until the payload arrives.
    });
    return undefined;
  }, []);
  return ready;
}

export function ArchivePending({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}): ReactNode {
  const { t } = useTranslation('common');
  if (error) {
    return (
      <div className="route-loading" role="alert">
        <p>{t('global.archiveLoadError')}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry}>{t('global.retry')}</button>
        ) : null}
      </div>
    );
  }
  return <div className="route-loading" role="status">{t('global.pageLoading')}</div>;
}
