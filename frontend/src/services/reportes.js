import api from './api';

export const getDashboardResumen = () => api.get('/dashboard/resumen').then((r) => r.data);
export const getFinanzasResumen = (params) =>
  api.get('/finanzas/resumen', { params }).then((r) => r.data);
