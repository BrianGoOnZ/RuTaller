import api from './api';

export const listMecanicos = () => api.get('/mecanicos').then((r) => r.data);
export const createMecanico = (data) => api.post('/mecanicos', data).then((r) => r.data);
export const updateMecanico = (id, data) => api.put(`/mecanicos/${id}`, data).then((r) => r.data);
export const deleteMecanico = (id) => api.delete(`/mecanicos/${id}`);

export const ESPECIALIDADES_MECANICO = [
  'General',
  'Motor y transmision',
  'Sistema electrico',
  'Frenos y suspension',
  'Diagnostico y electronica',
  'Carroceria y pintura',
];
