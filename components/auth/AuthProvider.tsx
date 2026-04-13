'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AppRole = 'admin' | 'user';

type MeResponse = {
  user: { id: string; email: string | null; name?: string | null } | null;
  role: AppRole | null;
  ok?: boolean;
  error?: string;
};

type AuthContextValue = {
  loading: boolean;
  user: { id: string; email: string | null; name?: string | null } | null;
  role: AppRole | null;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string | null; name?: string | null } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      const j = (await res.json()) as MeResponse;
      if (!res.ok) {
        setUser(null);
        setRole(null);
        return;
      }
      setUser(j.user ?? null);
      setRole(j.role ?? null);
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ loading, user, role, refresh }),
    [loading, user, role, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return ctx;
}
