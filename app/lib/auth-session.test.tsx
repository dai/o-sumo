import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthSessionProvider, useAuthSession } from './auth-session';

function Probe() {
  const session = useAuthSession();
  return (
    <div>
      <span>{session.status}</span>
      <span>{session.user?.displayName ?? 'guest'}</span>
      <button type="button" onClick={() => void session.logout()}>logout</button>
    </div>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('AuthSessionProvider', () => {
  it('loads the current signed-in user once', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      authenticated: true,
      user: { id: 'user-1', displayName: 'Dai' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AuthSessionProvider><Probe /></AuthSessionProvider>);

    expect(await screen.findByText('Dai')).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('logs out using a same-origin POST and becomes anonymous', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ authenticated: true, user: { id: 'user-1', displayName: 'Dai' } }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<AuthSessionProvider><Probe /></AuthSessionProvider>);

    await screen.findByText('Dai');
    await user.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });
});
