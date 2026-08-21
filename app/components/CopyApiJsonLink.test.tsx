import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CopyApiJsonLink from './CopyApiJsonLink';

describe('CopyApiJsonLink', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['unavailable', undefined],
    ['rejected', { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) }],
  ])('shows the complete URL for manual copying when the Clipboard API is %s', async (_label, clipboard) => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboard,
    });
    render(<CopyApiJsonLink path="/api/v1/gyoji/1986.json" />);

    await user.click(screen.getByRole('button', { name: 'リンクをコピー' }));

    expect(screen.getByRole('textbox', { name: 'このURLをコピーしてください' })).toHaveValue(
      `${window.location.origin}/api/v1/gyoji/1986.json`,
    );
  });
});
