import '@testing-library/jest-dom/vitest';
import { i18n } from '../lib/i18n';
// Force Japanese in tests so assertions on hardcoded Japanese text pass
i18n.changeLanguage('ja');

if (typeof window.localStorage.clear !== 'function') {
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
