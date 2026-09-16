import { useEffect, useState } from 'react';
import {
  listInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  listConsumosInsumo,
  registrarConsumoInsumo,
} from '../../services/insumos';
import { listMecanicos, createMecanico } from '../../services/mecanicos';
import Modal from '../Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const VACIO = { nombre: '', unidad: 'pieza', stock: '', costoPromedio: '' };
const VACIO_CONSUMO = { cantidad: '', fecha: new Date().toISOString().slice(0, 10), nota: '', mecanicoId: '' };

export default function InsumosTab() {
  const [insumos, setInsumos] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);

  const [consumoModalOpen, setConsumoModalOpen] = useState(false);
  const [insumoConsumiendo, setInsumoConsumiendo] = useState(null);
  const [consumoForm, setConsumoForm] = useState(VACIO_CONSUMO);
  const [errorConsumo, setErrorConsumo] = useState('');

  const [mecanicos, setMecanicos] = useState([]);
  const [nuevoMecanicoOpen, setNuevoMecanicoOpen] = useState(false);
  const [nuevoMecanicoNombre, setNuevoMecanicoNombre] = useState('');

  async function cargar() {
    setInsumos(await listInsumos(q));
  }

  async function cargarConsumos() {
    setConsumos(await listConsumosInsumo());
  }

  async function cargarMecanicos() {
    setMecanicos(await listMecanicos());
  }

  useEffect(() => {
    cargar();
  }, [q]);

  useEffect(() => {
    cargarConsumos();
    cargarMecanicos();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setModalOpen(true);
  }

  function abrirEditar(i) {
    setEditando(i);
    setForm({ nombre: i.nombre, unidad: i.unidad, stock: i.stock, costoPromedio: i.costoPromedio || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editando) await updateInsumo(editando.id, form);
    else await createInsumo(form);
    setModalOpen(false);
    cargar();
  }

  async function handleDelete(i) {
    if (!confirm(`Desactivar ${i.nombre}?`)) return;
    await deleteInsumo(i.id);
    cargar();
  }

  function abrirConsumo(insumo) {
    setInsumoConsumiendo(insumo);
    setConsumoForm(VACIO_CONSUMO);
    setErrorConsumo('');
    setNuevoMecanicoOpen(false);
    setNuevoMecanicoNombre('');
    setConsumoModalOpen(true);
  }

  async function handleCrearMecanico() {
    if (!nuevoMecanicoNombre.trim()) return;
    const creado = await createMecanico({ nombre: nuevoMecanicoNombre.trim() });
    await cargarMecanicos();
    setConsumoForm({ ...consumoForm, mecanicoId: creado.id });
    setNuevoMecanicoOpen(false);
    setNuevoMecanicoNombre('');
  }

  async function handleRegistrarConsumo(e) {
    e.preventDefault();
    setErrorConsumo('');
    try {
      await registrarConsumoInsumo(insumoConsumiendo.id, consumoForm);
      setConsumoModalOpen(false);
      cargar();
      cargarConsumos();
    } catch (err) {
      setErrorConsumo(err.response?.data?.message || 'No se pudo registrar el consumo');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Buscar insumo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Nuevo insumo
        </button>
      </div>

      <p className="text-sm text-slate-500 mb-3">
        Los insumos (grasa, liquidos, etc.) no se venden. Su existencia sube cuando registras un gasto
        de compra en Finanzas, y baja cuando registras aqui lo que se va consumiendo en los trabajos.
      </p>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Unidad</th>
              <th className="px-4 py-2">Existencia</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((i) => (
              <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{i.nombre}</td>
                <td className="px-4 py-2">{i.unidad}</td>
                <td className="px-4 py-2">{i.stock}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button className="text-amber-700 hover:text-amber-900" onClick={() => abrirConsumo(i)}>
                    Registrar consumo
                  </button>
                  <button className="text-slate-500 hover:text-slate-800" onClick={() => abrirEditar(i)}>
                    Editar
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(i)}>
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {insumos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Sin insumos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-slate-700 mb-2">Consumos recientes</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Insumo</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Mecanico</th>
              <th className="px-4 py-2">Nota</th>
            </tr>
          </thead>
          <tbody>
            {consumos.slice(0, 10).map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{c.fecha}</td>
                <td className="px-4 py-2">{c.Insumo?.nombre}</td>
                <td className="px-4 py-2">
                  {c.cantidad} {c.Insumo?.unidad}
                </td>
                <td className="px-4 py-2">{c.Mecanico?.nombre || '-'}</td>
                <td className="px-4 py-2">{c.nota || '-'}</td>
              </tr>
            ))}
            {consumos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Sin consumos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar insumo' : 'Nuevo insumo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Unidad</label>
              <input className={inputClass} placeholder="litro, pieza, kg..." value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Existencia actual</label>
              <input type="number" step="0.01" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Costo promedio (opcional)</label>
            <input type="number" step="0.01" className={inputClass} value={form.costoPromedio} onChange={(e) => setForm({ ...form, costoPromedio: e.target.value })} />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800">
            Guardar
          </button>
        </form>
      </Modal>

      <Modal
        open={consumoModalOpen}
        onClose={() => setConsumoModalOpen(false)}
        title={`Registrar consumo: ${insumoConsumiendo?.nombre || ''}`}
      >
        <form onSubmit={handleRegistrarConsumo} className="space-y-4">
          <p className="text-sm text-slate-500">
            Existencia actual: {insumoConsumiendo?.stock} {insumoConsumiendo?.unidad}
          </p>

          <div>
            <label className={labelClass}>Mecanico que lo consumio</label>
            {nuevoMecanicoOpen ? (
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Nombre del mecanico"
                  value={nuevoMecanicoNombre}
                  onChange={(e) => setNuevoMecanicoNombre(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCrearMecanico}
                  className="bg-slate-900 text-white rounded-md px-3 text-sm font-medium"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoMecanicoOpen(false)}
                  className="text-sm text-slate-500"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  className={inputClass}
                  value={consumoForm.mecanicoId}
                  onChange={(e) => setConsumoForm({ ...consumoForm, mecanicoId: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  {mecanicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setNuevoMecanicoOpen(true)}
                  className="text-sm text-slate-500 hover:underline whitespace-nowrap"
                >
                  + Nuevo
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cantidad usada</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={consumoForm.cantidad}
                onChange={(e) => setConsumoForm({ ...consumoForm, cantidad: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                type="date"
                className={inputClass}
                value={consumoForm.fecha}
                onChange={(e) => setConsumoForm({ ...consumoForm, fecha: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Nota (opcional)</label>
            <input
              className={inputClass}
              placeholder="Ej. usado en cambio de balatas"
              value={consumoForm.nota}
              onChange={(e) => setConsumoForm({ ...consumoForm, nota: e.target.value })}
            />
          </div>
          {errorConsumo && <p className="text-sm text-red-600">{errorConsumo}</p>}
          <button type="submit" className="w-full bg-amber-600 text-white rounded-md py-2 text-sm font-medium hover:bg-amber-700">
            Registrar consumo
          </button>
        </form>
      </Modal>
    </div>
  );
}
