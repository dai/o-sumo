import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { ChatBubbleSnippet, Theme } from '@cloudflare/ai-search-snippet';

type ChatBubbleSnippetAttributes = DetailedHTMLProps<
  HTMLAttributes<ChatBubbleSnippet>,
  ChatBubbleSnippet
> & {
  'api-url': string;
  placeholder?: string;
  theme?: Theme;
  'hide-branding'?: boolean | string;
  translations?: string;
  'chat-query-rewrite'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'chat-bubble-snippet': ChatBubbleSnippetAttributes;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'chat-bubble-snippet': ChatBubbleSnippetAttributes;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'chat-bubble-snippet': ChatBubbleSnippetAttributes;
    }
  }
}
