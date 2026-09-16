import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes, createCliente, updateCliente, deleteCliente } from '../services/clientes';
import Modal from '../components/Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Telefono</th>
              <th className="px-4 py-2">Direccion</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <button
                    className="text-slate-800 font-medium hover:underline"
                    onClick={() => navigate(`/clientes/${c.id}`)}
                  >
                    {c.nombre}
                  </button>
                </td>
                <td className="px-4 py-2">{c.telefono}</td>
                <td className="px-4 py-2">{c.direccion}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button className="text-slate-500 hover:text-slate-800" onClick={() => abrirEditar(c)}>
                    Editar
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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
