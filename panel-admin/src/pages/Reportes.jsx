import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, Download, Calendar } from 'lucide-react';
import api from '../services/api';

export default function Reportes() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({});
  const [entregasPorSucursal, setEntregasPorSucursal] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [entregasPorFecha, setEntregasPorFecha] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [resumenRes, sucursalRes] = await Promise.all([
        api.get('/reportes/resumen'),
        api.get('/reportes/entregas-por-sucursal')
      ]);
      setResumen(resumenRes.data);
      setEntregasPorSucursal(sucursalRes.data);
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
      const response = await api.get('/reportes/entregas-por-fecha', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });
      setEntregasPorFecha(response.data);
    } catch (error) {
      console.error('Error buscando por fecha:', error);
      alert('Error al buscar entregas por fecha');
    }
  };

const exportarExcel = () => {
  // Convertir datos a CSV
  const headers = ['ID', 'RUT', 'Nombre', 'Apellido', 'Tipo Contrato', 'Sucursal', 'Fecha Retiro'];
  const rows = entregasPorFecha.map(e => [
    e.id,
    e.empleados?.rut || '',
    e.empleados?.nombre || '',
    e.empleados?.apellido || '',
    e.empleados?.tipo_contrato || '',
    e.empleados?.sucursales?.nombre || '',
    new Date(e.fecha_retiro || e.fecha_hora).toLocaleString('es-CL')
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `reporte_entregas_${fechaInicio}_${fechaFin}.csv`;
  link.click();
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando reportes...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
              <p className="text-sm text-gray-600">Estadísticas y análisis</p>
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
              onClick={() => navigate('/entregas')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Entregas
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
        {/* Resumen General */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Resumen General del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Total Empleados</p>
              <p className="text-3xl font-bold text-gray-900">{resumen.empleados?.total || 0}</p>
              <p className="text-sm text-green-600">
                Activos: {resumen.empleados?.activos || 0}
              </p>
              <p className="text-sm text-red-600">
                Inactivos: {resumen.empleados?.inactivos || 0}
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Total Entregas</p>
              <p className="text-3xl font-bold text-gray-900">{resumen.entregas?.total || 0}</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">Sucursales Activas</p>
              <p className="text-3xl font-bold text-gray-900">{resumen.sucursales || 0}</p>
            </div>
          </div>
        </div>

        {/* Entregas por Sucursal */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            Entregas por Sucursal
          </h2>
          <div className="space-y-4">
            {entregasPorSucursal.length === 0 ? (
              <p className="text-gray-500">No hay datos disponibles</p>
            ) : (
              entregasPorSucursal.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 font-medium text-gray-700">{item.sucursal}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end pr-2"
                        style={{
                          width: `${(item.total / Math.max(...entregasPorSucursal.map(i => i.total))) * 100}%`
                        }}
                      >
                        <span className="text-white text-sm font-semibold">{item.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Filtro por Fecha */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Reporte por Rango de Fechas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={buscarPorFecha}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Buscar
              </button>
              {entregasPorFecha.length > 0 && (
                <button
                  onClick={exportarExcel}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              )}
            </div>
          </div>

          {/* Resultado de búsqueda */}
          {entregasPorFecha.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Resultados: {entregasPorFecha.length} entregas encontradas
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entregasPorFecha.map((entrega) => (
                      <tr key={entrega.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{entrega.empleados?.rut}</td>
                        <td className="px-4 py-2 text-sm">
                          {entrega.empleados?.nombre} {entrega.empleados?.apellido}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entrega.empleados?.tipo_contrato === 'PLANTA'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {entrega.empleados?.tipo_contrato}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{entrega.empleados?.sucursales?.nombre}</td>
                        <td className="px-4 py-2 text-sm">
                          {new Date(entrega.fecha_retiro || entrega.fecha_hora).toLocaleString('es-CL')}
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
