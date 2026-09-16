import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrdenes, ESTADOS_ORDEN } from '../services/ordenes';

const ESTADO_COLORS = {
  recibida: 'bg-slate-100 text-slate-700',
  diagnostico: 'bg-blue-100 text-blue-700',
  reparacion: 'bg-amber-100 text-amber-700',
  lista: 'bg-green-100 text-green-700',
  entregada: 'bg-slate-200 text-slate-500',
  cancelada: 'bg-red-100 text-red-700',
};

export default function Servicios() {
  const [ordenes, setOrdenes] = useState([]);
  const [estado, setEstado] = useState('');
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  async function cargar() {
    const data = await listOrdenes({ estado: estado || undefined, q: q || undefined });
    setOrdenes(data);
  }

  useEffect(() => {
    cargar();
  }, [estado, q]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Servicios</h1>
        <button
          onClick={() => navigate('/recepcion')}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Nueva recepcion
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="border border-slate-300 rounded-md px-3 py-2 text-sm max-w-sm w-full"
          placeholder="Buscar por folio, placas o cliente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_ORDEN.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Folio</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Moto</th>
              <th className="px-4 py-2">Ingreso</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr
                key={o.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/servicios/${o.id}`)}
              >
                <td className="px-4 py-2 font-medium">#{o.id}</td>
                <td className="px-4 py-2">{o.Moto?.Cliente?.nombre}</td>
                <td className="px-4 py-2">
                  {o.Moto?.marca} {o.Moto?.modelo} ({o.Moto?.placas})
                </td>
                <td className="px-4 py-2">{o.fechaIngreso}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[o.estado]}`}>
                    {ESTADOS_ORDEN.find((e) => e.value === o.estado)?.label}
                  </span>
                </td>
                <td className="px-4 py-2">${Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Sin ordenes de servicio
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
