import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'
import { THEME_STORAGE_KEY } from '../lib/theme'

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })

  it('shows the current theme label from dataset on first render', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: /現在のテーマはライト/i })).toHaveTextContent('LIGHT')
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles theme, updates root dataset, and persists selection', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(button).toHaveTextContent('DARK')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
