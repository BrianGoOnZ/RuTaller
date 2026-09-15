import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Recepcion from './pages/Recepcion';
import Servicios from './pages/Servicios';
import Inventario from './pages/Inventario';
import Finanzas from './pages/Finanzas';

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
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/finanzas" element={<Finanzas />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
