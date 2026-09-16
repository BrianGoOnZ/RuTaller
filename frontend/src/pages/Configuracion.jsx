import { useEffect, useState } from 'react';
import { getConfiguracion, updateConfiguracion } from '../services/configuracion';
import { useConfigStore } from '../store/configStore';
import { inputClass, labelClass, cardClass, btnPrimary } from '../ui/styles';

export default function Configuracion() {
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const setNombreTaller = useConfigStore((s) => s.setNombreTaller);

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
      setNombreTaller(actualizado.nombreTaller);
      setMensaje('Datos guardados');
    } finally {
      setGuardando(false);
    }
  }

  if (!form) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Configuracion</h1>
      <p className="mb-6 text-slate-500">
        Estos datos aparecen impresos en las ordenes de servicio y comprobantes.
      </p>

      <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
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

        {mensaje && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {mensaje}
          </p>
        )}

        <button type="submit" disabled={guardando} className={btnPrimary}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
