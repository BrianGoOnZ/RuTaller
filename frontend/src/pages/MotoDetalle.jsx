import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMoto } from '../services/motos';

const ESTADO_LABELS = {
  recibida: 'Recibida',
  diagnostico: 'En diagnostico',
  reparacion: 'En reparacion',
  lista: 'Lista para entrega',
  entregada: 'Entregada',
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
      <Link to={`/clientes/${moto.clienteId}`} className="text-sm text-slate-500 hover:underline">
        &larr; {moto.Cliente?.nombre}
      </Link>

      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {moto.marca} {moto.modelo}
        </h1>
        <p className="text-slate-500 text-sm">
          {moto.tipo} · Placas: {moto.placas || 'N/A'} · No. serie: {moto.noSerie || 'N/A'}
        </p>
      </div>

      <h2 className="text-lg font-semibold text-slate-700 mb-3">Historial de servicios</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Folio</th>
              <th className="px-4 py-2">Fecha ingreso</th>
              <th className="px-4 py-2">Trabajo solicitado</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {moto.OrdenServicios?.map((orden) => (
              <tr
                key={orden.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/servicios/${orden.id}`)}
              >
                <td className="px-4 py-2 font-medium">#{orden.id}</td>
                <td className="px-4 py-2">{orden.fechaIngreso}</td>
                <td className="px-4 py-2">{orden.trabajoSolicitado}</td>
                <td className="px-4 py-2">{ESTADO_LABELS[orden.estado]}</td>
                <td className="px-4 py-2">${Number(orden.total).toFixed(2)}</td>
              </tr>
            ))}
            {(!moto.OrdenServicios || moto.OrdenServicios.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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
