import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import WebMcpProvider from './WebMcpProvider';

describe('WebMcpProvider', () => {
  let provideContext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    provideContext = vi.fn();
    Object.defineProperty(window.navigator, 'modelContext', {
      configurable: true,
      value: { provideContext },
    });
  });

  afterEach(() => {
    delete (window.navigator as { modelContext?: unknown }).modelContext;
    vi.restoreAllMocks();
  });

  it('calls navigator.modelContext.provideContext on mount', () => {
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

  it('renders children when no navigator.modelContext is available', () => {
    delete (window.navigator as { modelContext?: unknown }).modelContext;
    const { getByTestId } = render(
      <WebMcpProvider>
        <div data-testid="child">child</div>
      </WebMcpProvider>,
    );
    expect(getByTestId('child')).toBeTruthy();
    expect(provideContext).not.toHaveBeenCalled();
  });
});