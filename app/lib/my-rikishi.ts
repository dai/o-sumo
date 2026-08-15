import React from 'react';

export const MY_RIKISHI_STORAGE_KEY = 'o-sumo:my-rikishi:v1';
export const MY_RIKISHI_MAX_COUNT = 20;
const MY_RIKISHI_EVENT = 'o-sumo:my-rikishi-change';

export type MyRikishiChange = {
  ids: number[];
  action: 'added' | 'removed' | 'limit' | 'invalid';
};

export function normalizeMyRikishiIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(value)]
    .filter((id): id is number => Number.isInteger(id) && id > 0)
    .slice(0, MY_RIKISHI_MAX_COUNT);
}

export function parseMyRikishiIds(serialized: string | null): number[] {
  if (!serialized) return [];

  try {
    return normalizeMyRikishiIds(JSON.parse(serialized));
  } catch {
    return [];
  }
}

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

export function useMyRikishi() {
  const [ids, setIds] = React.useState<number[]>(() => loadMyRikishiIds());

  React.useEffect(() => {
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
  }, []);

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
    toggle,
    clear,
    maxCount: MY_RIKISHI_MAX_COUNT,
  };
}
