import React from 'react';
import { scrollToAnchorWithRetry } from './scroll-to-hash';

export const SCROLL_RESTORE_EVENT = 'o-sumo:torikumi-updated';
export const SCROLL_STORAGE_PREFIX = 'o-sumo:torikumi-scroll:';
export const SCROLL_SUPPRESS_WINDOW_MS = 1000;

export interface ScrollPosition {
  scrollY: number;
  anchorId?: string;
  capturedAt: number;
}

declare global {
  interface Window {
    __osumoScrollSuppressUntil?: number;
  }
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Synchronously captures the current window.scrollY (and optional anchorId)
 * into sessionStorage under the torikumi-scroll:{pathname} key. Called from
 * the manual refresh handler before fetching the latest dataset.
 */
export function captureScrollPosition(
  pathname: string,
  options?: { anchorId?: string },
): void {
  const storage = getSessionStorage();
  if (!storage) return;
  const payload: ScrollPosition = {
    scrollY: window.scrollY,
    capturedAt: Date.now(),
  };
  if (options?.anchorId !== undefined) {
    payload.anchorId = options.anchorId;
  }
  try {
    storage.setItem(`${SCROLL_STORAGE_PREFIX}${pathname}`, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable or full; capture is best-effort.
  }
}

/**
 * Restores the captured scroll position. Prefers the stored anchorId
 * (when the element exists in the DOM) to leverage ScrollToHash's
 * rAF retry. Falls back to absolute scrollY via window.scrollTo.
 * Returns true when a stored position was found and applied.
 */
export function restoreScrollPosition(pathname: string): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;
  const raw = storage.getItem(`${SCROLL_STORAGE_PREFIX}${pathname}`);
  if (!raw) return false;

  let parsed: ScrollPosition;
  try {
    parsed = JSON.parse(raw) as ScrollPosition;
  } catch {
    return false;
  }
  if (!parsed || typeof parsed.scrollY !== 'number') return false;

  if (parsed.anchorId && document.getElementById(parsed.anchorId)) {
    scrollToAnchorWithRetry(parsed.anchorId);
  } else {
    window.scrollTo(0, parsed.scrollY);
  }
  return true;
}

/**
 * Clears any captured scroll position for the given pathname. Called
 * after the suppress window elapses or on day navigation.
 */
export function clearScrollPosition(pathname: string): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(`${SCROLL_STORAGE_PREFIX}${pathname}`);
  } catch {
    // ignore
  }
}

/**
 * Subscribes to SCROLL_RESTORE_EVENT and, on dispatch:
 *  - sets window.__osumoScrollSuppressUntil to defend against ScrollToHash
 *    resetting scroll to top during the next render,
 *  - restores the previously captured scroll position from sessionStorage,
 *  - schedules cleanup of the captured entry after the suppress window.
 */
export function useScrollRestore(pathname: string): void {
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onUpdate = (): void => {
      window.__osumoScrollSuppressUntil = Date.now() + SCROLL_SUPPRESS_WINDOW_MS;
      restoreScrollPosition(pathname);
      window.setTimeout(() => {
        clearScrollPosition(pathname);
      }, SCROLL_SUPPRESS_WINDOW_MS);
    };

    window.addEventListener(SCROLL_RESTORE_EVENT, onUpdate);
    return () => {
      window.removeEventListener(SCROLL_RESTORE_EVENT, onUpdate);
    };
  }, [pathname]);
}
