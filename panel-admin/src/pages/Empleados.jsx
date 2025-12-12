import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, ArrowLeft, QrCode, Eye } from 'lucide-react';
import { getEmpleados, getSucursales } from '../services/api';
import EmpleadoModal from '../components/EmpleadoModal';
import ModalGenerarQR from '../components/ModalGenerarQR';
import { createEmpleado, updateEmpleado } from '../services/api';
import ModalGenerarMasivo from "../components/ModalGenerarMasivo";

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

  // ⭐ NUEVO: Modal detalles
  const [empleadoDetalles, setEmpleadoDetalles] = useState(null);

  // QR Individual
  const [empleadoQR, setEmpleadoQR] = useState(null);

  // QR Masivo
  const [mostrarMasivoQR, setMostrarMasivoQR] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, sucRes] = await Promise.all([getEmpleados(), getSucursales()]);
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

  const handleVerDetalles = (empleado) => {
    setEmpleadoDetalles(empleado);
  };

  const handleSave = async (formData, empleadoId) => {
    try {
      if (empleadoId) {
        await updateEmpleado(empleadoId, formData);
      } else {
        await createEmpleado(formData);
      }
      await loadData();
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      throw error;
    }
  };

  const filteredEmpleados = empleados.filter(emp => {
    const matchSearch = !searchTerm ||
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rut.includes(searchTerm);

    const matchSucursal = !filterSucursal || (() => {
      const suc = sucursales.find(s => s.id.toString() === filterSucursal);
      return suc && emp.sucursal === suc.nombre;
    })();

    const matchTipo = !filterTipo || emp.tipo_contrato === filterTipo;

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

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarMasivoQR(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <QrCode size={20} />
                Generar QR Masivo
              </button>

              <button
                onClick={handleNuevo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Nuevo Empleado
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 📊 ESTADÍSTICAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900">{empleados.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {empleados.filter(e => e.activo).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-3xl font-bold text-red-600">
                  {empleados.filter(e => !e.activo).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Users className="text-red-600" size={24} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Buscar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
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

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
              <select
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Contrato</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="PLANTA">Planta</option>
                <option value="PLAZO_FIJO">Plazo Fijo</option>
              </select>
            </div>

          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando empleados...</p>
            </div>
          ) : filteredEmpleados.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No se encontraron empleados</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Contrato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sección</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmpleados.map(empleado => (
                    <tr key={empleado.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{empleado.rut}</td>
                      <td className="px-6 py-4">{empleado.nombre} {empleado.apellido}</td>
                      <td className="px-6 py-4">{empleado.sucursal || '-'}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          empleado.tipo_contrato === "PLANTA"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {empleado.tipo_contrato}
                        </span>
                      </td>

                      <td className="px-6 py-4">{empleado.seccion || '-'}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          empleado.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {empleado.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right flex justify-end gap-3">

                        {/* VER DETALLES */}
                        <button
                          onClick={() => handleVerDetalles(empleado)}
                          className="text-green-600 hover:text-green-900"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={() => handleEditar(empleado)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>

                        {/* ELIMINAR */}
                        <button
                          onClick={() => handleEliminar(empleado)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>

                        {/* QR */}
                        <button
                          onClick={() => setEmpleadoQR(empleado)}
                          className="text-green-600 hover:text-green-900"
                          title="Generar QR"
                        >
                          <QrCode size={18} />
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        {/* MODAL CREAR/EDITAR */}
        <EmpleadoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          empleado={selectedEmpleado}
          sucursales={sucursales}
          onSave={handleSave}
        />

        {/* MODAL QR INDIVIDUAL */}
        {empleadoQR && (
          <ModalGenerarQR empleado={empleadoQR} onClose={() => setEmpleadoQR(null)} />
        )}

        {/* MODAL QR MASIVO */}
        {mostrarMasivoQR && (
          <ModalGenerarMasivo
            empleados={empleados}
            sucursales={sucursales}
            onClose={() => setMostrarMasivoQR(false)}
          />
        )}

        {/* MODAL DETALLES */}
        {empleadoDetalles && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Empleado</h2>
                <button
                  onClick={() => setEmpleadoDetalles(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm text-gray-700">RUT</label>
                    <p className="font-semibold">{empleadoDetalles.rut}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Nombre Completo</label>
                    <p className="font-semibold">{empleadoDetalles.nombre} {empleadoDetalles.apellido}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Email</label>
                    <p>{empleadoDetalles.email || "No registrado"}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Teléfono</label>
                    <p>{empleadoDetalles.telefono || "No registrado"}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Tipo Contrato</label>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      empleadoDetalles.tipo_contrato === "PLANTA"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {empleadoDetalles.tipo_contrato}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Sección</label>
                    <p>{empleadoDetalles.seccion || "No especificada"}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Sucursal</label>
                    <p>{empleadoDetalles.sucursal}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Estado</label>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      empleadoDetalles.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {empleadoDetalles.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setEmpleadoDetalles(null)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
