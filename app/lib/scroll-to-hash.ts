export const DEFAULT_MAX_ATTEMPTS = 12;

export interface ScrollToAnchorOptions {
  maxAttempts?: number;
  block?: ScrollLogicalPosition;
}

/**
 * Attempt to scroll to the element with the given id, retrying via
 * requestAnimationFrame until it appears in the DOM. Mirrors the
 * retry loop originally inlined in ScrollToHash: useful for hydration
 * scenarios where the target element renders after the hash navigation.
 */
export function scrollToAnchorWithRetry(
  id: string,
  options?: ScrollToAnchorOptions,
): void {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const block = options?.block ?? 'start';

  let attempts = 0;

  const tryScroll = (): void => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ block });
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      requestAnimationFrame(tryScroll);
    }
  };

  requestAnimationFrame(tryScroll);
}
