import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardResumen } from '../services/reportes';
import {
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  statCardClass,
  statIconWrapClass,
  badgePill,
  ESTADO_BADGE_COLORS,
} from '../ui/styles';
import { BikeIcon, CheckCircleIcon, ClockIcon } from '../ui/icons';

const ESTADO_LABELS = {
  recibida: 'Recibida',
  diagnostico: 'En diagnostico',
  reparacion: 'En reparacion',
  lista: 'Lista para entrega',
  entregada: 'Entregada',
  garantia: 'Reabierta por garantia',
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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Inicio</h1>

      {resumen && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={statCardClass}>
            <div className={statIconWrapClass('slate')}>
              <BikeIcon width={22} height={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Motos actualmente en el taller</p>
              <p className="text-3xl font-bold text-slate-800">{resumen.enTaller}</p>
            </div>
          </div>
          <div className={statCardClass}>
            <div className={statIconWrapClass('green')}>
              <CheckCircleIcon width={22} height={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Listas para entregar</p>
              <p className="text-3xl font-bold text-green-700">{resumen.listasParaEntregar}</p>
            </div>
          </div>
          <div className={statCardClass}>
            <div className={statIconWrapClass('amber')}>
              <ClockIcon width={22} height={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Entregas estimadas hoy</p>
              <p className="text-3xl font-bold text-amber-600">{resumen.entregasHoy}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-slate-700">Motos en taller</h2>
      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Folio</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Moto</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {resumen?.ultimasOrdenes.map((o) => (
              <tr key={o.id} className={`${rowHoverClass} cursor-pointer`} onClick={() => navigate(`/servicios/${o.id}`)}>
                <td className="px-5 py-3 font-medium text-slate-800">#{o.id}</td>
                <td className="px-5 py-3 text-slate-600">{o.Moto?.Cliente?.nombre}</td>
                <td className="px-5 py-3 text-slate-600">
                  {o.Moto?.marca} {o.Moto?.modelo}
                </td>
                <td className="px-5 py-3">
                  <span className={`${badgePill} ${ESTADO_BADGE_COLORS[o.estado]}`}>
                    {ESTADO_LABELS[o.estado]}
                  </span>
                </td>
              </tr>
            ))}
            {resumen?.ultimasOrdenes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
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
