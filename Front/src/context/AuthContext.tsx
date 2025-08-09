import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, type LoginPayload, type LoginResponse } from '../utils/api';

interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (payload: LoginPayload, remember?: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: false, error: null });

  // Levantar sesión si existe token previo
  useEffect(() => {
    const saved = localStorage.getItem('creencia_token');
    const userSaved = localStorage.getItem('creencia_user');
    if (saved && userSaved) {
      try {
        setState(s => ({ ...s, token: saved, user: JSON.parse(userSaved) }));
      } catch {}
    }
  }, []);

  const signIn = async (payload: LoginPayload, remember = true) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await apiLogin(payload);
      if (remember) localStorage.setItem('creencia_token', res.token);
      localStorage.setItem('creencia_user', JSON.stringify(res.user));
      setState({ user: res.user, token: res.token, loading: false, error: null });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e?.message || 'Error de autenticación' }));
    }
  };

  const signOut = () => {
    localStorage.removeItem('creencia_token');
    localStorage.removeItem('creencia_user');
    setState({ user: null, token: null, loading: false, error: null });
  };

  const value = useMemo<AuthContextType>(() => ({ ...state, signIn, signOut }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}