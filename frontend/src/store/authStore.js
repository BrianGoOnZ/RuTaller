import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('rutaller_token') || null,
  user: JSON.parse(localStorage.getItem('rutaller_user') || 'null'),
  login: (token, user) => {
    localStorage.setItem('rutaller_token', token);
    localStorage.setItem('rutaller_user', JSON.stringify(user));
    set({ token, user });
  },
  setUser: (cambios) => {
    const user = { ...get().user, ...cambios };
    localStorage.setItem('rutaller_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('rutaller_token');
    localStorage.removeItem('rutaller_user');
    set({ token: null, user: null });
  },
}));
