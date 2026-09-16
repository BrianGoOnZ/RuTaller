import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { avatarInitial } from '../ui/styles';
import { fotoUrl, ROLES_USUARIO } from '../services/usuarios';

function rolLabel(role) {
  return ROLES_USUARIO.find((r) => r.value === role)?.label || role;
}

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const nombreTaller = useConfigStore((s) => s.nombreTaller);
  const cargar = useConfigStore((s) => s.cargar);
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const foto = fotoUrl(user?.fotoPath);

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-100 bg-white px-6">
      <span className="truncate text-sm font-semibold text-slate-700">{nombreTaller}</span>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50"
        >
          {foto ? (
            <img src={foto} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {avatarInitial(user?.name)}
            </div>
          )}
          <span className="text-sm text-slate-600">{user?.name}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {abierto && (
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg bg-white py-1 shadow-lg ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{rolLabel(user?.role)}</p>
            </div>
            <button
              onClick={() => {
                setAbierto(false);
                navigate('/perfil');
              }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              Mi perfil
            </button>
            <button
              onClick={logout}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
