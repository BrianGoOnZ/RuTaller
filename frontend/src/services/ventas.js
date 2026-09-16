import api from './api';

export const listVentas = () => api.get('/ventas').then((r) => r.data);
export const createVenta = (data) => api.post('/ventas', data).then((r) => r.data);
