import { useEffect, useState } from 'react';
import {
  listMecanicos,
  createMecanico,
  updateMecanico,
  deleteMecanico,
  ESPECIALIDADES_MECANICO,
} from '../../services/mecanicos';
import Modal from '../Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const VACIO = { nombre: '', telefono: '', especialidad: '', fechaIngreso: '' };

export default function MecanicosTab() {
  const [mecanicos, setMecanicos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);

  async function cargar() {
    setMecanicos(await listMecanicos());
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setModalOpen(true);
  }

  function abrirEditar(m) {
    setEditando(m);
    setForm({
      nombre: m.nombre,
      telefono: m.telefono || '',
      especialidad: m.especialidad || '',
      fechaIngreso: m.fechaIngreso || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editando) await updateMecanico(editando.id, form);
    else await createMecanico(form);
    setModalOpen(false);
    cargar();
  }

  async function handleDelete(m) {
    if (!confirm(`Dar de baja a ${m.nombre}?`)) return;
    await deleteMecanico(m.id);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Catalogo de mecanicos del taller. Se usan para registrar quien consume cada insumo.
        </p>
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Nuevo mecanico
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Telefono</th>
              <th className="px-4 py-2">Especialidad</th>
              <th className="px-4 py-2">Fecha de ingreso</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {mecanicos.map((m) => (
              <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{m.nombre}</td>
                <td className="px-4 py-2">{m.telefono || '-'}</td>
                <td className="px-4 py-2">{m.especialidad || '-'}</td>
                <td className="px-4 py-2">{m.fechaIngreso || '-'}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button className="text-slate-500 hover:text-slate-800" onClick={() => abrirEditar(m)}>
                    Editar
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(m)}>
                    Dar de baja
                  </button>
                </td>
              </tr>
            ))}
            {mecanicos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Sin mecanicos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar mecanico' : 'Nuevo mecanico'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              className={inputClass}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telefono</label>
              <input
                className={inputClass}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Fecha de ingreso</label>
              <input
                type="date"
                className={inputClass}
                value={form.fechaIngreso}
                onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Especialidad</label>
            <select
              className={inputClass}
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {ESPECIALIDADES_MECANICO.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800"
          >
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
