import axios from 'axios';

const API_URL = 'https://montane-alvina-courageous.ngrok-free.dev/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('guardia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Objeto con todas las funciones
const apiService = {
  loginGuardia: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  validarQR: async (token: string, periodo_id: number) => {
    const response = await api.post('/qr/validar', null, {
      params: { token, periodo_id }
    });
    return response.data;
  },

registrarEntrega: async (data: {
  qr_token_id: number;
  empleado_id: number;
  usuario_id: number;
  periodo_id: number;
  foto_base64: string;
  dispositivo_id?: string;
  ip_address?: string;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
}) => {
  // Convertir a query params
  const params = new URLSearchParams();
  params.append('qr_token_id', data.qr_token_id.toString());
  params.append('empleado_id', data.empleado_id.toString());
  params.append('usuario_id', data.usuario_id.toString());
  params.append('periodo_id', data.periodo_id.toString());
  params.append('foto_base64', data.foto_base64);
  
  if (data.dispositivo_id) params.append('dispositivo_id', data.dispositivo_id);
  if (data.ip_address) params.append('ip_address', data.ip_address);
  if (data.latitud) params.append('latitud', data.latitud.toString());
  if (data.longitud) params.append('longitud', data.longitud.toString());
  if (data.observaciones) params.append('observaciones', data.observaciones);

  const response = await api.post(`/entregas/registrar-seguro?${params.toString()}`);
  return response.data;
},

  getPeriodoActivo: async () => {
    const response = await api.get('/periodos/activo');
    return response.data;
  },
};

export default apiService;