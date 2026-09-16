import api from './api';

export const listProductos = (q) => api.get('/productos', { params: { q } }).then((r) => r.data);
export const createProducto = (data) => api.post('/productos', data).then((r) => r.data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data).then((r) => r.data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
