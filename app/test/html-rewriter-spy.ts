/**
 * Test helper that installs an HTMLRewriter stub which records every
 * `on(selector, handlers)` call so middleware tests can assert exactly
 * what the SEO rewriter is configuring. The stub's `transform` is a
 * passthrough — we don't need to verify the byte-level output here, only
 * the wiring.
 */
export interface SpyHandlers {
  element?: (...args: unknown[]) => unknown;
  comments?: (...args: unknown[]) => unknown;
  text?: (...args: unknown[]) => unknown;
}

export interface SpyRegistration {
  selector: string;
  handlers: SpyHandlers;
}

export interface SpyRewriter {
  readonly registrations: SpyRegistration[];
  on(selector: string, handlers: SpyHandlers): SpyRewriter;
  transform(response: Response): Response;
}

export function installHtmlRewriterSpy(): { rewriters: SpyRewriter[]; restore: () => void } {
  const rewriters: SpyRewriter[] = [];
  const previous = (globalThis as { HTMLRewriter?: unknown }).HTMLRewriter;

  class SpyRewriter {
    readonly registrations: SpyRegistration[] = [];
    on(selector: string, handlers: SpyHandlers): SpyRewriter {
      this.registrations.push({ selector, handlers });
      return this;
    }
    transform(response: Response): Response {
      return response;
    }
    constructor() {
      rewriters.push(this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).HTMLRewriter = SpyRewriter;

  return {
    rewriters,
    restore: () => {
      if (previous) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).HTMLRewriter = previous;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).HTMLRewriter;
      }
    },
  };
}
