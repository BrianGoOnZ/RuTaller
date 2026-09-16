import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardResumen } from '../services/reportes';

const ESTADO_LABELS = {
  recibida: 'Recibida',
  diagnostico: 'En diagnostico',
  reparacion: 'En reparacion',
  lista: 'Lista para entrega',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardResumen().then(setResumen);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inicio</h1>

      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Motos actualmente en el taller</p>
            <p className="text-3xl font-bold text-slate-800">{resumen.enTaller}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Listas para entregar</p>
            <p className="text-3xl font-bold text-green-700">{resumen.listasParaEntregar}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Entregas estimadas hoy</p>
            <p className="text-3xl font-bold text-amber-600">{resumen.entregasHoy}</p>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-700 mb-3">Motos en taller</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Folio</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Moto</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {resumen?.ultimasOrdenes.map((o) => (
              <tr
                key={o.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/servicios/${o.id}`)}
              >
                <td className="px-4 py-2 font-medium">#{o.id}</td>
                <td className="px-4 py-2">{o.Moto?.Cliente?.nombre}</td>
                <td className="px-4 py-2">
                  {o.Moto?.marca} {o.Moto?.modelo}
                </td>
                <td className="px-4 py-2">{ESTADO_LABELS[o.estado]}</td>
              </tr>
            ))}
            {resumen?.ultimasOrdenes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No hay motos en el taller
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
