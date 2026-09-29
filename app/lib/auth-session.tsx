import React from 'react';

export type AuthUser = {
  id: string;
  displayName: string;
};

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

type AuthSessionValue = {
  status: AuthStatus;
  user: AuthUser | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

type SessionResponse =
  | { authenticated: false }
  | { authenticated: true; user: AuthUser };

const AuthSessionContext = React.createContext<AuthSessionValue | null>(null);
const UNAVAILABLE_AUTH_SESSION: AuthSessionValue = {
  status: 'error',
  user: null,
  refresh: async () => undefined,
  logout: async () => undefined,
};

function isSessionResponse(value: unknown): value is SessionResponse {
  if (!value || typeof value !== 'object' || !('authenticated' in value)) return false;
  const session = value as { authenticated?: unknown; user?: unknown };
  if (session.authenticated === false) return true;
  if (session.authenticated !== true || !session.user || typeof session.user !== 'object') return false;
  const user = session.user as { id?: unknown; displayName?: unknown };
  return typeof user.id === 'string' && typeof user.displayName === 'string';
}

export function AuthSessionProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('auth_session_request_failed');
      const session: unknown = await response.json();
      if (!isSessionResponse(session)) throw new Error('auth_session_invalid');
      if (session.authenticated) {
        setUser(session.user);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('anonymous');
      }
    } catch {
      setUser(null);
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('auth_logout_request_failed');
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = React.useMemo<AuthSessionValue>(() => ({ status, user, refresh, logout }), [logout, refresh, status, user]);
  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionValue {
  return React.useContext(AuthSessionContext) ?? UNAVAILABLE_AUTH_SESSION;
}
