import { create } from 'zustand';
import { getConfiguracion } from '../services/configuracion';

export const useConfigStore = create((set) => ({
  nombreTaller: 'RuTaller',
  cargado: false,
  cargar: async () => {
    const config = await getConfiguracion();
    set({ nombreTaller: config?.nombreTaller || 'RuTaller', cargado: true });
  },
  setNombreTaller: (nombre) => set({ nombreTaller: nombre || 'RuTaller' }),
}));
