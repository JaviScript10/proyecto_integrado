import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

// EMPLEADOS
export const getEmpleados = (params = {}) => {
  return api.get('/empleados', { params });
};

export const getEmpleadoByRut = (rut) => {
  return api.get(`/empleados/rut/${rut}`);
};

export const createEmpleado = (data) => {
  return api.post('/empleados', data);
};

export const updateEmpleado = (id, data) => {
  return api.put(`/empleados/${id}`, data);
};

// SUCURSALES
export const getSucursales = () => {
  return api.get('/sucursales');
};

// ENTREGAS
export const getEntregas = () => {
  return api.get('/entregas/lista');
};

export const getEstadisticasEntregas = () => {
  return api.get('/entregas/estadisticas');
};

export const createEntrega = (data) => {
  return api.post('/entregas', data);
};

// REPORTES
export const getResumenGeneral = () => {
  return api.get('/reportes/resumen');
};

export const getEntregasPorSucursal = () => {
  return api.get('/reportes/entregas-por-sucursal');
};

export const getEntregasPorFecha = (fechaInicio, fechaFin) => {
  return api.get('/reportes/entregas-por-fecha', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
};

export const getUsuarios = (rol = null) => {
  return api.get('/usuarios', { params: { rol } });
};

export const createUsuario = (data) => {
  return api.post('/usuarios', data);
};

export const updateUsuario = (id, data) => {
  return api.put(`/usuarios/${id}`, data);
};

export const deleteUsuario = (id) => {
  return api.delete(`/usuarios/${id}`);
};

export default api;

// CONFIGURACIÓN (SUPERADMIN)
export const getConfiguracion = () => {
  return api.get('/configuracion');
};

export const updateConfiguracion = (data) => {
  return api.post('/configuracion', data);
};

// BENEFICIOS
export const getBeneficios = (activo = null) => {
  return api.get('/beneficios', { params: { activo } });
};

export const createBeneficio = (data) => {
  return api.post('/beneficios', data);
};

// CAJAS NO RETIRADAS
export const getCajasNoRetiradas = (estado = null) => {
  return api.get('/cajas-no-retiradas', { params: { estado } });
};

export const verificarPendientes = (periodoId) => {
  return api.post(`/verificar-pendientes/${periodoId}`);
};