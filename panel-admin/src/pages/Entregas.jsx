import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, User, FileText, Copy, Edit, X, Eye, Trash2, Clock } from 'lucide-react';
import api from '../services/api';

export default function Entregas() {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [fotoModal, setFotoModal] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [filtroSucursal, setFiltroSucursal] = useState('');
  const [filtroTipoContrato, setFiltroTipoContrato] = useState('');

  // Estados para edición
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
      const [entregasRes, statsRes, dashboardRes, sucursalesRes] = await Promise.all([
        api.get('/entregas/lista'),
        api.get('/entregas/estadisticas'),
        api.get('/estadisticas/dashboard'),
        api.get('/sucursales')
      ]);
      
      setEntregas(entregasRes.data);
      setEstadisticas(statsRes.data);
      setSucursales(sucursalesRes.data);
      
      if (dashboardRes.data.periodo_activo) {
        setPeriodoActivo(dashboardRes.data.periodo_activo);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar la información de entregas');
    } finally {
      setLoading(false);
    }
  };

const aplicarFiltros = async () => {
  try {
    const params = {};
    
    if (filtroFechaDesde) {
      params.fecha_desde = filtroFechaDesde;
    }
    if (filtroFechaHasta) {
      params.fecha_hasta = filtroFechaHasta;
    }
    if (filtroSucursal) {
      params.sucursal_id = filtroSucursal;
    }
    if (filtroTipoContrato) {
      params.tipo_contrato = filtroTipoContrato;
    }
    
    // Si no hay filtros, recargar todo
    if (Object.keys(params).length === 0) {
      cargarDatos();
      return;
    }
    
    const response = await api.get('/entregas/lista', { params });
    setEntregas(response.data);
  } catch (error) {
    console.error('Error al filtrar:', error);
    alert('Error al aplicar filtros');
  }
};

