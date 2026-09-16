import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMoto } from '../services/motos';
import {
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  badgePill,
  ESTADO_BADGE_COLORS,
} from '../ui/styles';

const ESTADO_LABELS = {
  recibida: 'Recibida',
  diagnostico: 'En diagnostico',
  reparacion: 'En reparacion',
  lista: 'Lista para entrega',
  entregada: 'Entregada',
  garantia: 'Reabierta por garantia',
  cancelada: 'Cancelada',
};

export default function MotoDetalle() {
  const { id } = useParams();
  const [moto, setMoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMoto(id).then(setMoto);
  }, [id]);

  if (!moto) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div>
      <Link to={`/clientes/${moto.clienteId}`} className="text-sm text-slate-500 hover:text-slate-700">
        &larr; {moto.Cliente?.nombre}
      </Link>

      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {moto.marca} {moto.modelo}
        </h1>
        <p className="text-sm text-slate-500">
          {moto.tipo} · Placas: {moto.placas || 'N/A'} · No. serie: {moto.noSerie || 'N/A'}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-700">Historial de servicios</h2>
      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Folio</th>
              <th className="px-5 py-3">Fecha ingreso</th>
              <th className="px-5 py-3">Trabajo solicitado</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {moto.OrdenServicios?.map((orden) => (
              <tr
                key={orden.id}
                className={`${rowHoverClass} cursor-pointer`}
                onClick={() => navigate(`/servicios/${orden.id}`)}
              >
                <td className="px-5 py-3 font-medium text-slate-800">#{orden.id}</td>
                <td className="px-5 py-3 text-slate-600">{orden.fechaIngreso}</td>
                <td className="px-5 py-3 text-slate-600">{orden.trabajoSolicitado}</td>
                <td className="px-5 py-3">
                  <span className={`${badgePill} ${ESTADO_BADGE_COLORS[orden.estado]}`}>
                    {ESTADO_LABELS[orden.estado]}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">${Number(orden.total).toFixed(2)}</td>
              </tr>
            ))}
            {(!moto.OrdenServicios || moto.OrdenServicios.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Esta moto aun no tiene servicios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
