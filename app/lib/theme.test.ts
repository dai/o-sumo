import { describe, expect, it } from 'vitest'
import {
  THEME_STORAGE_KEY,
  bootstrapTheme,
  resolveInitialTheme,
} from './theme'

function createStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial))

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.has(key) ? values.get(key)! : null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}

describe('theme helpers', () => {
  it('prioritizes stored theme over system preference', () => {
    expect(resolveInitialTheme('light', true)).toBe('light')
    expect(resolveInitialTheme('dark', false)).toBe('dark')
  })

  it('uses system preference when storage is empty', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
  })

  it('falls back to light when storage is invalid and system is not dark', () => {
    expect(resolveInitialTheme('unknown', false)).toBe('light')
  })

  it('bootstraps theme onto document root using configured priority', () => {
    const testDocument = document.implementation.createHTMLDocument('theme-test')
    const storage = createStorage({ [THEME_STORAGE_KEY]: 'light' })
    const testWindow = {
      localStorage: storage,
      matchMedia: () => ({ matches: true } as MediaQueryList),
    }

    const theme = bootstrapTheme(testDocument, testWindow)

    expect(theme).toBe('light')
    expect(testDocument.documentElement.dataset.theme).toBe('light')
  })
})
