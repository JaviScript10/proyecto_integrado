import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowLeft, Edit2, Trash2, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Sucursales() {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    activa: true
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sucursales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSucursales(response.data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/sucursales`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      resetForm();
      loadSucursales();
      alert('Sucursal creada correctamente');
    } catch (error) {
      console.error('Error al crear sucursal:', error);
      alert(error.response?.data?.detail || 'Error al crear sucursal');
    }
  };

  const handleEdit = (sucursal) => {
    setEditingSucursal(sucursal);
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion || '',
      ciudad: sucursal.ciudad || '',
      activa: sucursal.activa
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/sucursales/${editingSucursal.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      resetForm();
      loadSucursales();
      alert('Sucursal actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar sucursal:', error);
      alert('Error al actualizar sucursal');
    }
  };

  const handleDelete = async (sucursalId, sucursalNombre) => {
    if (!confirm(`¿Desactivar la sucursal "${sucursalNombre}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/sucursales/${sucursalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      loadSucursales();
      alert('Sucursal desactivada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.detail || 'Error al desactivar sucursal');
    }
  };

  const handleSave = (e) => {
    if (editingSucursal) {
      handleUpdate(e);
    } else {
      handleCreate(e);
    }
  };

  const resetForm = () => {
    setEditingSucursal(null);
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      activa: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
                <p className="text-sm text-gray-600">Gestión de sucursales y plantas</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nueva Sucursal
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando sucursales...</p>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay sucursales</h3>
            <p className="text-gray-600 mb-6">Crea la primera sucursal</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Crear Sucursal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sucursales.map((sucursal) => (
              <div
                key={sucursal.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  !sucursal.activa ? 'opacity-60 border-2 border-red-200' : ''
                }`}
              >
                {/* Badge Activa/Inactiva */}
                <div className="mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    sucursal.activa 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {sucursal.activa ? '✓ ACTIVA' : '✗ INACTIVA'}
                  </span>
                </div>

                {/* Nombre */}
                <div className="flex items-start gap-3 mb-3">
                  <Building2 className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sucursal.nombre}
                    </h3>
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {sucursal.direccion && (
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{sucursal.direccion}</span>
                    </p>
                  )}
                  {sucursal.ciudad && (
                    <p className="font-medium text-gray-700">
                      📍 {sucursal.ciudad}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(sucursal)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  {sucursal.activa && (
                    <button
                      onClick={() => handleDelete(sucursal.id, sucursal.nombre)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      title="Desactivar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Santiago Centro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej: Av. Principal 123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder="Ej: Santiago"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="activa" className="text-sm font-medium text-gray-700">
                  Sucursal activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSucursal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}