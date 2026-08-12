import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken, setUnauthorizedHandler } from '../../lib/api-client';
import { login as loginRequest } from './api';
import { LoginPayload, LoginResponse } from './types';

type AuthContextValue = {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    setReady(true);
  }, []);

  function persistToken(next: string | null) {
    setToken(next);
    setTokenState(next);
  }

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload);
    persistToken(response.accessToken);
    setUser(response.user);
  }

  function logout() {
    persistToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(token), login, logout }),
    [user, token],
  );

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
