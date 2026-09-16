import { useEffect, useState } from 'react';
import {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  fotoUrl,
  ROLES_USUARIO,
  ESPECIALIDADES_MECANICO,
} from '../services/usuarios';
import { useAuthStore } from '../store/authStore';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, PlusIcon } from '../ui/icons';
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
  badgePill,
} from '../ui/styles';

const ROL_BADGE = {
  administrador: 'bg-slate-800 text-white',
  cajero: 'bg-blue-100 text-blue-700',
  mecanico: 'bg-orange-100 text-orange-700',
};

const VACIO = {
  name: '',
  username: '',
  password: '',
  role: 'mecanico',
  telefono: '',
  especialidad: '',
  fechaIngreso: '',
};

export default function Usuarios() {
  const usuarioActual = useAuthStore((s) => s.user);
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');

  async function cargar() {
    setUsuarios(await listUsuarios());
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setError('');
    setModalOpen(true);
  }

  function abrirEditar(u) {
    setEditando(u);
    setForm({
      name: u.name,
      username: u.username,
      password: '',
      role: u.role,
      telefono: u.telefono || '',
      especialidad: u.especialidad || '',
      fechaIngreso: u.fechaIngreso || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editando) {
        const cambios = { ...form };
        if (cambios.password) {
          cambios.newPassword = cambios.password;
        }
        delete cambios.password;
        delete cambios.username;
        await updateUsuario(editando.id, cambios);
      } else {
        await createUsuario(form);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Dar de baja a ${u.name}?`)) return;
    try {
      await deleteUsuario(u.id);
      cargar();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo dar de baja');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">Empleados con acceso al sistema y mecanicos del taller.</p>
        </div>
        <button onClick={abrirNuevo} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Nuevo usuario
        </button>
      </div>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Telefono</th>
              <th className="px-5 py-3">Especialidad</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {usuarios.map((u) => (
              <tr key={u.id} className={rowHoverClass}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {fotoUrl(u.fotoPath) ? (
                      <img src={fotoUrl(u.fotoPath)} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className={avatarClass}>{avatarInitial(u.name)}</div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`${badgePill} ${ROL_BADGE[u.role]}`}>
                    {ROLES_USUARIO.find((r) => r.value === u.role)?.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{u.telefono || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{u.especialidad || '-'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => abrirEditar(u)} className={actionBtnNeutral}>
                      <PencilIcon /> Editar
                    </button>
                    {u.id !== usuarioActual?.id && (
                      <button onClick={() => handleDelete(u)} className={actionBtnDanger}>
                        <TrashIcon /> Dar de baja
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Sin usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar usuario' : 'Nuevo usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {!editando && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Usuario</label>
                <input
                  className={inputClass}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Contrasena</label>
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {editando && (
            <div>
              <label className={labelClass}>Nueva contrasena (dejar vacio para no cambiarla)</label>
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Rol</label>
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES_USUARIO.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
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

          {form.role === 'mecanico' && (
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
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className={`${btnPrimary} w-full`}>
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
