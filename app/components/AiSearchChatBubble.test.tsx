import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { ChatBubbleSnippet } from '@cloudflare/ai-search-snippet/chat';
import AiSearchChatBubble from './AiSearchChatBubble';
import { AI_SEARCH_API_URL } from '../lib/ai-search';
import { i18n } from '../lib/i18n';

describe('AiSearchChatBubble', () => {
  beforeEach(async () => {
    document.documentElement.dataset.theme = 'light';
    await act(async () => {
      await i18n.changeLanguage('ja');
    });
  });

  afterEach(async () => {
    delete document.documentElement.dataset.theme;
    await act(async () => {
      await i18n.changeLanguage('ja');
    });
  });

  it('mounts chat-bubble-snippet with centralized API URL and Japanese UI copy', async () => {
    expect(AI_SEARCH_API_URL).toBe('https://ask.osada.us/');

    const { container } = render(<AiSearchChatBubble />);
    const snippet = container.querySelector('chat-bubble-snippet') as ChatBubbleSnippet | null;

    expect(snippet).not.toBeNull();
    expect(snippet?.getAttribute('api-url')).toBe('https://ask.osada.us/');
    expect(snippet?.getAttribute('theme')).toBe('light');
    expect(snippet?.getAttribute('placeholder')).toBe('力士や番付・過去の取組について聞いてみる');

    const shadow = snippet?.shadowRoot;
    expect(shadow).not.toBeNull();

    const bubbleButton = shadow?.querySelector('.bubble-button') as HTMLButtonElement | null;
    expect(bubbleButton?.getAttribute('aria-label')).toBe('AI検索チャットを開く');
    expect(shadow?.querySelector('.chat-header-title span')?.textContent).toBe('o-sumo に質問');

    // Open the chat window to verify ChatView receives JS-property translations (Issue #50 workaround).
    await act(async () => {
      bubbleButton?.click();
    });

    expect(shadow?.querySelector('.chat-empty-title')?.textContent).toBe('力士や番付について質問できます');
    expect(shadow?.querySelector('.chat-empty-description')?.textContent).toContain(
      '当日の取組結果など最新情報は「本日の取組」ページをご確認ください。',
    );
    const textarea = shadow?.querySelector('.chat-input') as HTMLTextAreaElement | null;
    expect(textarea?.getAttribute('placeholder')).toBe('力士や番付・過去の取組について聞いてみる');
    expect(shadow?.querySelector('.chat-send-button span')?.textContent).toBe('送信');
  });

  it('syncs theme attribute when document data-theme changes', async () => {
    const { container } = render(<AiSearchChatBubble />);
    const snippet = container.querySelector('chat-bubble-snippet');

    expect(snippet?.getAttribute('theme')).toBe('light');

    await act(async () => {
      document.documentElement.dataset.theme = 'dark';
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(snippet?.getAttribute('theme')).toBe('dark');
    });
  });

  it('updates localized labels when language switches to English', async () => {
    const { container } = render(<AiSearchChatBubble />);
    const snippet = container.querySelector('chat-bubble-snippet') as ChatBubbleSnippet | null;
    const shadow = snippet?.shadowRoot;
    const bubbleButton = shadow?.querySelector('.bubble-button') as HTMLButtonElement | null;

    await act(async () => {
      fireEvent.click(bubbleButton!);
      await i18n.changeLanguage('en');
    });

    await waitFor(() => {
      expect(snippet?.getAttribute('placeholder')).toBe('Ask about rikishi, banzuke, or past bouts');
      expect(shadow?.querySelector('.chat-header-title span')?.textContent).toBe('Ask o-sumo');
      expect(shadow?.querySelector('.chat-empty-title')?.textContent).toBe('Ask about rikishi and banzuke');
      expect(shadow?.querySelector('.chat-empty-description')?.textContent).toContain(
        "Today's Bouts page",
      );
      expect(shadow?.querySelector('.chat-send-button span')?.textContent).toBe('Send');
    });
  });
});
