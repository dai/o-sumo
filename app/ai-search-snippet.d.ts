import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { SearchModalSnippet } from '@cloudflare/ai-search-snippet/search'

type SearchModalSnippetAttributes = DetailedHTMLProps<HTMLAttributes<SearchModalSnippet>, SearchModalSnippet> & {
  'api-url'?: string
  placeholder?: string
  theme?: 'light' | 'dark' | 'auto'
  shortcut?: string
  'use-meta-key'?: string
  'max-results'?: number
  'hide-branding'?: boolean | string
  'show-url'?: boolean | string
  'hide-thumbnails'?: boolean | string
  'disable-analytics'?: boolean | string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'search-modal-snippet': SearchModalSnippetAttributes
    }
  }
}
