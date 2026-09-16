import { useEffect, useState } from 'react';
import {
  listMecanicos,
  createMecanico,
  updateMecanico,
  deleteMecanico,
  ESPECIALIDADES_MECANICO,
} from '../../services/mecanicos';
import Modal from '../Modal';
import { PencilIcon, TrashIcon, PlusIcon } from '../../ui/icons';
import {
  inputClass,
  labelClass,
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  btnPrimary,
  actionBtnNeutral,
  actionBtnDanger,
  avatarInitial,
  avatarClass,
} from '../../ui/styles';

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
        <button onClick={abrirNuevo} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Nuevo mecanico
        </button>
      </div>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Mecanico</th>
              <th className="px-5 py-3">Telefono</th>
              <th className="px-5 py-3">Especialidad</th>
              <th className="px-5 py-3">Fecha de ingreso</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {mecanicos.map((m) => (
              <tr key={m.id} className={rowHoverClass}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={avatarClass}>{avatarInitial(m.nombre)}</div>
                    <span className="font-medium text-slate-800">{m.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{m.telefono || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{m.especialidad || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{m.fechaIngreso || '-'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => abrirEditar(m)} className={actionBtnNeutral}>
                      <PencilIcon /> Editar
                    </button>
                    <button onClick={() => handleDelete(m)} className={actionBtnDanger}>
                      <TrashIcon /> Dar de baja
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {mecanicos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
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
          <button type="submit" className={`${btnPrimary} w-full`}>
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
