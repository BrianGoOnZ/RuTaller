import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes, createCliente, updateCliente, deleteCliente } from '../services/clientes';
import Modal from '../components/Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const VACIO = { nombre: '', direccion: '', cp: '', telefono: '' };

const iconProps = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

const actionBtn =
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors';

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
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Nuevo cliente
        </button>
      </div>

      <input
        className={`${inputClass} mb-4 max-w-sm`}
        placeholder="Buscar por nombre o telefono..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Telefono</th>
              <th className="px-5 py-3">Direccion</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{c.telefono || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.direccion || '-'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/clientes/${c.id}`)}
                      className={`${actionBtn} border-slate-200 text-slate-700 hover:bg-slate-100`}
                    >
                      <EyeIcon /> Ver motos
                    </button>
                    <button
                      onClick={() => abrirEditar(c)}
                      className={`${actionBtn} border-slate-200 text-slate-700 hover:bg-slate-100`}
                    >
                      <PencilIcon /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className={`${actionBtn} border-red-200 text-red-600 hover:bg-red-50`}
                    >
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
