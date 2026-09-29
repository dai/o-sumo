import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthSessionProvider } from './auth-session';
import {
  MY_RIKISHI_STORAGE_KEY,
  MyRikishiProvider,
  useMyRikishi,
} from './my-rikishi';

function Probe() {
  const { ids, authenticated, syncing, syncError } = useMyRikishi();
  return <span>{JSON.stringify({ ids, authenticated, syncing, syncError })}</span>;
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('MyRikishiProvider', () => {
  it('merges local and account favorites once after sign-in', async () => {
    localStorage.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify([3]));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: 'user-1', displayName: 'Dai' } });
      }
      if (input === '/api/my-rikishi' && !init?.method) return Response.json({ ids: [1, 3] });
      if (input === '/api/my-rikishi' && init?.method === 'PUT') return Response.json({ ids: [3, 1] });
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthSessionProvider>
        <MyRikishiProvider><Probe /></MyRikishiProvider>
      </AuthSessionProvider>,
    );

    await waitFor(() => expect(screen.getByText(JSON.stringify({
      ids: [3, 1],
      authenticated: true,
      syncing: false,
      syncError: false,
    }))).toBeInTheDocument());
    expect(localStorage.getItem(MY_RIKISHI_STORAGE_KEY)).toBe('[3,1]');
    expect(fetchMock).toHaveBeenCalledWith('/api/my-rikishi', expect.objectContaining({ method: 'PUT' }));
  });

  it('retains local favorites when account synchronization fails', async () => {
    localStorage.setItem(MY_RIKISHI_STORAGE_KEY, JSON.stringify([3]));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (input === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: 'user-1', displayName: 'Dai' } });
      }
      return new Response(null, { status: 503 });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthSessionProvider>
        <MyRikishiProvider><Probe /></MyRikishiProvider>
      </AuthSessionProvider>,
    );

    await waitFor(() => expect(screen.getByText(JSON.stringify({
      ids: [3],
      authenticated: true,
      syncing: false,
      syncError: true,
    }))).toBeInTheDocument());
    expect(localStorage.getItem(MY_RIKISHI_STORAGE_KEY)).toBe('[3]');
  });
});
