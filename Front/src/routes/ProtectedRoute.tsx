import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de ruta protegida.
 * - Verifica si el usuario tiene token en el contexto de autenticación.
 * - Si NO tiene token, redirige a /login.
 * - Si tiene token, renderiza el contenido (children).
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth(); // Obtiene token del contexto

  // Si no hay token, redirige a login
  if (!token) return <Navigate to="/login" replace />;

  // Si hay token, renderiza el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
