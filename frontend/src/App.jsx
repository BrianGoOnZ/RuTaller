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
import Mecanicos from './pages/Mecanicos';
import Finanzas from './pages/Finanzas';
import Configuracion from './pages/Configuracion';

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
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalle />} />
          <Route path="/motos/:id" element={<MotoDetalle />} />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:id" element={<OrdenDetalle />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/mecanicos" element={<Mecanicos />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
