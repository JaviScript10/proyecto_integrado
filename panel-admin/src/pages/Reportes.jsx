import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar, 
  Search, 
  Trash2, 
  ChevronLeft 
} from 'lucide-react';
import api from '../services/api';

export default function Reportes() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({});
  const [entregasPorSucursal, setEntregasPorSucursal] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [entregasPorFecha, setEntregasPorFecha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState([]);
  const [filtroSucursal, setFiltroSucursal] = useState('');
  const [filtroTipoContrato, setFiltroTipoContrato] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resumenRes, sucursalRes, sucursalesRes] = await Promise.all([
        api.get('/reportes/resumen'),
        api.get('/reportes/entregas-por-sucursal'),
        api.get('/sucursales')
      ]);
      setResumen(resumenRes.data);
      setEntregasPorSucursal(sucursalRes.data);
      setSucursales(sucursalesRes.data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      alert('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const buscarPorFecha = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Selecciona ambas fechas');
      return;
    }

    try {
      const params = { 
        fecha_inicio: fechaInicio, 
        fecha_fin: fechaFin 
      };
      
      if (filtroSucursal) params.sucursal_id = filtroSucursal;
      if (filtroTipoContrato) params.tipo_contrato = filtroTipoContrato;
      
      const response = await api.get('/reportes/entregas-por-fecha', { params });
      setEntregasPorFecha(response.data);
      
      if (response.data.length === 0) {
        alert('No se encontraron entregas en este rango');
      }
    } catch (error) {
      console.error('Error buscando por fecha:', error);
      alert('Error al buscar entregas por fecha');
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroSucursal('');
    setFiltroTipoContrato('');
    setEntregasPorFecha([]);
  };

  const exportarExcel = () => {
    if (entregasPorFecha.length === 0) return;

    const headers = ['ID', 'RUT', 'Nombre', 'Apellido', 'Tipo Contrato', 'Sucursal', 'Fecha Retiro'];
    const rows = entregasPorFecha.map(e => [
      e.id,
      e.empleados?.rut || '',
      `"${e.empleados?.nombre || ''}"`, // Comillas para evitar errores con comas
      `"${e.empleados?.apellido || ''}"`,
      e.empleados?.tipo_contrato || '',
      `"${e.empleados?.sucursales?.nombre || ''}"`,
      new Date(e.fecha_retiro || e.fecha_hora).toLocaleString('es-CL')
    ]);

    let csvContent = "\uFEFF"; // BOM para que Excel reconozca tildes
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_entregas_${fechaInicio}_al_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Cargando reportes...</span>
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
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                <p className="text-sm text-gray-600">Estadísticas y análisis del sistema</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate('/empleados')} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Empleados</button>
              <button onClick={() => navigate('/entregas')} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Entregas</button>
              <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Resumen General */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Resumen General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-700 uppercase">Empleados</p>
              <p className="text-4xl font-bold text-gray-900 my-1">{resumen.empleados?.total || 0}</p>
              <div className="flex gap-4 mt-2 text-xs font-bold uppercase">
                <span className="text-green-600">● Activos: {resumen.empleados?.activos || 0}</span>
                <span className="text-red-600">● Inactivos: {resumen.empleados?.inactivos || 0}</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-700 uppercase">Total Entregas</p>
              <p className="text-4xl font-bold text-gray-900 my-1">{resumen.entregas?.total || 0}</p>
              <p className="text-xs text-green-600 font-bold uppercase mt-2">Histórico acumulado</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm font-semibold text-purple-700 uppercase">Sucursales</p>
              <p className="text-4xl font-bold text-gray-900 my-1">{resumen.sucursales || 0}</p>
              <p className="text-xs text-purple-600 font-bold uppercase mt-2">Puntos de distribución</p>
            </div>
          </div>
        </div>

        {/* Entregas por Sucursal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-600" />
            Distribución por Sucursal
          </h2>
          <div className="space-y-5">
            {entregasPorSucursal.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No hay datos disponibles</p>
            ) : (
              entregasPorSucursal.map((item, index) => {
                const maxTotal = Math.max(...entregasPorSucursal.map(i => i.total));
                const porcentaje = (item.total / maxTotal) * 100;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-40 font-semibold text-gray-700 text-sm truncate">{item.sucursal}</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-full h-8 overflow-hidden border border-gray-200">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3 transition-all duration-500 shadow-inner"
                          style={{ width: `${porcentaje}%` }}
                        >
                          <span className="text-white text-xs font-bold">{item.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Filtro por Fecha */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Generador de Reportes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sucursal</label>
              <select
                value={filtroSucursal}
                onChange={(e) => setFiltroSucursal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todas</option>
                {sucursales.map(suc => (
                  <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo Contrato</label>
              <select
                value={filtroTipoContrato}
                onChange={(e) => setFiltroTipoContrato(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="PLANTA">Planta</option>
                <option value="PLAZO_FIJO">Plazo Fijo</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={buscarPorFecha}
                className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 font-bold"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
              <button
                onClick={limpiarFiltros}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition border border-gray-300"
                title="Limpiar filtros"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Exportar Button (Solo si hay datos) */}
          {entregasPorFecha.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={exportarExcel}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-md"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>
            </div>
          )}

          {/* Resultado de búsqueda */}
          {entregasPorFecha.length > 0 && (
            <div className="mt-8">
              <div className="bg-gray-50 border-b p-3 rounded-t-lg">
                <h3 className="font-bold text-gray-700">
                  Resultados: <span className="text-blue-600">{entregasPorFecha.length}</span> entregas encontradas
                </h3>
              </div>
              <div className="overflow-x-auto border rounded-b-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">RUT</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sucursal</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Retiro</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entregasPorFecha.map((entrega) => (
                      <tr key={entrega.id} className="hover:bg-blue-50/50 transition duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{entrega.empleados?.rut}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {entrega.empleados?.nombre} {entrega.empleados?.apellido}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            entrega.empleados?.tipo_contrato === 'PLANTA'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {entrega.empleados?.tipo_contrato}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{entrega.empleados?.sucursales?.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {new Date(entrega.fecha_retiro || entrega.fecha_hora).toLocaleString('es-CL', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}