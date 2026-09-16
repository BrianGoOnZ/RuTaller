import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { avatarInitial } from '../ui/styles';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const nombreTaller = useConfigStore((s) => s.nombreTaller);
  const cargar = useConfigStore((s) => s.cargar);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-100 bg-white px-6">
      <span className="truncate text-sm font-semibold text-slate-700">{nombreTaller}</span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {avatarInitial(user?.name)}
          </div>
          <span className="text-sm text-slate-600">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}
