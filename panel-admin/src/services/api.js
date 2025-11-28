import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

// Empleados
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

// Periodos
export const getPeriodos = () => {
  return api.get('/periodos');
};

export const getPeriodoActivo = () => {
  return api.get('/periodos/activo');
};

export const createPeriodo = (data) => {
  return api.post('/periodos', data);
};

// Entregas
export const getEntregas = (params = {}) => {
  return api.get('/entregas', { params });
};

// Estadísticas
export const getEstadisticas = (periodoId) => {
  return api.get(`/estadisticas/${periodoId}`);
};

// Sucursales
export const getSucursales = () => {
  return api.get('/sucursales');
};

export default api;