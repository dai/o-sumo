import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../lib/i18n';
import ManualRefreshButton from './ManualRefreshButton';

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

afterEach(async () => {
  await i18n.changeLanguage('ja');
  vi.useRealTimers();
});

describe('ManualRefreshButton', () => {
  it('renders the manual refresh label in the active language', () => {
    render(<ManualRefreshButton onRefresh={vi.fn().mockResolvedValue({ updated: true })} />);

    const button = screen.getByRole('button', { name: '最新に更新' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).not.toBeDisabled();
  });

  it('switches to English when language changes', async () => {
    render(<ManualRefreshButton onRefresh={vi.fn().mockResolvedValue({ updated: true })} />);
    expect(screen.getByRole('button', { name: '最新に更新' })).toBeInTheDocument();

    await i18n.changeLanguage('en');

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('disables and marks aria-busy while the refresh is in flight', async () => {
    const user = userEvent.setup();
    let resolveRefresh: (value: { updated: boolean }) => void = () => undefined;
    const onRefresh = vi.fn().mockImplementation(
      () => new Promise<{ updated: boolean }>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    const button = screen.getByRole('button', { name: '最新に更新' });

    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRefresh({ updated: true });
    });
  });

  it('returns to idle immediately when refresh reports an update', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue({ updated: true });

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    await user.click(screen.getByRole('button', { name: '最新に更新' }));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: '最新に更新' });
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('shows the upToDate label for 2s when refresh reports no change', async () => {
    const onRefresh = vi.fn().mockResolvedValue({ updated: false });

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: '最新に更新' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '最新です' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '最新に更新' })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows the error label for 3s when refresh throws', async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('network'));

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: '最新に更新' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '更新に失敗しました' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '最新に更新' })).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('prevents double-click while the refresh is in flight', async () => {
    const user = userEvent.setup();
    let resolveRefresh: (value: { updated: boolean }) => void = () => undefined;
    const onRefresh = vi.fn().mockImplementation(
      () => new Promise<{ updated: boolean }>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    await user.click(screen.getByRole('button', { name: '最新に更新' }));
    await user.click(screen.getByRole('button', { name: /最新に更新/ }));

    expect(onRefresh).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRefresh({ updated: true });
    });
  });

  it('does not update state after unmount when refresh resolves', async () => {
    let resolveRefresh: (value: { updated: boolean }) => void = () => undefined;
    const onRefresh = vi.fn().mockImplementation(
      () => new Promise<{ updated: boolean }>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const { unmount } = render(<ManualRefreshButton onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: '最新に更新' }));
    unmount();

    expect(() => {
      act(() => {
        resolveRefresh({ updated: false });
      });
    }).not.toThrow();
  });

  it('stays visible while scrolling (no hide-on-scroll-down class)', async () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });

    render(<ManualRefreshButton onRefresh={vi.fn().mockResolvedValue({ updated: true })} />);
    const button = screen.getByRole('button', { name: '最新に更新' });

    expect(button).not.toHaveClass('torikumi-refresh-btn--hidden');

    await act(async () => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 800, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(button).not.toHaveClass('torikumi-refresh-btn--hidden');
  });

  it('honors a disabled prop passed by the parent', () => {
    render(
      <ManualRefreshButton
        onRefresh={vi.fn().mockResolvedValue({ updated: true })}
        disabled
      />,
    );

    expect(screen.getByRole('button', { name: '最新に更新' })).toBeDisabled();
  });

  it('removes focus from the button after refresh reports an update', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue({ updated: true });

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    const button = screen.getByRole('button', { name: '最新に更新' });
    await user.click(button);

    await waitFor(() => {
      expect(button).not.toHaveFocus();
    });
  });

  it('removes focus from the button after refresh reports no change', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue({ updated: false });

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    const button = screen.getByRole('button', { name: '最新に更新' });
    await user.click(button);

    await waitFor(() => {
      expect(button).not.toHaveFocus();
    });
  });

  it('removes focus from the button after refresh throws', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockRejectedValue(new Error('network'));

    render(<ManualRefreshButton onRefresh={onRefresh} />);
    const button = screen.getByRole('button', { name: '最新に更新' });
    await user.click(button);

    await waitFor(() => {
      expect(button).not.toHaveFocus();
    });
  });
});
