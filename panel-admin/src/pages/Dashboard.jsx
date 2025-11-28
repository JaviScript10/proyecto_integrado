import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, TrendingUp, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    // Verificar si está autenticado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ClipControl</h1>
            <p className="text-sm text-gray-600">Panel de Administración</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.nombre_completo}</p>
              <p className="text-xs text-gray-500 capitalize">{user.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            ¡Bienvenido, {user.nombre_completo}!
          </h2>
          <p className="text-gray-600">
            Sistema de gestión de entrega de beneficios - Tresmontes Lucchetti
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">250</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregas Hoy</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">45</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Porcentaje</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">68%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">80</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <LayoutDashboard className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Módulos Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
  onClick={() => navigate('/empleados')}
  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
>
  <Users className="text-blue-600 mb-2" size={32} />
  <h4 className="font-semibold text-gray-900">Empleados</h4>
  <p className="text-sm text-gray-600 mt-1">Gestionar empleados y nómina</p>
</button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
              <Package className="text-green-600 mb-2" size={32} />
              <h4 className="font-semibold text-gray-900">Entregas</h4>
              <p className="text-sm text-gray-600 mt-1">Ver entregas en tiempo real</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
              <TrendingUp className="text-yellow-600 mb-2" size={32} />
              <h4 className="font-semibold text-gray-900">Reportes</h4>
              <p className="text-sm text-gray-600 mt-1">Estadísticas y exportar datos</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}