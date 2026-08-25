import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DailyMonomosuBox from './DailyMonomosuBox';

function setShare(value: ((data: ShareData) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value,
  });
}

function setClipboard(value: Pick<Clipboard, 'writeText'> | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  });
}

describe('DailyMonomosuBox', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setShare(undefined);
    setClipboard(undefined);
  });

  it('starts the device-only zabuton count at zero and stores it per basho day', async () => {
    const user = userEvent.setup();
    render(<DailyMonomosuBox monthKey="202609" day={1} shareTitle="九月場所 初日" />);

    const button = screen.getByRole('button', { name: /この端末で座布団を投げる/ });
    expect(button).toHaveTextContent('この端末の座布団 0枚');

    await user.click(button);

    expect(button).toHaveTextContent('この端末の座布団 1枚');
    expect(window.localStorage.getItem('osumo_daily_zabuton_count:202609:1')).toBe('1');
    expect(screen.getByRole('status')).toHaveTextContent('この端末の座布団は1枚です');
  });

  it('connects the disclosure, visible textarea label, and writing hint', async () => {
    const user = userEvent.setup();
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    render(<DailyMonomosuBox monthKey="202609" day={1} shareTitle="九月場所 初日" />);

    const toggle = screen.getByRole('button', { name: 'あなたも物申す' });
    expect(toggle).toHaveAttribute('aria-controls', 'daily-monomosu-drawer');
    expect(document.getElementById('daily-monomosu-drawer')).toHaveAttribute('hidden');
    expect(screen.queryByRole('textbox', { name: 'あなたのひとこと' })).not.toBeInTheDocument();

    toggle.focus();
    await user.keyboard('{Enter}');

    const textarea = screen.getByRole('textbox', { name: 'あなたのひとこと' });
    expect(document.getElementById('daily-monomosu-drawer')).not.toHaveAttribute('hidden');
    expect(document.getElementById('daily-monomosu-drawer')).toContainElement(textarea);
    expect(textarea).toHaveAttribute('aria-describedby', 'daily-monomosu-hint');
    expect(document.getElementById('daily-monomosu-hint')).toHaveTextContent('注目ポイントをシェア');

    await user.type(textarea, '結びの一番に注目');
    await user.tab();
    const shareButton = screen.getByRole('button', { name: '予想を共有' });
    expect(shareButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('クリップボードにコピーしました');
  });

  it('uses the native share sheet with the current page URL when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);
    const user = userEvent.setup();
    render(<DailyMonomosuBox monthKey="202609" day={1} shareTitle="九月場所 初日" />);

    await user.click(screen.getByRole('button', { name: 'あなたも物申す' }));
    await user.type(screen.getByPlaceholderText(/注目ポイント/), '初日の横綱対決に注目');
    await user.click(screen.getByRole('button', { name: '予想を共有' }));

    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: '九月場所 初日',
      text: expect.stringContaining('初日の横綱対決に注目'),
      url: window.location.href,
    }));
    expect(screen.getByRole('status')).toHaveTextContent('共有しました');
  });

  it('copies when native sharing is unavailable', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(
      <DailyMonomosuBox
        monthKey="202607"
        day={15}
        shareTitle="七月場所 千秋楽"
        customComment="千秋楽の結びを振り返ります。"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'あなたも物申す' }));
    await user.click(screen.getByRole('button', { name: '予想を共有' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(window.location.href));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('千秋楽の結びを振り返ります。'));
    expect(writeText).not.toHaveBeenCalledWith(expect.stringContaining('九月場所の優勝争い'));
    expect(screen.getByRole('status')).toHaveTextContent('クリップボードにコピーしました');
  });

  it('shows a manual copy field when sharing and clipboard both fail', async () => {
    const user = userEvent.setup();
    setShare(vi.fn().mockRejectedValue(new Error('share failed')));
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('copy failed')) });
    render(<DailyMonomosuBox monthKey="202609" day={1} shareTitle="九月場所 初日" />);

    await user.click(screen.getByRole('button', { name: 'あなたも物申す' }));
    await user.click(screen.getByRole('button', { name: '予想を共有' }));

    const manualCopy = screen.getByRole('textbox', { name: 'この内容をコピーしてください' });
    expect((manualCopy as HTMLTextAreaElement).value).toContain(window.location.href);
    expect(screen.getByRole('status')).toHaveTextContent('自動コピーできませんでした');
    expect(manualCopy).toHaveAttribute('aria-describedby', 'daily-monomosu-copy-status');
  });

  it('treats cancellation of the native share sheet as a neutral outcome', async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));
    const user = userEvent.setup();
    render(<DailyMonomosuBox monthKey="202609" day={1} shareTitle="九月場所 初日" />);

    await user.click(screen.getByRole('button', { name: 'あなたも物申す' }));
    await user.click(screen.getByRole('button', { name: '予想を共有' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('この内容をコピーしてください')).not.toBeInTheDocument();
  });
});
