import api from './api';

export const listUsuarios = (params) => api.get('/usuarios', { params }).then((r) => r.data);
export const getMe = () => api.get('/usuarios/me').then((r) => r.data);
export const updateMe = (data) => api.put('/usuarios/me', data).then((r) => r.data);
export const createUsuario = (data) => api.post('/usuarios', data).then((r) => r.data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then((r) => r.data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
export const subirFotoUsuario = (id, file) => {
  const formData = new FormData();
  formData.append('foto', file);
  return api
    .post(`/usuarios/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const ROLES_USUARIO = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'cajero', label: 'Cajero' },
  { value: 'mecanico', label: 'Mecanico' },
];

export const ESPECIALIDADES_MECANICO = [
  'General',
  'Motor y transmision',
  'Sistema electrico',
  'Frenos y suspension',
  'Diagnostico y electronica',
  'Carroceria y pintura',
];

export function fotoUrl(fotoPath) {
  return fotoPath ? `http://localhost:4000/uploads/${fotoPath}` : null;
}
