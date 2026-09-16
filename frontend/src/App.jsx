import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalle from './pages/ClienteDetalle';
import MotoDetalle from './pages/MotoDetalle';
import Recepcion from './pages/Recepcion';
import Servicios from './pages/Servicios';
import OrdenDetalle from './pages/OrdenDetalle';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Finanzas from './pages/Finanzas';
import Configuracion from './pages/Configuracion';

const ADMIN_CAJERO = ['administrador', 'cajero'];
const SOLO_ADMIN = ['administrador'];

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute roles={ADMIN_CAJERO}>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes/:id"
            element={
              <ProtectedRoute roles={ADMIN_CAJERO}>
                <ClienteDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motos/:id"
            element={
              <ProtectedRoute roles={ADMIN_CAJERO}>
                <MotoDetalle />
              </ProtectedRoute>
            }
          />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:id" element={<OrdenDetalle />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute roles={ADMIN_CAJERO}>
                <Ventas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/finanzas"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Finanzas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Configuracion />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}
