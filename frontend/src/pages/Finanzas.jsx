import { useEffect, useState } from 'react';
import { listGastos, createGasto, CATEGORIAS_GASTO } from '../services/gastos';
import { getFinanzasResumen } from '../services/reportes';
import { listInsumos } from '../services/insumos';
import Modal from '../components/Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

function primerDiaDelMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const VACIO = { concepto: '', categoria: 'herramienta', monto: '', insumoId: '', cantidadInsumo: '' };

export default function Finanzas() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VACIO);

  async function cargar() {
    const [r, g] = await Promise.all([
      getFinanzasResumen({ desde, hasta }),
      listGastos({ desde, hasta }),
    ]);
    setResumen(r);
    setGastos(g);
  }

  useEffect(() => {
    cargar();
  }, [desde, hasta]);

  useEffect(() => {
    listInsumos().then(setInsumos);
  }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createGasto({
      ...form,
      fecha: hoyISO(),
      insumoId: form.categoria === 'insumo' ? form.insumoId || null : null,
      cantidadInsumo: form.categoria === 'insumo' ? form.cantidadInsumo || null : null,
    });
    setModalOpen(false);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Finanzas</h1>
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Registrar gasto
        </button>
      </div>

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className={labelClass}>Desde</label>
          <input type="date" className={inputClass} value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Hasta</label>
          <input type="date" className={inputClass} value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Ventas de mostrador</p>
            <p className="text-xl font-bold text-slate-800">${resumen.ingresosVentas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Servicios entregados</p>
            <p className="text-xl font-bold text-slate-800">${resumen.ingresosServicios.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Gastos</p>
            <p className="text-xl font-bold text-red-600">${resumen.totalGastos.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-slate-400">Balance</p>
            <p className={`text-xl font-bold ${resumen.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              ${resumen.balance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-700 mb-3">Gastos del periodo</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Concepto</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{g.fecha}</td>
                <td className="px-4 py-2">{g.concepto}</td>
                <td className="px-4 py-2">
                  {CATEGORIAS_GASTO.find((c) => c.value === g.categoria)?.label}
                  {g.Insumo && <span className="text-xs text-slate-400"> ({g.Insumo.nombre})</span>}
                </td>
                <td className="px-4 py-2">${Number(g.monto).toFixed(2)}</td>
              </tr>
            ))}
            {gastos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Sin gastos en este periodo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar gasto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Concepto</label>
            <input
              className={inputClass}
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Categoria</label>
            <select
              className={inputClass}
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {form.categoria === 'insumo' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Insumo</label>
                <select
                  className={inputClass}
                  value={form.insumoId}
                  onChange={(e) => setForm({ ...form, insumoId: e.target.value })}
                >
                  <option value="">Selecciona...</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} ({i.unidad})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Cantidad comprada</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.cantidadInsumo}
                  onChange={(e) => setForm({ ...form, cantidadInsumo: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Monto ($)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800">
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
