import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AI_SEARCH_API_URL } from '../lib/ai-search'
import { readThemeFromDataset, type Theme } from '../lib/theme'
import type { SearchModalSnippet } from '@cloudflare/ai-search-snippet/search'
import './site-search.css'



export default function SiteSearch() {
  const { t } = useTranslation('common')
  const modalRef = useRef<SearchModalSnippet>(null)
  const [theme, setTheme] = useState<Theme>(() => readThemeFromDataset() ?? 'light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('@cloudflare/ai-search-snippet/search').then(() => {
      if (!cancelled) setReady(true)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readThemeFromDataset() ?? 'light'))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const translations = useMemo(() => ({
    placeholder: t('global.siteSearch.placeholder'),
    searchResultsAriaLabel: t('global.siteSearch.resultsAriaLabel'),
    modalEmptyStateDescription: t('global.siteSearch.emptyDescription'),
    modalNoResultsTitle: t('global.siteSearch.noResultsTitle'),
    modalNoResultsDescription: t('global.siteSearch.noResultsDescription'),
    modalResultsCount: t('global.siteSearch.resultsCount'),
    modalResultsCountPlural: t('global.siteSearch.resultsCountPlural'),
    modalResultsCountZero: t('global.siteSearch.resultsCountZero'),
    navigateHint: t('global.siteSearch.navigateHint'),
    selectHint: t('global.siteSearch.selectHint'),
    closeHint: t('global.siteSearch.closeHint'),
    loadingAriaLabel: t('global.siteSearch.loading'),
    errorPrefix: t('global.siteSearch.errorPrefix'),
  }), [t])

  // React 19 would stringify an object prop; assign the setter directly.
  useEffect(() => {
    if (ready && modalRef.current) modalRef.current.translations = translations
  }, [ready, translations])

  return (
    <>
      <button
        type="button"
        className="site-search-button"
        aria-label={t('global.siteSearch.open')}
        aria-haspopup="dialog"
        disabled={!ready}
        onClick={() => modalRef.current?.open()}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="10" cy="10" r="6.5" />
          <path d="M15 15l6 6" />
        </svg>
        <span className="site-search-button__label">{t('global.siteSearch.buttonLabel')}</span>
      </button>
      {ready ? (
        <search-modal-snippet
          ref={modalRef}
          api-url={AI_SEARCH_API_URL}
          theme={theme}
          max-results={8}
          hide-thumbnails="true"
        />
      ) : null}
    </>
  )
}
