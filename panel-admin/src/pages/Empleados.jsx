import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { getEmpleados, getSucursales } from '../services/api';
import EmpleadoModal from '../components/EmpleadoModal';
import { createEmpleado, updateEmpleado } from '../services/api';

export default function Empleados() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  try {
    // Traer TODOS sin filtros
    const [empRes, sucRes] = await Promise.all([
      getEmpleados(),
      getSucursales()
    ]);

    console.log('🔍 EMPLEADOS CARGADOS:', empRes.data); 
    console.log('🏢 SUCURSALES CARGADAS:', sucRes.data);

    setEmpleados(empRes.data);
    setSucursales(sucRes.data);
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    setLoading(false);
  }
};

  const handleNuevo = () => {
  setSelectedEmpleado(null);
  setIsModalOpen(true);
};

const handleEditar = (empleado) => {
  setSelectedEmpleado(empleado);
  setIsModalOpen(true);
};

const handleEliminar = async (empleado) => {
  if (!window.confirm(`¿Estás seguro de eliminar a ${empleado.nombre} ${empleado.apellido}?`)) {
    return;
  }

  try {
    await updateEmpleado(empleado.id, { activo: false });
    loadData();
  } catch (error) {
    console.error('Error al eliminar:', error);
    alert('Error al eliminar empleado');
  }
};

const handleSave = async (formData, empleadoId) => {
  console.log('💾 Guardando empleado...', { formData, empleadoId });
  try {
    if (empleadoId) {
      console.log('✏️ Editando empleado', empleadoId);
      await updateEmpleado(empleadoId, formData);
    } else {
      console.log('➕ Creando nuevo empleado');
      await createEmpleado(formData);
    }
    console.log('✅ Guardado exitoso, recargando datos...');
    await loadData();
    console.log('✅ Datos recargados');
  } catch (error) {
    console.error('❌ Error al guardar:', error);
    throw error;
  }
};

const filteredEmpleados = empleados.filter(emp => {
  // Filtro de búsqueda
  const matchSearch = !searchTerm || 
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.rut.includes(searchTerm);

  // Filtro de sucursal - COMPARAR CON NOMBRE DE SUCURSAL
  const matchSucursal = !filterSucursal || (() => {
    const sucursalSeleccionada = sucursales.find(s => s.id.toString() === filterSucursal);
    return sucursalSeleccionada && emp.sucursal === sucursalSeleccionada.nombre;
  })();

  // Filtro de tipo contrato
  const matchTipo = !filterTipo || 
    emp.tipo_contrato === filterTipo;

  return matchSearch && matchSucursal && matchTipo;
});

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
                <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
                <p className="text-sm text-gray-600">Gestión de empleados</p>
              </div>
            </div>
            <button 
  onClick={handleNuevo}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
>
              <Plus size={20} />
              Nuevo Empleado
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, apellido o RUT..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

{/* Filtro Sucursal */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Sucursal
  </label>
  <select
    value={filterSucursal}
    onChange={(e) => {
      console.log('🏢 Filtro sucursal cambiado:', e.target.value);
      setFilterSucursal(e.target.value);
    }}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">Todas</option>
    {sucursales.map(suc => (
      <option key={suc.id} value={suc.id}>{suc.nombre}</option>
    ))}
  </select>
</div>
{/* Filtro Tipo Contrato */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Tipo Contrato
  </label>
  <select
    value={filterTipo}
    onChange={(e) => {
      console.log('📋 Filtro tipo cambiado:', e.target.value);
      setFilterTipo(e.target.value);
    }}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">Todos</option>
    <option value="PLANTA">Planta</option>
    <option value="PLAZO_FIJO">Plazo Fijo</option>
  </select>
</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando empleados...</p>
            </div>
          ) : filteredEmpleados.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No se encontraron empleados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RUT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sucursal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmpleados.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {emp.rut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {emp.nombre} {emp.apellido}
                      </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
  {emp.sucursal || '-'}
</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          emp.tipo_contrato === 'PLANTA' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {emp.tipo_contrato}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emp.seccion || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          emp.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<button 
  onClick={() => handleEditar(emp)}
  className="text-blue-600 hover:text-blue-900 mr-3"
  title="Editar"
>
  <Edit size={18} />
</button>
<button 
  onClick={() => handleEliminar(emp)}
  className="text-red-600 hover:text-red-900"
  title="Eliminar"
>
  <Trash2 size={18} />
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Empleados</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {empleados.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {empleados.filter(e => e.activo).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Inactivos</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {empleados.filter(e => !e.activo).length}
          </p>
        </div>
      </div>

      {/* Modal */}
      <EmpleadoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        empleado={selectedEmpleado}
        sucursales={sucursales}
        onSave={handleSave}
      />
    </main>
  </div>
  );
}