import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import './styles/global.css';

/**
 * Componente principal de la app.
 * - Define las rutas públicas (/ y /login).
 * - Define la ruta protegida (/dashboard) que requiere login.
 * - Envuelve todo en AuthProvider para manejar sesión globalmente.
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página pública de inicio */}
          <Route path="/" element={<Home />} />
          {/* Página de login */}
          <Route path="/login" element={<Login />} />
          {/* Página protegida - solo accesible si hay token */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
