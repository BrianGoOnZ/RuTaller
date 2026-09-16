import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrdenes, ESTADOS_ORDEN } from '../services/ordenes';
import {
  inputClass,
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  badgePill,
  ESTADO_BADGE_COLORS,
  btnPrimary,
} from '../ui/styles';
import { PlusIcon } from '../ui/icons';

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
          className={`${btnPrimary} inline-flex items-center gap-1.5`}
        >
          <PlusIcon width={16} height={16} /> Nueva recepcion
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className={`${inputClass} max-w-sm`}
          placeholder="Buscar por folio, placas o cliente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={`${inputClass} w-56`} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_ORDEN.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Folio</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Moto</th>
              <th className="px-5 py-3">Ingreso</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {ordenes.map((o) => (
              <tr key={o.id} className={`${rowHoverClass} cursor-pointer`} onClick={() => navigate(`/servicios/${o.id}`)}>
                <td className="px-5 py-3 font-medium text-slate-800">#{o.id}</td>
                <td className="px-5 py-3 text-slate-600">{o.Moto?.Cliente?.nombre}</td>
                <td className="px-5 py-3 text-slate-600">
                  {o.Moto?.marca} {o.Moto?.modelo} ({o.Moto?.placas})
                </td>
                <td className="px-5 py-3 text-slate-600">{o.fechaIngreso}</td>
                <td className="px-5 py-3">
                  <span className={`${badgePill} ${ESTADO_BADGE_COLORS[o.estado]}`}>
                    {ESTADOS_ORDEN.find((e) => e.value === o.estado)?.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">${Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
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
