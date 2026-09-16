import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 w-80 space-y-4">
        <h1 className="text-xl font-bold text-center text-slate-800">RuTaller</h1>
        {sesionExpirada && !error && (
          <p className="text-sm text-amber-700 text-center">
            Tu sesion anterior expiro. Vuelve a iniciar sesion — tu informacion sigue guardada.
          </p>
        )}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <input
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
