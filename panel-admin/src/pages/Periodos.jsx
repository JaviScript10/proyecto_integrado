import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, ArrowLeft, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function Periodos() {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [editingPeriodo, setEditingPeriodo] = useState(null);

  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/periodos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeriodos(response.data);
    } catch (error) {
      console.error('Error al cargar períodos:', error);
    } finally {
      setLoading(false);
    }
  };

const handleCreate = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/periodos`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setShowModal(false);
    setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    
    alert('Período creado y activado correctamente. Las estadísticas se han reiniciado.');
    
    // Redirigir al dashboard para que recargue todo
    navigate('/dashboard');
  } catch (error) {
    console.error('Error al crear período:', error);
    alert('Error al crear período');
  }
};

  const handleEdit = (periodo) => {
    setEditingPeriodo(periodo);
    setFormData({
      nombre: periodo.nombre,
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/periodos/${editingPeriodo.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowModal(false);
      setEditingPeriodo(null);
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      loadPeriodos();
      alert('Período actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar período:', error);
      alert('Error al actualizar período');
    }
  };

  const handleDelete = async (periodoId, periodoNombre) => {
    if (!confirm(`¿Eliminar el período "${periodoNombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/periodos/${periodoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      loadPeriodos();
      alert('Período eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.detail || 'Error al eliminar período');
    }
  };

  const handleSave = (e) => {
    if (editingPeriodo) {
      handleUpdate(e);
    } else {
      handleCreate(e);
    }
  };

const handleActivar = async (periodoId) => {
  if (!confirm('¿Activar este período? Se desactivará el período actual y se actualizarán todas las estadísticas.')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/periodos/${periodoId}/activar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    alert('Período activado correctamente. Las estadísticas se actualizarán.');
    
    // Redirigir al dashboard para que recargue todo
    navigate('/dashboard');
  } catch (error) {
    console.error('Error al activar período:', error);
    alert('Error al activar período');
  }
};

const handleCerrar = async (periodoId) => {
  if (!confirm('¿Cerrar este período? Ya no se podrán registrar entregas.')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/periodos/${periodoId}/cerrar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    loadPeriodos();
    alert('Período cerrado correctamente');
  } catch (error) {
    console.error('Error al cerrar período:', error);
    alert('Error al cerrar período');
  }
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
                <h1 className="text-2xl font-bold text-gray-900">Períodos de Entrega</h1>
                <p className="text-sm text-gray-600">Gestión de períodos de beneficios</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Período
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando períodos...</p>
          </div>
        ) : periodos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay períodos</h3>
            <p className="text-gray-600 mb-6">Crea el primer período de entrega</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Crear Período
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {periodos.map((periodo) => (
              <div
                key={periodo.id}
                className={`bg-white rounded-lg shadow p-6 ${periodo.activo ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* Badge Activo */}
                {periodo.activo && (
                  <div className="mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      ✓ ACTIVO
                    </span>
                  </div>
                )}

                {/* Nombre */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{periodo.nombre}</h3>

                {/* Fechas */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Inicio:</strong> {new Date(periodo.fecha_inicio).toLocaleDateString('es-CL')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Fin:</strong> {new Date(periodo.fecha_fin).toLocaleDateString('es-CL')}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  {!periodo.activo ? (
                    <>
                      <button
                        onClick={() => handleActivar(periodo.id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle size={16} />
                        Activar
                      </button>
                      <button
                        onClick={() => handleEdit(periodo)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(periodo.id, periodo.nombre)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleCerrar(periodo.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear/Editar Período */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPeriodo ? 'Editar Período' : 'Crear Nuevo Período'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Período</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Enero 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPeriodo(null);
                    setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPeriodo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
