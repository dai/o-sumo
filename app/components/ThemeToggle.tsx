import { useEffect, useState } from 'react'
import {
  applyTheme,
  persistTheme,
  readThemeFromDataset,
  type Theme,
} from '../lib/theme'
import './theme-toggle.css'

function nextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readThemeFromDataset() ?? 'light')

  useEffect(() => {
    const currentTheme = readThemeFromDataset()
    if (currentTheme) {
      setTheme(currentTheme)
    }
  }, [])

  const isDark = theme === 'dark'

  const handleToggle = () => {
    const updatedTheme = nextTheme(theme)
    applyTheme(updatedTheme)
    persistTheme(updatedTheme)
    setTheme(updatedTheme)
  }

  return (
    <button
      type="button"
      className={`theme-toggle${isDark ? ' is-dark' : ''}`}
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label={`現在のテーマは${isDark ? 'ダーク' : 'ライト'}。クリックで${isDark ? 'ライト' : 'ダーク'}に切り替え`}
      title={`Theme: ${isDark ? 'DARK' : 'LIGHT'}`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? 'DARK' : 'LIGHT'}</span>
    </button>
  )
}
