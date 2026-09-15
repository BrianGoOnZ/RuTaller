import { useAuthStore } from '../store/authStore';

export default function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-6">
      <span className="text-sm text-slate-600">{user?.name}</span>
      <button
        onClick={logout}
        className="text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        Cerrar sesion
      </button>
    </header>
  );
}
