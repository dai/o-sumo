import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../lib/i18n'
import { AI_SEARCH_API_URL } from '../lib/ai-search'
import SiteSearch from './SiteSearch'

describe('SiteSearch', () => {
  it('renders the modal snippet pointing at the site-search endpoint', async () => {
    const { container } = render(<I18nextProvider i18n={i18n}><SiteSearch /></I18nextProvider>)
    await waitFor(() => expect(container.querySelector('search-modal-snippet')).not.toBeNull())
    expect(container.querySelector('search-modal-snippet')?.getAttribute('api-url')).toBe(AI_SEARCH_API_URL)
    expect(screen.getByRole('button')).toBeEnabled()
  })
})
