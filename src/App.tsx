import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MigracionesDashboard from './pages/MigracionesDashboard';
import ConfiguracionPage from './pages/ConfiguracionPage';
import WebhooksPage from './pages/WebhooksPage';
import UsuariosPage from './pages/UsuariosPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './hooks/useAuth';

function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/migraciones" replace />} />
              <Route path="migraciones" element={<MigracionesDashboard />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
              <Route path="webhooks" element={<WebhooksPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="*" element={<Navigate to="/migraciones" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
