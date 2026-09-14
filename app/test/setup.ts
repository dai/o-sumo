import '@testing-library/jest-dom/vitest';
import { i18n } from '../lib/i18n';
// Force Japanese in tests so assertions on hardcoded Japanese text pass
i18n.changeLanguage('ja');

// Provide a minimal HTMLRewriter global for jsdom so middleware tests that
// exercise the rewrite path don't crash when Cloudflare's runtime is absent.
// The stub is intentionally a passthrough; tests that need to inspect the
// configured handlers use a richer stub installed at the test site via
// `installHtmlRewriterSpy` from `app/test/html-rewriter-spy.ts`.
if (typeof (globalThis as { HTMLRewriter?: unknown }).HTMLRewriter !== 'function') {
  class PassthroughRewriter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(_selector: string, _handlers: any): this {
      return this;
    }
    transform(response: Response): Response {
      return response;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).HTMLRewriter = class HTMLRewriter {
    on(): PassthroughRewriter {
      return new PassthroughRewriter();
    }
    transform(response: Response): Response {
      return response;
    }
  };
}

if (typeof window.localStorage?.clear !== 'function') {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      get length() {
        return store.size;
      },
    },
  });
}
