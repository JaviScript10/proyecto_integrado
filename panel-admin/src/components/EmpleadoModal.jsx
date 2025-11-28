import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EmpleadoModal({ isOpen, onClose, empleado, sucursales, onSave }) {
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo_contrato: 'PLANTA',
    seccion: '',
    sucursal_id: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empleado) {
      // Modo edición
      setFormData({
        rut: empleado.rut || '',
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        email: empleado.email || '',
        telefono: empleado.telefono || '',
        tipo_contrato: empleado.tipo_contrato || 'PLANTA',
        seccion: empleado.seccion || '',
        sucursal_id: empleado.sucursal_id || '',
        activo: empleado.activo !== undefined ? empleado.activo : true,
      });
    } else {
      // Modo nuevo
      setFormData({
        rut: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipo_contrato: 'PLANTA',
        seccion: '',
        sucursal_id: sucursales[0]?.id || '',
        activo: true,
      });
    }
    setErrors({});
  }, [empleado, sucursales, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.rut.trim()) newErrors.rut = 'RUT es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'Apellido es requerido';
    if (!formData.sucursal_id) newErrors.sucursal_id = 'Sucursal es requerida';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData, empleado?.id);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ submit: error.response?.data?.detail || 'Error al guardar empleado' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RUT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12345678-9"
                disabled={!!empleado} // No editable en modo edición
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.rut ? 'border-red-500' : 'border-gray-300'
                } ${empleado ? 'bg-gray-100' : ''}`}
              />
              {errors.rut && <p className="text-red-500 text-sm mt-1">{errors.rut}</p>}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.perez@tresmontes.cl"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56912345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tipo Contrato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Contrato <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_contrato"
                value={formData.tipo_contrato}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PLANTA">Planta</option>
                <option value="PLAZO_FIJO">Plazo Fijo</option>
              </select>
            </div>

            {/* Sección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección
              </label>
              <input
                type="text"
                name="seccion"
                value={formData.seccion}
                onChange={handleChange}
                placeholder="Producción"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursal <span className="text-red-500">*</span>
              </label>
              <select
                name="sucursal_id"
                value={formData.sucursal_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sucursal_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione...</option>
                {sucursales.map((suc) => (
                  <option key={suc.id} value={suc.id}>
                    {suc.nombre}
                  </option>
                ))}
              </select>
              {errors.sucursal_id && (
                <p className="text-red-500 text-sm mt-1">{errors.sucursal_id}</p>
              )}
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
              Empleado activo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : empleado ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}