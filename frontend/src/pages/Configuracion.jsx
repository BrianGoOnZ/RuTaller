import { useEffect, useState } from 'react';
import { getConfiguracion, updateConfiguracion } from '../services/configuracion';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function Configuracion() {
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    getConfiguracion().then(setForm);
  }, []);

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    try {
      const actualizado = await updateConfiguracion(form);
      setForm(actualizado);
      setMensaje('Datos guardados');
    } finally {
      setGuardando(false);
    }
  }

  if (!form) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Configuracion</h1>
      <p className="text-slate-500 mb-6">
        Estos datos aparecen impresos en las ordenes de servicio y comprobantes.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className={labelClass}>Nombre del taller</label>
          <input
            className={inputClass}
            value={form.nombreTaller || ''}
            onChange={(e) => handleChange('nombreTaller', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Direccion</label>
          <input
            className={inputClass}
            value={form.direccion || ''}
            onChange={(e) => handleChange('direccion', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Telefono</label>
            <input
              className={inputClass}
              value={form.telefono || ''}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>R.F.C.</label>
            <input
              className={inputClass}
              value={form.rfc || ''}
              onChange={(e) => handleChange('rfc', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>IVA (%)</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={form.ivaPorcentaje}
            onChange={(e) => handleChange('ivaPorcentaje', e.target.value)}
          />
        </div>

        {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