const limpiarFiltros = () => {
  setFiltroFechaDesde('');
  setFiltroFechaHasta('');
  setFiltroSucursal('');
  setFiltroTipoContrato('');
  cargarDatos();
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

  const verFoto = (entrega) => setFotoModal(entrega);
  const cerrarFotoModal = () => setFotoModal(null);

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
      await api.put(`/entregas/${entregaEditar.id}`, {
        observaciones: observacionesEdit
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
    if (!window.confirm('¿Estás seguro de cancelar esta entrega? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/entregas/${entrega.id}`);
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
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-xl font-medium text-gray-600">Cargando entregas...</div>
        </div>
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
              <button onClick={() => navigate('/empleados')} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Empleados</button>
              <button onClick={() => navigate('/reportes')} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Reportes</button>
              <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Banner Período Activo Mejorado */}
        {periodoActivo && (
          <div className="mb-8 p-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg border border-emerald-400/20">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Período de Entrega Activo</p>
                  <h2 className="text-2xl font-black mt-0.5">{periodoActivo.nombre}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 
                      {new Date(periodoActivo.fecha_inicio).toLocaleDateString('es-CL')} 
                    </span>
                    <span>al</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(periodoActivo.fecha_fin).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">SISTEMA ACTIVO</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Personal activo</p>
              </div>
              <Package className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Hoy</p>
                <p className="text-3xl font-bold text-green-600">{estadisticas.hoy || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Planta</p>
                <p className="text-3xl font-bold text-purple-600">{estadisticas.planta || 0}</p>
              </div>
              <User className="w-10 h-10 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Plazo Fijo</p>
                <p className="text-3xl font-bold text-orange-600">{estadisticas.plazo_fijo || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-orange-500 opacity-80" />
            </div>
          </div>
        </div>

{/* Filtros */}
<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    {/* Filtro Fecha Desde */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Fecha Desde
      </label>
      <input
        type="date"
        value={filtroFechaDesde}
        onChange={(e) => setFiltroFechaDesde(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
      />
    </div>

    {/* Filtro Fecha Hasta */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Fecha Hasta
      </label>
      <input
        type="date"
        value={filtroFechaHasta}
        onChange={(e) => setFiltroFechaHasta(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
      />
    </div>

    {/* Filtro Sucursal */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Sucursal
      </label>
      <select
        value={filtroSucursal}
        onChange={(e) => setFiltroSucursal(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
      >
        <option value="">Todas</option>
        {sucursales.map(suc => (
          <option key={suc.id} value={suc.id}>{suc.nombre}</option>
        ))}
      </select>
    </div>

    {/* Filtro Tipo Contrato */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Tipo Contrato
      </label>
      <select
        value={filtroTipoContrato}
        onChange={(e) => setFiltroTipoContrato(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
      >
        <option value="">Todos</option>
        <option value="PLANTA">Planta</option>
        <option value="PLAZO_FIJO">Plazo Fijo</option>
      </select>
    </div>

    {/* Botones */}
    <div className="flex flex-col gap-2 justify-end">
      <button
        onClick={aplicarFiltros}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        🔍 Filtrar
      </button>
      <button
        onClick={limpiarFiltros}
        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
      >
        🗑️ Limpiar
      </button>
    </div>
  </div>
</div>

        {/* Tabla de Entregas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">RUT</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sucursal</th> 
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Retiro</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guardia</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Obs.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entregas.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-10 text-center text-gray-500 font-medium">
                      No se encontraron entregas registradas
                    </td>
                  </tr>
                ) : (
                    entregas.map((entrega) => (
                      <tr key={entrega.id} className="hover:bg-blue-50/30 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{entrega.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{entrega.empleados?.rut || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {entrega.empleados ? `${entrega.empleados.nombre} ${entrega.empleados.apellido}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {entrega.empleados?.sucursales?.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${entrega.empleados?.tipo_contrato === 'PLANTA'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'}`}>
                            {entrega.empleados?.tipo_contrato || 'N/A'}
                          </span>
                        </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatearFecha(entrega.fecha_retiro || entrega.fecha_hora)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{entrega.guardia || entrega.usuarios?.nombre_completo || 'N/A'}</td>

                      <td className="px-6 py-4 text-sm">
                        {entrega.foto_entrega ? (
                          <button onClick={() => verFoto(entrega)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition shadow-sm">
                            <Eye className="w-3.5 h-3.5" /> Ver
                          </button>
                        ) : <span className="text-gray-400 text-xs italic">Sin foto</span>}
                      </td>
                      
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirEditar(entrega)}
                            className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition shadow-sm"
                            title="Editar observaciones"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelarEntrega(entrega)}
                            className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition shadow-sm"
                            title="Cancelar entrega"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-[120px] truncate" title={entrega.observaciones}>
                        {entrega.observaciones || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm font-medium text-gray-500">
          <span>Mostrando {entregas.length} registros</span>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-xs">Sistema de Control v2.1</span>
        </div>
      </div>

      {/* Modal Foto */}
      {fotoModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cerrarFotoModal}
        >
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Evidencia de Entrega</h3>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {fotoModal.empleados?.nombre} {fotoModal.empleados?.apellido} • RUT: {fotoModal.empleados?.rut}
                </p>
              </div>
              <button onClick={cerrarFotoModal} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 flex justify-center bg-gray-200/50">
              <img src={fotoModal.foto_entrega} alt="Foto de entrega" className="max-h-[400px] w-auto rounded-lg shadow-md object-contain border-4 border-white" />
            </div>

            <div className="p-5 bg-white space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block text-xs font-bold uppercase">Fecha y Hora</span>
                  <span className="font-semibold text-gray-800">{formatearFecha(fotoModal.fecha_retiro)}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block text-xs font-bold uppercase">Guardia Responsable</span>
                  <span className="font-semibold text-gray-800">{fotoModal.guardia}</span>
                </div>
              </div>
              {fotoModal.observaciones && (
                <div className="pt-2">
                  <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Observaciones de Entrega</span>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100 leading-relaxed">{fotoModal.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Entrega */}
      {entregaEditar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cerrarEditar}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Edit className="w-5 h-5" />
              <h3 className="text-xl font-bold">Editar Observaciones</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-medium">
              Entrega #{entregaEditar.id} - {entregaEditar.empleados?.nombre} {entregaEditar.empleados?.apellido}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              rows="4"
              value={observacionesEdit}
              onChange={(e) => setObservacionesEdit(e.target.value)}
              placeholder="Describa cualquier novedad en la entrega..."
            />
            <div className="flex justify-end gap-3 font-semibold">
              <button onClick={cerrarEditar} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                Cancelar
              </button>
              <button onClick={guardarEdicion} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 