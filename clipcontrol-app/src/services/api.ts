import axios from 'axios';

const API_URL = 'https://montane-alvina-courageous.ngrok-free.dev/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
    // ❌ NO poner Content-Type aquí - rompe FormData
  },
});

const apiService = {
  // Login
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  validarQR: async (token: string, periodo_id: number) => {
    const response = await api.post('/qr/validar', null, {
      params: { token, periodo_id }
    });
    return response.data;
  },

  // Obtener período activo
  getPeriodoActivo: async () => {
    const response = await api.get('/periodos/activo');
    return response.data;
  },

  // Obtener sucursales
  getSucursales: async () => {
    const response = await api.get('/sucursales');
    return response.data;
  },

  // Obtener estadísticas del guardia
  getEstadisticasGuardia: async (usuario_id: number) => {
    const response = await api.get(`/entregas/estadisticas-guardia/${usuario_id}`);
    return response.data;
  },

  // ✅ REGISTRAR ENTREGA CON FORMDATA
  registrarEntrega: async (data: {
    qr_token_id: number;
    empleado_id: number;
    usuario_id: number;
    periodo_id: number;
    foto_base64: string;
    observaciones?: string;
  }) => {
    console.log('🔄 Convirtiendo base64 a Blob...');

    // Convertir base64 a Blob
    const base64Data = data.foto_base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');

    // Crear FormData
    const formData = new FormData();
    formData.append('qr_token_id', data.qr_token_id.toString());
    formData.append('empleado_id', data.empleado_id.toString());
    formData.append('usuario_id', data.usuario_id.toString());
    formData.append('periodo_id', data.periodo_id.toString());
    formData.append('foto', blob, 'foto.jpg');
    formData.append('observaciones', data.observaciones || '');

    console.log('📤 Enviando FormData al backend...');

    const response = await api.post('/entregas/registrar-seguro', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Respuesta recibida:', response.data);
    return response.data;
  },
};

export default apiService;