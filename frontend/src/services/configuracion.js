import api from './api';

export const getConfiguracion = () => api.get('/configuracion').then((r) => r.data);
export const updateConfiguracion = (data) => api.put('/configuracion', data).then((r) => r.data);
