import { useState } from 'react';
import { QrCode, Download, X, Clock, Shield } from 'lucide-react';
import QRCode from 'qrcode';

export default function ModalGenerarQR({ empleado, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duracion, setDuracion] = useState(60); // minutos

  const generarQR = async () => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:8000/api/qr/generar/${empleado.id}?duracion_minutos=${duracion}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar QR');
      }

      const data = await response.json();
      setQrData(data);

      // Generar imagen QR
      const qrString = data.qr_string;
      const qrImageUrl = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrImage(qrImageUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `QR_${empleado.rut}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generar QR</h3>
              <p className="text-sm text-gray-600">
                {empleado.nombre} {empleado.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {!qrData ? (
            <>
              {/* Configuración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración del QR (minutos)
                </label>
                <select
                  value={duracion}
                  onChange={(e) => setDuracion(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={1440}>24 horas</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  El QR expirará después de este tiempo
                </p>
              </div>

              {/* Info de seguridad */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Sistema de Seguridad</p>
                    <ul className="space-y-1 text-xs">
                      <li>✓ Token único de un solo uso</li>
                      <li>✓ Expira automáticamente</li>
                      <li>✓ No se puede clonar</li>
                      <li>✓ Requiere foto obligatoria</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón generar */}
              <button
                onClick={generarQR}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
              >
                {loading ? 'Generando...' : 'Generar QR'}
              </button>
            </>
          ) : (
            <>
              {/* QR Generado */}
              <div className="text-center">
                <div className="bg-white border-4 border-gray-200 rounded-lg p-4 inline-block">
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                {/* Info del QR */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Clock size={16} />
                    <span>Expira en {qrData.expira_en_minutos} minutos</span>
                  </div>
                  <p className="text-gray-600">
                    {new Date(qrData.qr_data.expira).toLocaleString('es-CL')}
                  </p>
                </div>

                {/* Datos del empleado */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-sm mb-2">Información</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>RUT:</strong> {qrData.qr_data.rut}</p>
                    <p><strong>Nombre:</strong> {qrData.qr_data.nombre}</p>
                    <p><strong>Tipo:</strong> {qrData.qr_data.tipo_contrato}</p>
                    <p><strong>Hash:</strong> {qrData.qr_data.hash}...</p>
                    {/* AGREGAR ESTO: */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-semibold text-gray-700 mb-2">Token del QR:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs font-mono break-all">
                          {qrData.qr_data.token}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(qrData.qr_data.token);
                            alert('Token copiado al portapapeles');
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
                          title="Copiar token"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Usa este token para ingreso manual en la app móvil
                      </p>
                    </div>
                  </div>
                </div>


                {/* Botones */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={descargarQR}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Descargar QR
                  </button>
                  <button
                    onClick={() => {
                      setQrData(null);
                      setQrImage(null);
                    }}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Generar Nuevo
                  </button>
                </div>

                {/* Advertencia */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  ⚠️ Este QR solo puede usarse una vez. Después de escanear y registrar la entrega, quedará invalidado.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}