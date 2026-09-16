export default function EstadoAutoGuardado({ estado }) {
  if (estado === 'guardando') return <span className="text-xs text-slate-400">Guardando...</span>;
  if (estado === 'guardado') return <span className="text-xs text-green-600">Guardado</span>;
  return null;
}
