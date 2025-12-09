import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, RotateCcw } from 'lucide-react';
import api from '../services/api';

export default function Configuracion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState({
    color_primario: '#3B82F6',
    color_secundario: '#8B5CF6',
    color_exito: '#10B981',
    color_peligro: '#EF4444',
    nombre_empresa: 'Tresmontes Lucchetti',
    logo_empresa: '/assets/logo.png',
    dias_caducidad_beneficio: 60,
    notificaciones_email: true,
    modo_mantenimiento: false
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.rol !== 'superadmin') {
      alert('Solo SUPERADMIN puede acceder a esta página');
      navigate('/dashboard');
      return;
    }
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await api.get('/configuracion');
      setConfig(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/configuracion', config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('¿Restaurar valores por defecto?')) return;
    setConfig({
      color_primario: '#3B82F6',
      color_secundario: '#8B5CF6',
      color_exito: '#10B981',
      color_peligro: '#EF4444',
      nombre_empresa: 'Tresmontes Lucchetti',
      logo_empresa: '/assets/logo.png',
      dias_caducidad_beneficio: 60,
      notificaciones_email: true,
      modo_mantenimiento: false
    });
  };

  const ColorPicker = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="#000000"
        />
        <div 
          className="w-10 h-10 rounded border-2 border-gray-300"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-sm text-gray-600">Panel SUPERADMIN - CiberByte</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw size={20} />
                Restaurar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                <Save size={20} />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Colores de la Interfaz */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={24} />
            Colores de la Interfaz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker
              label="Color Primario"
              value={config.color_primario}
              onChange={(value) => setConfig({...config, color_primario: value})}
            />
            <ColorPicker
              label="Color Secundario"
              value={config.color_secundario}
              onChange={(value) => setConfig({...config, color_secundario: value})}
            />
            <ColorPicker
              label="Color Éxito"
              value={config.color_exito}
              onChange={(value) => setConfig({...config, color_exito: value})}
            />
            <ColorPicker
              label="Color Peligro"
              value={config.color_peligro}
              onChange={(value) => setConfig({...config, color_peligro: value})}
            />
          </div>
        </div>

        {/* Información de la Empresa */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Información de la Empresa
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={config.nombre_empresa}
                onChange={(e) => setConfig({...config, nombre_empresa: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruta del Logo
              </label>
              <input
                type="text"
                value={config.logo_empresa}
                onChange={(e) => setConfig({...config, logo_empresa: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/assets/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Configuraciones del Sistema */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Configuraciones del Sistema
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días para caducidad de beneficio (traspaso a sindicato)
              </label>
              <input
                type="number"
                value={config.dias_caducidad_beneficio}
                onChange={(e) => setConfig({...config, dias_caducidad_beneficio: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="365"
              />
              <p className="text-sm text-gray-500 mt-1">
                Después de este período, las cajas no retiradas se traspasan automáticamente al sindicato
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.notificaciones_email}
                onChange={(e) => setConfig({...config, notificaciones_email: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Activar notificaciones por email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.modo_mantenimiento}
                onChange={(e) => setConfig({...config, modo_mantenimiento: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Modo Mantenimiento (bloquea acceso al sistema)
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Vista Previa
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button 
                className="px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: config.color_primario }}
              >
                Botón Primario
              </button>
              <button 
                className="px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: config.color_secundario }}
              >
                Botón Secundario
              </button>
              <button 
                className="px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: config.color_exito }}
              >
                Botón Éxito
              </button>
              <button 
                className="px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: config.color_peligro }}
              >
                Botón Peligro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}