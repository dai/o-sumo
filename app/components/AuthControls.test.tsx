import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthSessionProvider } from '../lib/auth-session';
import { MyRikishiProvider } from '../lib/my-rikishi';
import AuthControls from './AuthControls';

function renderControls(fetcher: typeof fetch, initialEntry: string = '/my-rikishi/') {
  vi.stubGlobal('fetch', fetcher);
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthSessionProvider>
        <MyRikishiProvider><AuthControls /></MyRikishiProvider>
      </AuthSessionProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('AuthControls', () => {
  it('offers optional Google sign-in while preserving local mode', async () => {
    renderControls(vi.fn().mockResolvedValue(Response.json({ authenticated: false })));
    const signIn = await screen.findByRole('link', { name: 'Google でログイン' });
    expect(signIn).toHaveAttribute('href', '/api/auth/google?returnTo=%2Fmy-rikishi%2F');
    expect(screen.getByText('ログインしなくても、この端末には保存できます。')).toBeInTheDocument();
    expect(screen.getByText('※ パスワード入力は不要です')).toBeInTheDocument();
  });

  it('preserves the current page in returnTo when signing in from another page', async () => {
    renderControls(vi.fn().mockResolvedValue(Response.json({ authenticated: false })), '/20260913-torikumi/');
    const signIn = await screen.findByRole('link', { name: 'Google でログイン' });
    expect(signIn).toHaveAttribute('href', '/api/auth/google?returnTo=%2F20260913-torikumi%2F');
  });

  it('shows the account and signs out without clearing local selections', async () => {
    localStorage.setItem('o-sumo:my-rikishi:v1', '[3]');
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: 'user-1', displayName: 'Dai' } });
      }
      if (input === '/api/my-rikishi' && !init?.method) return Response.json({ ids: [] });
      if (input === '/api/my-rikishi' && init?.method === 'PUT') return Response.json({ ids: [3] });
      if (input === '/api/auth/logout') return Response.json({ ok: true });
      return new Response(null, { status: 404 });
    });
    renderControls(fetchMock);

    expect(await screen.findByText('Dai')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));
    expect(await screen.findByRole('link', { name: 'Google でログイン' })).toBeInTheDocument();
    expect(localStorage.getItem('o-sumo:my-rikishi:v1')).toBe('[3]');
  });
});
