export const THEME_STORAGE_KEY = 'o-sumo-theme'

export type Theme = 'light' | 'dark'

export function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark'
}

export function resolveInitialTheme(storedTheme: string | null, prefersDark: boolean): Theme {
  if (isTheme(storedTheme)) {
    return storedTheme
  }

  return prefersDark ? 'dark' : 'light'
}

export function getStoredTheme(storage?: Storage | null): Theme | null {
  const targetStorage = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  if (!targetStorage) {
    return null
  }

  try {
    const storedTheme = targetStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(storedTheme) ? storedTheme : null
  } catch {
    return null
  }
}

export function getSystemPrefersDark(win?: Pick<Window, 'matchMedia'> | null): boolean {
  const targetWindow = win ?? (typeof window !== 'undefined' ? window : null)

  if (!targetWindow || typeof targetWindow.matchMedia !== 'function') {
    return false
  }

  return targetWindow.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: Theme, root?: HTMLElement | null): void {
  const targetRoot = root ?? (typeof document !== 'undefined' ? document.documentElement : null)

  if (!targetRoot) {
    return
  }

  targetRoot.dataset.theme = theme
}

export function readThemeFromDataset(root?: HTMLElement | null): Theme | null {
  const targetRoot = root ?? (typeof document !== 'undefined' ? document.documentElement : null)

  if (!targetRoot) {
    return null
  }

  const theme = targetRoot.dataset.theme
  return isTheme(theme) ? theme : null
}

export function persistTheme(theme: Theme, storage?: Storage | null): void {
  const targetStorage = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  if (!targetStorage) {
    return
  }

  try {
    targetStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore storage write errors
  }
}

export function bootstrapTheme(doc?: Document | null, win?: Pick<Window, 'localStorage' | 'matchMedia'> | null): Theme {
  const targetDocument = doc ?? (typeof document !== 'undefined' ? document : null)
  const targetWindow = win ?? (typeof window !== 'undefined' ? window : null)

  const storedTheme = getStoredTheme(targetWindow?.localStorage)
  const prefersDark = getSystemPrefersDark(targetWindow)
  const initialTheme = resolveInitialTheme(storedTheme, prefersDark)

  applyTheme(initialTheme, targetDocument?.documentElement ?? null)

  return initialTheme
}
