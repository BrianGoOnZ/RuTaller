import api from './api';

export const listInsumos = (q) => api.get('/insumos', { params: { q } }).then((r) => r.data);
export const createInsumo = (data) => api.post('/insumos', data).then((r) => r.data);
export const updateInsumo = (id, data) => api.put(`/insumos/${id}`, data).then((r) => r.data);
export const deleteInsumo = (id) => api.delete(`/insumos/${id}`);
export const listConsumosInsumo = (params) =>
  api.get('/insumos/consumos', { params }).then((r) => r.data);
export const registrarConsumoInsumo = (id, data) =>
  api.post(`/insumos/${id}/consumos`, data).then((r) => r.data);
