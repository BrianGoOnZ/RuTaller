import { useEffect, useState } from 'react';
import { listGastos, createGasto, CATEGORIAS_GASTO } from '../services/gastos';
import { getFinanzasResumen } from '../services/reportes';
import { listInsumos } from '../services/insumos';
import Modal from '../components/Modal';
import { PlusIcon, CashIcon, ClipboardIcon, ReceiptIcon, ScaleIcon } from '../ui/icons';
import {
  inputClass,
  labelClass,
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  btnPrimary,
  statCardClass,
  statIconWrapClass,
} from '../ui/styles';

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
        <button onClick={abrirNuevo} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Registrar gasto
        </button>
      </div>

      <div className="flex items-end gap-3 mb-5">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className={statCardClass}>
            <div className={statIconWrapClass('blue')}>
              <CashIcon width={20} height={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Ventas de mostrador</p>
              <p className="text-xl font-bold text-slate-800">${resumen.ingresosVentas.toFixed(2)}</p>
            </div>
          </div>
          <div className={statCardClass}>
            <div className={statIconWrapClass('slate')}>
              <ClipboardIcon width={20} height={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Servicios entregados</p>
              <p className="text-xl font-bold text-slate-800">${resumen.ingresosServicios.toFixed(2)}</p>
            </div>
          </div>
          <div className={statCardClass}>
            <div className={statIconWrapClass('red')}>
              <ReceiptIcon width={20} height={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Gastos</p>
              <p className="text-xl font-bold text-red-600">${resumen.totalGastos.toFixed(2)}</p>
            </div>
          </div>
          <div className={statCardClass}>
            <div className={statIconWrapClass(resumen.balance >= 0 ? 'green' : 'red')}>
              <ScaleIcon width={20} height={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Balance</p>
              <p className={`text-xl font-bold ${resumen.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                ${resumen.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-slate-700">Gastos del periodo</h2>
      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Concepto</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Monto</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {gastos.map((g) => (
              <tr key={g.id} className={rowHoverClass}>
                <td className="px-5 py-3 text-slate-600">{g.fecha}</td>
                <td className="px-5 py-3 text-slate-800">{g.concepto}</td>
                <td className="px-5 py-3 text-slate-600">
                  {CATEGORIAS_GASTO.find((c) => c.value === g.categoria)?.label}
                  {g.Insumo && <span className="text-xs text-slate-400"> ({g.Insumo.nombre})</span>}
                </td>
                <td className="px-5 py-3 text-slate-600">${Number(g.monto).toFixed(2)}</td>
              </tr>
            ))}
            {gastos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
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
          <button type="submit" className={`${btnPrimary} w-full`}>
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
