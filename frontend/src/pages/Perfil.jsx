import { useEffect, useState } from 'react';
import { getMe, updateMe, subirFotoUsuario, fotoUrl, ROLES_USUARIO } from '../services/usuarios';
import { useAuthStore } from '../store/authStore';
import { inputClass, labelClass, cardClass, btnPrimary, avatarInitial } from '../ui/styles';

function rolLabel(role) {
  return ROLES_USUARIO.find((r) => r.value === role)?.label || role;
}

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [telefono, setTelefono] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const setAuthUser = useAuthStore((s) => s.setUser);

  async function cargar() {
    const data = await getMe();
    setUsuario(data);
    setTelefono(data.telefono || '');
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const actualizado = await subirFotoUsuario(usuario.id, file);
      setUsuario(actualizado);
      setAuthUser({ fotoPath: actualizado.fotoPath });
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('La nueva contrasena y su confirmacion no coinciden');
      return;
    }

    setGuardando(true);
    try {
      const payload = { telefono };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const actualizado = await updateMe(payload);
      setUsuario(actualizado);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMensaje('Datos guardados');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  if (!usuario) return <p className="text-slate-500">Cargando...</p>;

  const foto = fotoUrl(usuario.fotoPath);

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Mi perfil</h1>
      <p className="mb-6 text-slate-500">Tu informacion y acceso al sistema.</p>

      <div className={`${cardClass} mb-6 flex items-center gap-4`}>
        {foto ? (
          <img src={foto} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-xl font-semibold text-white">
            {avatarInitial(usuario.name)}
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{usuario.name}</p>
          <p className="text-sm text-slate-500">
            @{usuario.username} · {rolLabel(usuario.role)}
          </p>
          <label className="mt-2 inline-block cursor-pointer text-xs font-medium text-orange-700 hover:underline">
            {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} disabled={subiendoFoto} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
        {usuario.especialidad && (
          <div>
            <label className={labelClass}>Especialidad</label>
            <p className="text-sm text-slate-600">{usuario.especialidad}</p>
          </div>
        )}
        {usuario.fechaIngreso && (
          <div>
            <label className={labelClass}>Fecha de ingreso</label>
            <p className="text-sm text-slate-600">{usuario.fechaIngreso}</p>
          </div>
        )}
        <div>
          <label className={labelClass}>Telefono</label>
          <input className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Cambiar contrasena (opcional)</p>
          <div className="space-y-3">
            <input
              type="password"
              className={inputClass}
              placeholder="Contrasena actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              className={inputClass}
              placeholder="Nueva contrasena"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className={inputClass}
              placeholder="Confirmar nueva contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {mensaje && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {mensaje}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button type="submit" disabled={guardando} className={btnPrimary}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
