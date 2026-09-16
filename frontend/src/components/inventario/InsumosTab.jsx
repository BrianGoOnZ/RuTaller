import { useEffect, useState } from 'react';
import { listInsumos, createInsumo, updateInsumo, deleteInsumo } from '../../services/insumos';
import Modal from '../Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const VACIO = { nombre: '', unidad: 'pieza', stock: '', costoPromedio: '' };

export default function InsumosTab() {
  const [insumos, setInsumos] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);

  async function cargar() {
    setInsumos(await listInsumos(q));
  }

  useEffect(() => {
    cargar();
  }, [q]);

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
        Los insumos (grasa, liquidos, etc.) no se venden; su existencia se repone al registrar un gasto
        en la pantalla de Finanzas.
      </p>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
    </div>
  );
}
