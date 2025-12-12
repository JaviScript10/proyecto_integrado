import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, User, FileText, Copy, Edit, X, Eye, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Entregas() {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [fotoModal, setFotoModal] = useState(null);
  const [tokenModal, setTokenModal] = useState(null);

  // NUEVOS estados para edición
  const [entregaEditar, setEntregaEditar] = useState(null);
  const [observacionesEdit, setObservacionesEdit] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [entregasRes, statsRes] = await Promise.all([
        api.get('/entregas/lista'),
        api.get('/entregas/estadisticas')
      ]);
      setEntregas(entregasRes.data);
      setEstadisticas(statsRes.data);
    } catch (error) {
      console.error('Error cargando entregas:', error);
      alert('Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorFecha = () => {
    if (!filtroFecha) {
      cargarDatos();
      return;
    }
    const filtradas = entregas.filter(e => {
      const fecha = e.fecha_retiro || e.fecha_hora;
      return fecha?.startsWith(filtroFecha);
    });
    setEntregas(filtradas);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copiarToken = (token) => {
    navigator.clipboard.writeText(token);
    alert('Token copiado al portapapeles');
  };

  const verFoto = (entrega) => {
    setFotoModal(entrega);
  };

  const cerrarFotoModal = () => {
    setFotoModal(null);
  };

  // FUNCIONES PARA EDITAR Y CANCELAR
  const abrirEditar = (entrega) => {
    setEntregaEditar(entrega);
    setObservacionesEdit(entrega.observaciones || '');
  };

  const cerrarEditar = () => {
    setEntregaEditar(null);
    setObservacionesEdit('');
  };

  const guardarEdicion = async () => {
    if (!entregaEditar) return;

    try {
      await fetch(`http://localhost:8000/api/entregas/${entregaEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          observaciones: observacionesEdit
        })
      });

      alert('Entrega actualizada correctamente');
      cerrarEditar();
      cargarDatos();
    } catch (error) {
      console.error('Error al editar:', error);
      alert('Error al actualizar entrega');
    }
  };

  const cancelarEntrega = async (entrega) => {
    if (!window.confirm('¿Estás seguro de cancelar esta entrega? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await fetch(`http://localhost:8000/api/entregas/${entrega.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert('Entrega cancelada correctamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert('Error al cancelar entrega');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
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
                <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
                <p className="text-sm text-gray-600">Gestión de entregas de beneficios</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/empleados')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Empleados
              </button>
              <button
                onClick={() => navigate('/reportes')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Reportes
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entregas</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total || 0}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoy</p>
                <p className="text-3xl font-bold text-green-600">{estadisticas.hoy || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planta</p>
                <p className="text-3xl font-bold text-purple-600">{estadisticas.planta || 0}</p>
              </div>
              <User className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plazo Fijo</p>
                <p className="text-3xl font-bold text-orange-600">{estadisticas.plazo_fijo || 0}</p>
              </div>
              <FileText className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por fecha
              </label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={filtrarPorFecha}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Filtrar
            </button>
            <button
              onClick={() => { setFiltroFecha(''); cargarDatos(); }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de Entregas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Retiro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guardia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entregas.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                      No hay entregas registradas
                    </td>
                  </tr>
                ) : (
                  entregas.map((entrega) => (
                    <tr key={entrega.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{entrega.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entrega.empleados?.rut || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entrega.empleados ? `${entrega.empleados.nombre} ${entrega.empleados.apellido}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entrega.empleados?.tipo_contrato === 'PLANTA'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'}`}>
                          {entrega.empleados?.tipo_contrato || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatearFecha(entrega.fecha_retiro || entrega.fecha_hora)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entrega.guardia || entrega.usuarios?.nombre_completo || 'N/A'}</td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entrega.foto_entrega ? (
                          <button onClick={() => verFoto(entrega)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                            <Eye className="w-4 h-4" /> Ver
                          </button>
                        ) : <span className="text-gray-400 text-xs">Sin foto</span>}
                      </td>
                      
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirEditar(entrega)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            title="Editar observaciones"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelarEntrega(entrega)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Cancelar entrega"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{entrega.observaciones || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Total de entregas: {entregas.length}
        </div>
      </div>

      {/* Modal Foto */}
      {fotoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={cerrarFotoModal}
        >
          <div className="bg-white rounded-lg max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-semibold text-sm">Foto de Entrega</h3>
                <p className="text-xs text-gray-600">
                  {fotoModal.empleados?.nombre} {fotoModal.empleados?.apellido} - RUT: {fotoModal.empleados?.rut}
                </p>
              </div>
              <button onClick={cerrarFotoModal} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen */}
            <div className="p-4 flex justify-center bg-gray-100">
              <img src={fotoModal.foto_entrega} alt="Foto de entrega" className="w-64 h-auto rounded shadow-lg object-contain" />
            </div>

            {/* Info */}
            <div className="p-4 bg-white space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{formatearFecha(fotoModal.fecha_retiro)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guardia:</span>
                <span className="font-medium">{fotoModal.guardia}</span>
              </div>
              {fotoModal.observaciones && (
                <div className="pt-2 border-t">
                  <span className="text-gray-600 block mb-1">Observaciones:</span>
                  <p className="text-gray-800">{fotoModal.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Entrega */}
      {entregaEditar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cerrarEditar}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Editar Observaciones</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              rows="4"
              value={observacionesEdit}
              onChange={(e) => setObservacionesEdit(e.target.value)}
              placeholder="Agregar o editar observaciones..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={cerrarEditar} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={guardarEdicion} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
