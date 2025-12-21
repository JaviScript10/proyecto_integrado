import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  LogOut,
  Settings,
  FileDown,
  Calendar,
  Building2 // ← Agregado
} from 'lucide-react';

import {
  getEstadisticasDashboard,
  descargarReportePendientes
} from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_empleados: 0,
    entregas_realizadas: 0,
    pendientes: 0,
    porcentaje: 0,
    periodo_activo: null
  });
  const [loading, setLoading] = useState(true);

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getEstadisticasDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Descargar reporte de pendientes
  const handleDescargarPendientes = async () => {
    try {
      const response = await descargarReportePendientes();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fecha = new Date().toISOString().split('T')[0];
      link.download = `empleados_pendientes_${fecha}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRolDisplay = (rol) => {
    const roles = {
      superadmin: 'Superadmin',
      admin: 'Administrador',
      rh: 'Recursos Humanos',
      guardia: 'Guardia'
    };
    return roles[rol?.toLowerCase()] || 'Usuario';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ClipControl</h1>
              <p className="text-sm text-gray-600">Panel de Gestión de Beneficios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-r pr-4 border-gray-200">
              <p className="text-sm font-bold text-gray-900">
                {user.nombre_completo || user.nombre}
              </p>
              <p className="text-xs text-blue-600 font-semibold uppercase">{getRolDisplay(user.rol)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Cerrar sesión"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Bienvenida y Período */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Hola, {user.nombre?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-500 mt-1">
                Bienvenido al sistema de control de Tresmontes Lucchetti.
              </p>
            </div>
            
            {stats.periodo_activo && (
              <div className="mt-4 md:mt-0 flex items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <div className="mr-4 bg-blue-500 p-2 rounded-lg text-white">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Período Vigente</p>
                  <p className="text-lg font-bold text-gray-900">{stats.periodo_activo.nombre}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicadores Clave (Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Empleados', value: stats.total_empleados, color: 'text-blue-600', icon: Users },
            { label: 'Entregas Realizadas', value: stats.entregas_realizadas, color: 'text-green-600', icon: Package },
            { label: 'Avance del Período', value: `${stats.porcentaje}%`, color: 'text-purple-600', icon: TrendingUp },
            { label: 'Retiros Pendientes', value: stats.pendientes, color: 'text-red-600', icon: FileDown },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    {loading ? <span className="animate-pulse">...</span> : stat.value}
                  </p>
                </div>
                <stat.icon className={`${stat.color} opacity-20`} size={40} />
              </div>
            </div>
          ))}
        </div>

        {/* Módulos de Navegación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Settings className="text-gray-400" size={20} />
            Módulos del Sistema
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empleados */}
            <button
              onClick={() => navigate('/empleados')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Empleados</h4>
              <p className="text-sm text-gray-500 mt-2">Gestionar base de datos, nóminas y contratos.</p>
            </button>

            {/* Entregas */}
            <button
              onClick={() => navigate('/entregas')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <div className="bg-green-100 text-green-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Package size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Entregas</h4>
              <p className="text-sm text-gray-500 mt-2">Registro y monitoreo de beneficios entregados.</p>
            </button>

            {/* Reportes */}
            <button
              onClick={() => navigate('/reportes')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left"
            >
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                <TrendingUp size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Reportes</h4>
              <p className="text-sm text-gray-500 mt-2">Estadísticas detalladas y exportación de datos.</p>
            </button>

            {/* Usuarios */}
            <button
              onClick={() => navigate('/usuarios')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Settings size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Usuarios</h4>
              <p className="text-sm text-gray-500 mt-2">Configurar accesos y permisos del sistema.</p>
            </button>

            {/* Períodos */}
            <button
              onClick={() => navigate('/periodos')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Calendar size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Períodos</h4>
              <p className="text-sm text-gray-500 mt-2">Definir fechas de inicio y fin de beneficios.</p>
            </button>

            {/* Sucursales - NUEVO */}
            <button
              onClick={() => navigate('/sucursales')}
              className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
            >
              <div className="bg-orange-100 text-orange-600 p-3 rounded-xl w-fit mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Building2 size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Sucursales</h4>
              <p className="text-sm text-gray-500 mt-2">Gestionar plantas y puntos de distribución.</p>
            </button>
          </div>
        </div>

{/* Alerta de Pendientes - Estilo Suave y Elegante */}
{!loading && stats.pendientes > 0 && (
  <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Información Minimalista */}
      <div className="flex items-center gap-4">
        <div className="bg-red-100 p-2 rounded-full">
          <FileDown className="text-red-600" size={24} />
        </div>
        <div>
          <h3 className="text-red-900 font-bold text-lg leading-none">
            {stats.pendientes} Pendientes
          </h3>
          <p className="text-red-700 text-sm mt-1">
            Colaboradores sin retirar beneficio.
          </p>
        </div>
      </div>

      {/* Botón Principal - Destacado pero equilibrado */}
      <button
        onClick={handleDescargarPendientes}
        className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl transition-all font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 group"
      >
        <FileDown size={22} className="group-hover:bounce" />
        Descargar Reporte
      </button>

    </div>
  </div>
)}
      </main>
    </div>
  );
}