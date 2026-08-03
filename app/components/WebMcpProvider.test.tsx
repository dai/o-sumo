import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebMcpProvider from './WebMcpProvider';

interface DocumentHolder {
  modelContext?: {
    registerTool?: ReturnType<typeof vi.fn>;
    provideContext?: ReturnType<typeof vi.fn>;
  };
}

interface NavigatorHolder {
  modelContext?: {
    provideContext?: ReturnType<typeof vi.fn>;
  };
}

function setDocumentModelContext(holder: DocumentHolder): void {
  // Mutate the existing jsdom `document` rather than replacing it,
  // otherwise `@testing-library/react` loses access to `document.body`
  // and the render() call fails with `appendChild of undefined`.
  Object.defineProperty(globalThis.document, 'modelContext', {
    value: holder.modelContext,
    configurable: true,
    writable: true,
  });
}

function setNavigatorModelContext(holder: NavigatorHolder): void {
  Object.defineProperty(window.navigator, 'modelContext', {
    configurable: true,
    value: holder.modelContext,
  });
}

function restoreDocument(): void {
  Object.defineProperty(globalThis.document, 'modelContext', {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

function clearNavigatorModelContext(): void {
  Object.defineProperty(window.navigator, 'modelContext', {
    configurable: true,
    value: undefined,
  });
}

describe('WebMcpProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    restoreDocument();
    clearNavigatorModelContext();
  });

  it('registers every WebMCP tool via document.modelContext.registerTool on mount', () => {
    const registerTool = vi.fn();
    setDocumentModelContext({ modelContext: { registerTool } });

    const { unmount } = render(
      <WebMcpProvider>
        <div data-testid="child">child</div>
      </WebMcpProvider>,
    );
    expect(registerTool).toHaveBeenCalledTimes(4);

    for (const call of registerTool.mock.calls) {
      const [tool, options] = call as [{ name: string }, { signal: AbortSignal } | undefined];
      expect(typeof tool.name).toBe('string');
      expect(options?.signal).toBeInstanceOf(AbortSignal);
      expect(options?.signal.aborted).toBe(false);
    }

    unmount();
  });

  it('aborts the registration signals on unmount', () => {
    const registerTool = vi.fn();
    setDocumentModelContext({ modelContext: { registerTool } });

    const { unmount } = render(
      <WebMcpProvider>
        <div data-testid="child">child</div>
      </WebMcpProvider>,
    );
    const firstSignal = (registerTool.mock.calls[0] as unknown as [unknown, { signal: AbortSignal }])[1].signal;
    expect(firstSignal.aborted).toBe(false);

    unmount();
    expect(firstSignal.aborted).toBe(true);
  });

  it('falls back to navigator.modelContext.provideContext when document.modelContext is missing', () => {
    const provideContext = vi.fn();
    // No document.modelContext — provider must pick up the legacy navigator API.
    setDocumentModelContext({});
    setNavigatorModelContext({ modelContext: { provideContext } });

    render(
      <WebMcpProvider>
        <div data-testid="child">child</div>
      </WebMcpProvider>,
    );
    expect(provideContext).toHaveBeenCalledTimes(1);
    const arg = provideContext.mock.calls[0][0];
    expect(Array.isArray(arg.tools)).toBe(true);
    expect(arg.tools.length).toBeGreaterThan(0);
  });

  it('renders children without registering tools when neither API is available', () => {
    setDocumentModelContext({});
    clearNavigatorModelContext();

    const { getByTestId } = render(
      <WebMcpProvider>
        <div data-testid="child">child</div>
      </WebMcpProvider>,
    );
    expect(getByTestId('child')).toBeTruthy();
  });
});
