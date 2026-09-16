import api from './api';

export const listGastos = (params) => api.get('/gastos', { params }).then((r) => r.data);
export const createGasto = (data) => api.post('/gastos', data).then((r) => r.data);

export const CATEGORIAS_GASTO = [
  { value: 'herramienta', label: 'Herramienta' },
  { value: 'insumo', label: 'Insumo (grasa, liquidos, etc.)' },
  { value: 'servicios', label: 'Servicios (luz, agua, renta)' },
  { value: 'otro', label: 'Otro' },
];
