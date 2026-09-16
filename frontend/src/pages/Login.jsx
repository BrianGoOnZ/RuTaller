import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { inputClass, btnPrimary } from '../ui/styles';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sesionExpirada = searchParams.get('expirada') === '1';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesion');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-80 space-y-4 rounded-xl bg-white p-8 shadow-lg ring-1 ring-slate-100"
      >
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
            RT
          </div>
          <h1 className="text-xl font-bold text-slate-800">RuTaller</h1>
        </div>
        {sesionExpirada && !error && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
            Tu sesion anterior expiro. Vuelve a iniciar sesion — tu informacion sigue guardada.
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}
        <input
          className={inputClass}
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className={inputClass}
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className={`${btnPrimary} w-full`}>
          Entrar
        </button>
      </form>
    </div>
  );
}
