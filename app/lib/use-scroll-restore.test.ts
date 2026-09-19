import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  captureScrollPosition,
  clearScrollPosition,
  restoreScrollPosition,
  SCROLL_RESTORE_EVENT,
  SCROLL_STORAGE_PREFIX,
  SCROLL_SUPPRESS_WINDOW_MS,
  useScrollRestore,
} from './use-scroll-restore';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.body.innerHTML = '';
  delete window.__osumoScrollSuppressUntil;
});

describe('captureScrollPosition', () => {
  it('writes a JSON payload with the current scrollY to sessionStorage', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1234, writable: true });

    captureScrollPosition('/202609-torikumi/');

    const raw = sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}/202609-torikumi/`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { scrollY: number; capturedAt: number; anchorId?: string };
    expect(parsed.scrollY).toBe(1234);
    expect(typeof parsed.capturedAt).toBe('number');
    expect(parsed.anchorId).toBeUndefined();
  });

  it('includes anchorId when provided', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500, writable: true });

    captureScrollPosition('/202609-torikumi/', { anchorId: 'bout-makuuchi-15' });

    const raw = sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}/202609-torikumi/`);
    const parsed = JSON.parse(raw!) as { scrollY: number; anchorId?: string };
    expect(parsed.scrollY).toBe(500);
    expect(parsed.anchorId).toBe('bout-makuuchi-15');
  });
});

describe('restoreScrollPosition', () => {
  it('returns false when no position is stored', () => {
    expect(restoreScrollPosition('/missing/')).toBe(false);
  });

  it('returns false on corrupt JSON', () => {
    sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}/x/`, 'not-json{');
    expect(restoreScrollPosition('/x/')).toBe(false);
  });

  it('calls scrollTo with the stored scrollY when no anchorId is present', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/x/`,
      JSON.stringify({ scrollY: 777, capturedAt: Date.now() }),
    );

    expect(restoreScrollPosition('/x/')).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith(0, 777);
  });

  it('falls back to scrollTo when anchorId is stored but the element is missing', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/x/`,
      JSON.stringify({ scrollY: 333, anchorId: 'never-exists', capturedAt: Date.now() }),
    );

    expect(restoreScrollPosition('/x/')).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith(0, 333);
  });

  it('uses scrollToAnchorWithRetry when the stored anchorId exists in the DOM', () => {
    const scrollIntoView = vi.fn();
    (HTMLElement.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView = scrollIntoView;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    const target = document.createElement('div');
    target.id = 'bout-makuuchi-15';
    document.body.appendChild(target);

    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/x/`,
      JSON.stringify({ scrollY: 999, anchorId: 'bout-makuuchi-15', capturedAt: Date.now() }),
    );

    expect(restoreScrollPosition('/x/')).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });
});

describe('clearScrollPosition', () => {
  it('removes the stored entry from sessionStorage', () => {
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/x/`,
      JSON.stringify({ scrollY: 1, capturedAt: Date.now() }),
    );

    clearScrollPosition('/x/');

    expect(sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}/x/`)).toBeNull();
  });
});

describe('useScrollRestore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when no position is stored', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    renderHook(() => useScrollRestore('/202609-torikumi/'));
    window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.__osumoScrollSuppressUntil).toBeGreaterThan(Date.now());
  });

  it('restores the scroll position and sets the suppress flag on event', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/202609-torikumi/`,
      JSON.stringify({ scrollY: 555, capturedAt: Date.now() }),
    );

    renderHook(() => useScrollRestore('/202609-torikumi/'));

    expect(window.__osumoScrollSuppressUntil).toBeUndefined();

    window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));

    expect(window.__osumoScrollSuppressUntil).toBeGreaterThan(Date.now());
    expect(scrollTo).toHaveBeenCalledWith(0, 555);
  });

  it('clears the stored position after the suppress window elapses', () => {
    vi.stubGlobal('scrollTo', vi.fn());
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/202609-torikumi/`,
      JSON.stringify({ scrollY: 555, capturedAt: Date.now() }),
    );

    renderHook(() => useScrollRestore('/202609-torikumi/'));
    window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));

    vi.advanceTimersByTime(SCROLL_SUPPRESS_WINDOW_MS + 50);

    expect(sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}/202609-torikumi/`)).toBeNull();
  });

  it('does not respond to events after unmount', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}/202609-torikumi/`,
      JSON.stringify({ scrollY: 555, capturedAt: Date.now() }),
    );

    const { unmount } = renderHook(() => useScrollRestore('/202609-torikumi/'));
    unmount();

    window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.__osumoScrollSuppressUntil).toBeUndefined();
  });
});
