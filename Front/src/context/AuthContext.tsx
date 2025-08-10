import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, type LoginPayload, type LoginResponse } from '../utils/api';

// Estado que maneja la sesión del usuario y el progreso de login
interface AuthState {
  user: LoginResponse['user'] | null; // Datos del usuario autenticado
  token: string | null;               // JWT almacenado en localStorage (si se usa)
  loading: boolean;                   // Indicador de operación en curso (login)
  error: string | null;               // Mensaje de error (si falla el login)
}

// Interfaz pública del contexto de autenticación
interface AuthContextType extends AuthState {
  signIn: (payload: LoginPayload, remember?: boolean) => Promise<boolean>; // Inicia sesión
  signOut: () => void;                                                  // Cierra sesión
}

// Crea el contexto; por defecto 'undefined' para forzar uso dentro del provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor que envuelve la app y expone estado y acciones de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado principal de auth
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: false, error: null });

  // Efecto: al montar, intenta hidratar sesión desde localStorage si existe
  useEffect(() => {
    const saved = localStorage.getItem('creencia_token');
    const userSaved = localStorage.getItem('creencia_user');
    if (saved && userSaved) {
      try {
        setState(s => ({ ...s, token: saved, user: JSON.parse(userSaved) }));
      } catch {} // Silencia errores de parseo para no romper el render
    }
  }, []);

  // Acción: iniciar sesión contra la API
  const signIn = async (payload: LoginPayload, remember = true) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await apiLogin(payload);
      if (remember) localStorage.setItem('creencia_token', res.token);
      localStorage.setItem('creencia_user', JSON.stringify(res.user));
      setState({ user: res.user, token: res.token, loading: false, error: null });
      return true;
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e?.message || 'Error de autenticación' }));
      return false;
    }
  };

  // Acción: cerrar sesión (borra almacenamiento y limpia estado)
  const signOut = () => {
    localStorage.removeItem('creencia_token');
    localStorage.removeItem('creencia_user');
    setState({ user: null, token: null, loading: false, error: null });
  };

  // Memoriza el valor del contexto para evitar renders innecesarios
  const value = useMemo<AuthContextType>(() => ({ ...state, signIn, signOut }), [state]);

  // Expone el contexto a los hijos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook de conveniencia para consumir el contexto; exige estar dentro del provider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
