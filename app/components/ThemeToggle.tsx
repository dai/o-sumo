import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('common')

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

  const ariaLabel = isDark ? t('themeToggle.ariaLabelDark') : t('themeToggle.ariaLabelLight')

  return (
    <button
      type="button"
      className={`theme-toggle${isDark ? ' is-dark' : ''}`}
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label={ariaLabel}
      title={`Theme: ${isDark ? 'DARK' : 'LIGHT'}`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? 'DARK' : 'LIGHT'}</span>
    </button>
  )
}
