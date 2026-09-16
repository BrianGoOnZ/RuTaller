import api from './api';

export const listMotos = (clienteId) =>
  api.get('/motos', { params: { clienteId } }).then((r) => r.data);
export const getMoto = (id) => api.get(`/motos/${id}`).then((r) => r.data);
export const createMoto = (data) => api.post('/motos', data).then((r) => r.data);
export const updateMoto = (id, data) => api.put(`/motos/${id}`, data).then((r) => r.data);
export const deleteMoto = (id) => api.delete(`/motos/${id}`);

export const TIPOS_MOTO = [
  'Trabajo/Cub',
  'Deportiva',
  'Naked',
  'Touring/Grande',
  'Doble proposito',
  'Scooter',
  'Cuatrimoto',
  'Otra',
];
