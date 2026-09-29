import React from 'react';
import { useAuthSession } from './auth-session';
import {
  MY_RIKISHI_MAX_COUNT,
  mergeMyRikishiIds,
  normalizeMyRikishiIds,
  parseMyRikishiIds,
  remoteMyRikishiStore,
} from './my-rikishi-store';

export { MY_RIKISHI_MAX_COUNT, normalizeMyRikishiIds, parseMyRikishiIds } from './my-rikishi-store';

export const MY_RIKISHI_STORAGE_KEY = 'o-sumo:my-rikishi:v1';
const MY_RIKISHI_EVENT = 'o-sumo:my-rikishi-change';

export type MyRikishiChange = {
  ids: number[];
  action: 'added' | 'removed' | 'limit' | 'invalid';
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadMyRikishiIds(): number[] {
  const storage = getStorage();
  return storage ? parseMyRikishiIds(storage.getItem(MY_RIKISHI_STORAGE_KEY)) : [];
}

export function saveMyRikishiIds(ids: number[]): number[] {
  const normalized = normalizeMyRikishiIds(ids);
  const storage = getStorage();

  try {
    storage?.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent<number[]>(MY_RIKISHI_EVENT, { detail: normalized }));
  } catch {
    // Saving favorites is progressive enhancement. The active component still
    // retains its current state when storage is unavailable.
  }

  return normalized;
}

export function changeMyRikishi(ids: number[], id: number): MyRikishiChange {
  const normalized = normalizeMyRikishiIds(ids);
  if (!Number.isInteger(id) || id <= 0) return { ids: normalized, action: 'invalid' };

  if (normalized.includes(id)) {
    return { ids: normalized.filter((savedId) => savedId !== id), action: 'removed' };
  }

  if (normalized.length >= MY_RIKISHI_MAX_COUNT) {
    return { ids: normalized, action: 'limit' };
  }

  return { ids: [...normalized, id], action: 'added' };
}

type MyRikishiValue = {
  ids: number[];
  has: (id: number) => boolean;
  isSaved: (id: number) => boolean;
  toggle: (id: number) => MyRikishiChange;
  clear: () => void;
  maxCount: number;
  authenticated: boolean;
  syncing: boolean;
  syncError: boolean;
};

const MyRikishiContext = React.createContext<MyRikishiValue | null>(null);

function useLocalMyRikishi(enabled: boolean): MyRikishiValue {
  const [ids, setIds] = React.useState<number[]>(() => loadMyRikishiIds());

  React.useEffect(() => {
    if (!enabled) return undefined;
    const onCustomChange = (event: Event) => {
      const customEvent = event as CustomEvent<number[]>;
      setIds(normalizeMyRikishiIds(customEvent.detail));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === MY_RIKISHI_STORAGE_KEY) {
        setIds(parseMyRikishiIds(event.newValue));
      }
    };

    window.addEventListener(MY_RIKISHI_EVENT, onCustomChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MY_RIKISHI_EVENT, onCustomChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [enabled]);

  const toggle = React.useCallback((id: number): MyRikishiChange => {
    const change = changeMyRikishi(ids, id);
    if (change.action !== 'limit' && change.action !== 'invalid') {
      const saved = saveMyRikishiIds(change.ids);
      setIds(saved);
      return { ...change, ids: saved };
    }
    return change;
  }, [ids]);

  const clear = React.useCallback(() => {
    const saved = saveMyRikishiIds([]);
    setIds(saved);
  }, []);

  return {
    ids,
    has: (id: number) => ids.includes(id),
    isSaved: (id: number) => ids.includes(id),
    toggle,
    clear,
    maxCount: MY_RIKISHI_MAX_COUNT,
    authenticated: false,
    syncing: false,
    syncError: false,
  };
}

export function MyRikishiProvider({ children }: React.PropsWithChildren) {
  const { status, user } = useAuthSession();
  const [ids, setIds] = React.useState<number[]>(() => loadMyRikishiIds());
  const [syncing, setSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState(false);
  const idsRef = React.useRef(ids);
  const synchronizedUserRef = React.useRef<string | null>(null);
  const syncQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  const syncOperationRef = React.useRef(0);
  const remoteStore = React.useMemo(() => remoteMyRikishiStore(), []);

  const save = React.useCallback((nextIds: number[]) => {
    const saved = saveMyRikishiIds(nextIds);
    idsRef.current = saved;
    setIds(saved);
    return saved;
  }, []);

  const queueRemoteReplace = React.useCallback((nextIds: number[]) => {
    const operation = ++syncOperationRef.current;
    setSyncing(true);
    syncQueueRef.current = syncQueueRef.current
      .then(async () => {
        await remoteStore.replace(nextIds);
        setSyncError(false);
      })
      .catch(() => {
        setSyncError(true);
      })
      .finally(() => {
        if (operation === syncOperationRef.current) setSyncing(false);
      });
  }, [remoteStore]);

  React.useEffect(() => {
    const onCustomChange = (event: Event) => {
      const customEvent = event as CustomEvent<number[]>;
      const nextIds = normalizeMyRikishiIds(customEvent.detail);
      idsRef.current = nextIds;
      setIds(nextIds);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== MY_RIKISHI_STORAGE_KEY) return;
      const nextIds = parseMyRikishiIds(event.newValue);
      idsRef.current = nextIds;
      setIds(nextIds);
    };
    window.addEventListener(MY_RIKISHI_EVENT, onCustomChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MY_RIKISHI_EVENT, onCustomChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  React.useEffect(() => {
    if (status !== 'authenticated' || !user || synchronizedUserRef.current === user.id) return;
    synchronizedUserRef.current = user.id;
    const operation = ++syncOperationRef.current;
    setSyncing(true);
    syncQueueRef.current = syncQueueRef.current
      .then(async () => {
        const remoteIds = await remoteStore.load();
        const merged = mergeMyRikishiIds(idsRef.current, remoteIds);
        save(merged.ids);
        await remoteStore.replace(merged.ids);
        setSyncError(false);
      })
      .catch(() => {
        setSyncError(true);
      })
      .finally(() => {
        if (operation === syncOperationRef.current) setSyncing(false);
      });
  }, [remoteStore, save, status, user]);

  React.useEffect(() => {
    if (status === 'anonymous') synchronizedUserRef.current = null;
  }, [status]);

  const toggle = React.useCallback((id: number): MyRikishiChange => {
    const change = changeMyRikishi(idsRef.current, id);
    if (change.action === 'limit' || change.action === 'invalid') return change;
    const saved = save(change.ids);
    if (status === 'authenticated') queueRemoteReplace(saved);
    return { ...change, ids: saved };
  }, [queueRemoteReplace, save, status]);

  const clear = React.useCallback(() => {
    const saved = save([]);
    if (status === 'authenticated') queueRemoteReplace(saved);
  }, [queueRemoteReplace, save, status]);

  const value = React.useMemo<MyRikishiValue>(() => ({
    ids,
    has: (id: number) => ids.includes(id),
    isSaved: (id: number) => ids.includes(id),
    toggle,
    clear,
    maxCount: MY_RIKISHI_MAX_COUNT,
    authenticated: status === 'authenticated',
    syncing,
    syncError,
  }), [clear, ids, status, syncError, syncing, toggle]);

  return React.createElement(MyRikishiContext.Provider, { value }, children);
}

export function useMyRikishi(): MyRikishiValue {
  const context = React.useContext(MyRikishiContext);
  const fallback = useLocalMyRikishi(context === null);
  return context ?? fallback;
}
