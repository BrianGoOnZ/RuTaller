import api from './api';

export const listOrdenes = (params) => api.get('/ordenes', { params }).then((r) => r.data);
export const getOrden = (id) => api.get(`/ordenes/${id}`).then((r) => r.data);
export const createOrden = (data) => api.post('/ordenes', data).then((r) => r.data);
export const updateOrden = (id, data) => api.put(`/ordenes/${id}`, data).then((r) => r.data);
export const deleteOrden = (id) => api.delete(`/ordenes/${id}`);
export const agregarItem = (id, data) => api.post(`/ordenes/${id}/items`, data).then((r) => r.data);
export const eliminarItem = (id, itemId) =>
  api.delete(`/ordenes/${id}/items/${itemId}`).then((r) => r.data);
export const subirFoto = (id, file) => {
  const formData = new FormData();
  formData.append('foto', file);
  return api
    .post(`/ordenes/${id}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
export const eliminarFoto = (id, fotoId) => api.delete(`/ordenes/${id}/fotos/${fotoId}`);

export const CHECKLIST_ITEMS = [
  'Espejos',
  'Asiento',
  'Faro delantero',
  'Luz trasera (freno)',
  'Direccionales',
  'Micas',
  'Cubiertas',
  'Molduras',
  'Tapon de gasolina',
  'Tacometro',
  'Pedales',
  'Parabrisas',
  'Claxon',
  'Tapon de aceite',
  'Tapon de radiador',
  'Filtro de aire',
  'Bateria',
  'Llaves',
  'Neumatico delantero',
  'Neumatico trasero',
  'Mofle',
];

export const NIVELES = ['vacio', '1/4', '1/2', '3/4', 'lleno'];

export const ESTADOS_ORDEN = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'diagnostico', label: 'En diagnostico' },
  { value: 'reparacion', label: 'En reparacion' },
  { value: 'lista', label: 'Lista para entrega' },
  { value: 'entregada', label: 'Entregada' },
  { value: 'garantia', label: 'Reabierta por garantia' },
  { value: 'cancelada', label: 'Cancelada' },
];
