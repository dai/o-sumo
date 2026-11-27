import type { TFunction } from 'i18next';
import type { Translations } from '@cloudflare/ai-search-snippet';

/** Public Cloudflare AI Search endpoint for o-sumo. */
export const AI_SEARCH_API_URL = 'https://ask.osada.us/' as const;

/**
 * Builds the localized Translations object consumed by `<chat-bubble-snippet>`.
 */
export function buildAiChatTranslations(t: TFunction<'common'>): Translations {
  const placeholder = t('global.aiChat.placeholder');
  const loadingMessages = t('global.aiChat.loadingMessages', {
    returnObjects: true,
  });

  return {
    chatTitle: t('global.aiChat.chatTitle'),
    chatPlaceholder: placeholder,
    placeholder,
    chatInputAriaLabel: t('global.aiChat.chatInputAriaLabel'),
    sendButtonLabel: t('global.aiChat.sendButtonLabel'),
    sendButtonAriaLabel: t('global.aiChat.sendButtonAriaLabel'),
    chatEmptyTitle: t('global.aiChat.chatEmptyTitle'),
    chatEmptyDescription: t('global.aiChat.chatEmptyDescription'),
    openChatAriaLabel: t('global.aiChat.openChatAriaLabel'),
    clearHistoryAriaLabel: t('global.aiChat.clearHistoryAriaLabel'),
    minimizeAriaLabel: t('global.aiChat.minimizeAriaLabel'),
    closeAriaLabel: t('global.aiChat.closeAriaLabel'),
    userAvatar: t('global.aiChat.userAvatar'),
    assistantAvatar: t('global.aiChat.assistantAvatar'),
    errorPrefix: t('global.aiChat.errorPrefix'),
    unknownError: t('global.aiChat.unknownError'),
    justNow: t('global.aiChat.justNow'),
    minuteAgo: t('global.aiChat.minuteAgo'),
    minutesAgo: t('global.aiChat.minutesAgo'),
    hourAgo: t('global.aiChat.hourAgo'),
    hoursAgo: t('global.aiChat.hoursAgo'),
    loadingMessages: Array.isArray(loadingMessages)
      ? loadingMessages.filter((item): item is string => typeof item === 'string')
      : undefined,
  };
}
