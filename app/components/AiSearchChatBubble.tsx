import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@cloudflare/ai-search-snippet/chat';
import type { ChatBubbleSnippet, Theme as SnippetTheme } from '@cloudflare/ai-search-snippet';
import { AI_SEARCH_API_URL, buildAiChatTranslations } from '../lib/ai-search';
import { readThemeFromDataset } from '../lib/theme';
import './ai-search-chat-bubble.css';

function resolveSnippetTheme(): SnippetTheme {
  return readThemeFromDataset() ?? 'auto';
}

export default function AiSearchChatBubble() {
  const { t, i18n } = useTranslation('common');
  const bubbleRef = useRef<ChatBubbleSnippet>(null);
  const [theme, setTheme] = useState<SnippetTheme>(() => resolveSnippetTheme());

  const translations = useMemo(
    () => buildAiChatTranslations(t),
    // `i18n.resolvedLanguage` ensures translation objects recompute on language switch.
    [t, i18n.resolvedLanguage],
  );
  const translationsJson = useMemo(() => JSON.stringify(translations), [translations]);

  useEffect(() => {
    setTheme(resolveSnippetTheme());

    if (typeof document === 'undefined' || typeof MutationObserver !== 'function') {
      return;
    }

    const observer = new MutationObserver(() => {
      setTheme(resolveSnippetTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = bubbleRef.current;
    if (!element) {
      return;
    }
    // Setting the JS property ensures ChatView receives translations even when
    // the upstream web component only reads `translationsOverride` in getProps().
    element.translations = translations;
  }, [translations]);

  return (
    <chat-bubble-snippet
      ref={bubbleRef}
      className="ai-search-chat-bubble"
      api-url={AI_SEARCH_API_URL}
      placeholder={translations.chatPlaceholder}
      theme={theme}
      translations={translationsJson}
    />
  );
}
