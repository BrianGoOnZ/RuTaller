import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes, createCliente, updateCliente, deleteCliente } from '../services/clientes';
import Modal from '../components/Modal';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon } from '../ui/icons';
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
} from '../ui/styles';

const VACIO = { nombre: '', direccion: '', cp: '', telefono: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const navigate = useNavigate();

  async function cargar() {
    const data = await listClientes(q);
    setClientes(data);
  }

  useEffect(() => {
    cargar();
  }, [q]);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setModalOpen(true);
  }

  function abrirEditar(cliente) {
    setEditando(cliente);
    setForm({
      nombre: cliente.nombre,
      direccion: cliente.direccion || '',
      cp: cliente.cp || '',
      telefono: cliente.telefono || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editando) {
      await updateCliente(editando.id, form);
    } else {
      await createCliente(form);
    }
    setModalOpen(false);
    cargar();
  }

  async function handleDelete(cliente) {
    if (!confirm(`Eliminar a ${cliente.nombre}?`)) return;
    await deleteCliente(cliente.id);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <button onClick={abrirNuevo} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Nuevo cliente
        </button>
      </div>

      <input
        className={`${inputClass} mb-4 max-w-sm`}
        placeholder="Buscar por nombre o telefono..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Telefono</th>
              <th className="px-5 py-3">Direccion</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {clientes.map((c) => (
              <tr key={c.id} className={rowHoverClass}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={avatarClass}>{avatarInitial(c.nombre)}</div>
                    <span className="font-medium text-slate-800">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{c.telefono || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.direccion || '-'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/clientes/${c.id}`)} className={actionBtnNeutral}>
                      <EyeIcon /> Ver motos
                    </button>
                    <button onClick={() => abrirEditar(c)} className={actionBtnNeutral}>
                      <PencilIcon /> Editar
                    </button>
                    <button onClick={() => handleDelete(c)} className={actionBtnDanger}>
                      <TrashIcon /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Sin clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre (razon social)</label>
            <input
              className={inputClass}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Direccion</label>
            <input
              className={inputClass}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>C.P.</label>
              <input
                className={inputClass}
                value={form.cp}
                onChange={(e) => setForm({ ...form, cp: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Telefono</label>
              <input
                className={inputClass}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className={`${btnPrimary} w-full`}>
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
