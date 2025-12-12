import { useState, useEffect } from 'react';
import { QrCode, Download, X, Users, CheckSquare, Filter } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

export default function ModalGenerarMasivo({ empleados, sucursales, onClose }) {
  const [modo, setModo] = useState('todos'); // 'todos', 'filtrados', 'seleccionados'
  const [filtros, setFiltros] = useState({
    sucursal_id: '',
    tipo_contrato: ''
  });
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [duracion, setDuracion] = useState(60);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // ⭐ NUEVO ESTADO PARA BUSCAR EMPLEADOS EN SELECCIÓN MANUAL
  const [busquedaManual, setBusquedaManual] = useState('');

  const toggleEmpleado = (empleadoId) => {
    if (empleadosSeleccionados.includes(empleadoId)) {
      setEmpleadosSeleccionados(empleadosSeleccionados.filter(id => id !== empleadoId));
    } else {
      setEmpleadosSeleccionados([...empleadosSeleccionados, empleadoId]);
    }
  };

  const seleccionarTodos = () => {
    const empleadosFiltrados = getEmpleadosFiltrados();
    setEmpleadosSeleccionados(empleadosFiltrados.map(e => e.id));
  };

  const deseleccionarTodos = () => {
    setEmpleadosSeleccionados([]);
  };

  const getEmpleadosFiltrados = () => {
    let filtrados = empleados.filter(e => e.activo);

    if (filtros.sucursal_id) {
      filtrados = filtrados.filter(e => e.sucursal_id === parseInt(filtros.sucursal_id));
    }

    if (filtros.tipo_contrato) {
      filtrados = filtrados.filter(e => e.tipo_contrato === filtros.tipo_contrato);
    }

    return filtrados;
  };

  const generarQRMasivo = async () => {
    try {
      setGenerando(true);

      let url = `http://localhost:8000/api/qr/generar-masivo?duracion_minutos=${duracion}`;

      if (modo === 'filtrados') {
        if (filtros.sucursal_id) url += `&sucursal_id=${filtros.sucursal_id}`;
        if (filtros.tipo_contrato) url += `&tipo_contrato=${filtros.tipo_contrato}`;
      }

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (modo === 'seleccionados' && empleadosSeleccionados.length > 0) {
        requestOptions.body = JSON.stringify({
          empleados_ids: empleadosSeleccionados
        });
      } else {
        requestOptions.body = JSON.stringify({});
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al generar QR masivos');
      }

      const data = await response.json();
      setResultado(data);

    } catch (error) {
      alert(`Error al generar QR masivos: ${error.message}`);
    } finally {
      setGenerando(false);
    }
  };

  const descargarTodosZIP = async () => {
    if (!resultado || !resultado.qr_data) return;

    try {
      const zip = new JSZip();
      const qrFolder = zip.folder('QR_Empleados');

      for (const qr of resultado.qr_data) {
        const qrImageUrl = await QRCode.toDataURL(qr.qr_string, {
          width: 400,
          margin: 2
        });

        const base64Data = qrImageUrl.split(',')[1];
        qrFolder.file(`${qr.rut}_${qr.nombre.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `QR_Empleados_${new Date().toISOString().split('T')[0]}.zip`);

    } catch (error) {
      alert('Error al crear archivo ZIP');
    }
  };

  const empleadosMostrar = modo === 'seleccionados' ? empleados : getEmpleadosFiltrados();
  const cantidadAGenerar = modo === 'seleccionados' ? empleadosSeleccionados.length : empleadosMostrar.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generación Masiva de QR</h3>
              <p className="text-sm text-gray-600">
                {cantidadAGenerar} empleado{cantidadAGenerar !== 1 ? 's' : ''} seleccionado{cantidadAGenerar !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {!resultado ? (
          <div className="p-6 space-y-6">

            {/* Selector de Modo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Generación</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setModo('todos')}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition ${modo === 'todos'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Todos los Activos
                </button>

                <button
                  onClick={() => setModo('filtrados')}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition ${modo === 'filtrados'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Con Filtros
                </button>

                <button
                  onClick={() => setModo('seleccionados')}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition ${modo === 'seleccionados'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Selección Manual
                </button>
              </div>
            </div>

            {/* Filtros */}
            {modo === 'filtrados' && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Filter size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtros</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sucursal</label>
                    <select
                      value={filtros.sucursal_id}
                      onChange={(e) => setFiltros({ ...filtros, sucursal_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Todas</option>
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                    <select
                      value={filtros.tipo_contrato}
                      onChange={(e) => setFiltros({ ...filtros, tipo_contrato: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Todos</option>
                      <option value="PLANTA">Planta</option>
                      <option value="PLAZO_FIJO">Plazo Fijo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SELECCIÓN MANUAL */}
            {modo === 'seleccionados' && (
              <div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Seleccionar Empleados ({empleadosSeleccionados.length})
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={seleccionarTodos}
                      className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Todos
                    </button>

                    <button
                      onClick={deseleccionarTodos}
                      className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {/* ⭐ INPUT DE BÚSQUEDA */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o RUT..."
                    value={busquedaManual}
                    onChange={(e) => setBusquedaManual(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* LISTA FILTRADA */}
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {empleados
                    .filter(e => e.activo)
                    .filter(e => {
                      if (!busquedaManual) return true;
                      const busqueda = busquedaManual.toLowerCase();
                      return (
                        e.nombre.toLowerCase().includes(busqueda) ||
                        e.apellido.toLowerCase().includes(busqueda) ||
                        e.rut.includes(busqueda)
                      );
                    })
                    .map(empleado => (
                      <label
                        key={empleado.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={empleadosSeleccionados.includes(empleado.id)}
                          onChange={() => toggleEmpleado(empleado.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{empleado.nombre} {empleado.apellido}</p>
                          <p className="text-xs text-gray-600">{empleado.rut} - {empleado.tipo_contrato}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de los QR
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={240}>4 horas</option>
                <option value={1440}>24 horas</option>
              </select>
            </div>

            {/* Resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Se generarán {cantidadAGenerar} códigos QR</strong> con duración de {duracion} minutos cada uno.
              </p>
            </div>

            {/* Botón Generar */}
            <button
              onClick={generarQRMasivo}
              disabled={generando || (modo === 'seleccionados' && empleadosSeleccionados.length === 0)}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 font-semibold"
            >
              {generando ? 'Generando...' : `Generar ${cantidadAGenerar} QR`}
            </button>
          </div>
        ) : (

          /* RESULTADO */
          <div className="p-6 space-y-6">

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Generación Exitosa</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Total empleados:</strong> {resultado.total_empleados}</p>
                <p><strong>QR generados:</strong> {resultado.qr_generados}</p>
                {resultado.qr_fallidos > 0 && (
                  <p className="text-red-600"><strong>Fallidos:</strong> {resultado.qr_fallidos}</p>
                )}
                <p><strong>Expiración:</strong> {new Date(resultado.expira).toLocaleString('es-CL')}</p>
              </div>
            </div>

            <button
              onClick={descargarTodosZIP}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Descargar Todos los QR (ZIP)
            </button>

            <div>
              <h4 className="font-semibold mb-2 text-sm">QR Generados:</h4>
              <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                {resultado.qr_data.map((qr, index) => (
                  <div key={index} className="p-3 border-b last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 text-xs">
                        <p className="font-medium">{qr.nombre}</p>
                        <p className="text-gray-600">{qr.rut} - {qr.tipo_contrato}</p>

                        {/* TOKEN */}
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(qr.token);
                              alert(`Token copiado: ${qr.nombre}`);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                            title={`Token completo: ${qr.token}`}
                          >
                            📋 Copiar Token
                          </button>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Para enviar al empleado por WhatsApp/Email
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
