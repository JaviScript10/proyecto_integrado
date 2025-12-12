import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonTextarea,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/react';
import { cameraOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import apiService from '../services/api';
import './Scanner.css';

const Scanner: React.FC = () => {
  const history = useHistory();
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [empleado, setEmpleado] = useState<any>(null);
  const [error, setError] = useState('');
  const [foto, setFoto] = useState('');
  const [capturandoFoto, setCapturandoFoto] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [user, setUser] = useState<any>(null);

  // Input manual
  const [mostrarInputManual, setMostrarInputManual] = useState(false);
  const [tokenManual, setTokenManual] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('guardia_user');
    if (!userData) {
      history.replace('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [history]);

  const startScan = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        setError('Permiso de cámara denegado. Ve a Configuración → Apps → clipcontrol-app → Permisos → Cámara');
        return;
      }

      document.body.classList.add('scanner-active');
      setScanning(true);
      setError('');

      BarcodeScanner.prepare();
      const result = await BarcodeScanner.startScan();

      document.body.classList.remove('scanner-active');
      setScanning(false);

      if (result.hasContent) {
        await validateQR(result.content);
      }
    } catch (err: any) {
      console.error('Error en scanner:', err);
      setError('Error al abrir cámara: ' + err.message);
      setScanning(false);
      document.body.classList.remove('scanner-active');
    }
  };

  const stopScan = () => {
    BarcodeScanner.stopScan();
    document.body.classList.remove('scanner-active');
    setScanning(false);
  };

  const validateQR = async (qrContent: string) => {
    setValidating(true);
    setError('');

    try {
      const parts = qrContent.split(':');
      if (parts.length !== 3 || parts[0] !== 'CLIPCONTROL') {
        throw new Error('QR inválido. No es un código ClipControl.');
      }

      const token = parts[1];
      const periodoData = await apiService.getPeriodoActivo();
      const periodo_id = periodoData.id;

      const response = await apiService.validarQR(token, periodo_id);

      if (response.valido) {
        setQrData({
          token: token,
          token_id: response.token_id,
          periodo_id: periodo_id
        });
        setEmpleado(response.empleado);
      } else {
        setError(response.mensaje || 'QR no válido');
      }
    } catch (err: any) {
      console.error('❌ Error validando QR:', err);
      setError(err.response?.data?.detail || err.message || 'Error al validar QR');
    } finally {
      setValidating(false);
    }
  };

  const capturarFoto = async () => {
    try {
      setCapturandoFoto(true);

      const image = await Camera.getPhoto({
        quality: 30,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 800,
        height: 1200
      });

      if (image.base64String) {
        const fotoCompleta = `data:image/jpeg;base64,${image.base64String}`;
        setFoto(fotoCompleta);
      }
    } catch (err: any) {
      console.error('Error capturando foto:', err);
      setError('Error al capturar foto');
    } finally {
      setCapturandoFoto(false);
    }
  };

  const registrarEntrega = async () => {
    if (!foto) {
      setError('Debes capturar una foto del empleado');
      return;
    }

    if (!qrData || !qrData.token_id || !qrData.periodo_id) {
      setError('Error: Datos del QR incompletos');
      return;
    }

    if (!empleado || !empleado.id) {
      setError('Error: No hay información del empleado');
      return;
    }

    if (!user || !user.id) {
      setError('Error: No hay información de usuario');
      return;
    }

    setRegistrando(true);
    setError('');

    try {
      const data = {
        qr_token_id: qrData.token_id,
        empleado_id: empleado.id,
        usuario_id: user.id,
        periodo_id: qrData.periodo_id,
        foto_base64: foto,
        observaciones: observaciones || ''
      };

      const response = await apiService.registrarEntrega(data);
      history.push('/confirmacion', { empleado, success: true });
    } catch (err: any) {
      console.error('❌ Error registrando entrega:', err);
      setError(err.response?.data?.detail || err.message || 'Error al registrar entrega');
    } finally {
      setRegistrando(false);
    }
  };

  const resetScanner = () => {
    setQrData(null);
    setEmpleado(null);
    setFoto('');
    setError('');
    setObservaciones('');
  };

  // Validar token manual
  const validarTokenManual = async () => {
    if (!tokenManual.trim()) {
      setError('Por favor ingresa un token');
      return;
    }
    setMostrarInputManual(false);
    await validateQR(`CLIPCONTROL:${tokenManual.trim()}:0`);
    setTokenManual('');
  };

  const cancelarInputManual = () => {
    setMostrarInputManual(false);
    setTokenManual('');
    setError('');
  };

  if (!user) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Escanear QR</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="scanner-content">
        <div className="scanner-container">

          {/* Estado: Listo para escanear */}
          {!scanning && !validating && !empleado && (
            <div className="ready-state">
              <IonCard>
                <IonCardContent className="text-center">
                  <IonIcon icon={cameraOutline} className="big-icon" />
                  <h2>Escanear Código QR</h2>
                  <p>Presiona el botón para activar la cámara y escanear el QR del empleado</p>
                  {error && (
                    <div className="error-message">
                      <IonText color="danger">{error}</IonText>
                    </div>
                  )}
                  <IonButton expand="block" size="large" onClick={startScan}>
                    <IonIcon icon={cameraOutline} slot="start" />
                    Activar Cámara
                  </IonButton>

                  {/* Botón Input Manual */}
                  <div style={{ marginTop: '16px' }}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setMostrarInputManual(true)}
                    >
                      ⌨️ Ingresar código manualmente
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {/* Estado: Escaneando */}
          {scanning && (
            <div className="scanning-state">
              <div className="scan-frame">
                <div className="scan-corners"></div>
                <p className="scan-instruction">Apunta al código QR</p>
              </div>
              <IonButton expand="block" color="danger" onClick={stopScan}>
                Cancelar
              </IonButton>
            </div>
          )}

          {/* Estado: Validando */}
          {validating && (
            <div className="validating-state">
              <IonCard>
                <IonCardContent className="text-center">
                  <IonSpinner name="crescent" className="big-spinner" />
                  <h3>Validando QR...</h3>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {/* Estado: QR Válido - Mostrar empleado y capturar foto */}
          {empleado && !registrando && (
            <div className="employee-state">
              <IonCard className="employee-card">
                <IonCardContent>
                  <div className="success-header">
                    <IonIcon icon={checkmarkCircleOutline} color="success" className="success-icon" />
                    <h2>QR Válido</h2>
                  </div>
                  <div className="employee-info">
                    <p><strong>RUT:</strong> {empleado.rut}</p>
                    <p><strong>Nombre:</strong> {empleado.nombre_completo}</p>
                    <p><strong>Tipo:</strong> {empleado.tipo_contrato}</p>
                    <p><strong>Caja:</strong> {empleado.tipo_caja}</p>
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Captura de Foto */}
              <IonCard>
                <IonCardContent>
                  <h3>Foto del Empleado</h3>
                  {!foto ? (
                    <IonButton expand="block" onClick={capturarFoto} disabled={capturandoFoto}>
                      {capturandoFoto ? (
                        <>
                          <IonSpinner name="crescent" />
                          <span style={{ marginLeft: '10px' }}>Capturando...</span>
                        </>
                      ) : (
                        <>
                          <IonIcon icon={cameraOutline} slot="start" />
                          Capturar Foto
                        </>
                      )}
                    </IonButton>
                  ) : (
                    <div className="photo-preview">
                      <img src={foto} alt="Foto empleado" />
                      <IonButton expand="block" fill="outline" size="small" onClick={() => setFoto('')}>
                        Tomar otra foto
                      </IonButton>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>

              {/* Observaciones */}
              <IonCard>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Observaciones (opcional)</IonLabel>
                    <IonTextarea
                      value={observaciones}
                      onIonInput={(e: any) => setObservaciones(e.target.value)}
                      placeholder="Agregar observaciones..."
                      rows={3}
                    />
                  </IonItem>
                </IonCardContent>
              </IonCard>

              {error && (
                <div className="error-message">
                  <IonText color="danger">{error}</IonText>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="action-buttons">
                <IonButton expand="block" color="success" size="large" onClick={registrarEntrega} disabled={!foto || registrando}>
                  {registrando ? (
                    <>
                      <IonSpinner name="crescent" />
                      <span style={{ marginLeft: '10px' }}>Registrando...</span>
                    </>
                  ) : 'Confirmar Entrega'}
                </IonButton>
                <IonButton expand="block" color="medium" fill="outline" onClick={resetScanner}>
                  Cancelar
                </IonButton>
              </div>
            </div>
          )}

          {/* Modal Input Manual */}
          {mostrarInputManual && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}>
              <IonCard style={{ width: '90%', maxWidth: '400px' }}>
                <IonCardContent>
                  <h2>Ingresar Token Manual</h2>
                  <p style={{ color: 'var(--ion-color-medium)' }}>Ingresa el código del token QR</p>

                  <IonItem lines="none" style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Token:</IonLabel>
                    <IonInput
                      value={tokenManual}
                      onIonInput={(e: any) => setTokenManual(e.target.value)}
                      placeholder="Ej: abc123xyz456"
                      type="text"
                      style={{ border: '1px solid var(--ion-color-light)', padding: '8px', borderRadius: '4px' }}
                    />
                  </IonItem>

                  {error && (
                    <IonText color="danger">
                      <p style={{ fontSize: '14px', marginTop: '8px' }}>{error}</p>
                    </IonText>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                    <IonButton expand="block" onClick={validarTokenManual} style={{ flex: 1 }}>Validar</IonButton>
                    <IonButton expand="block" fill="outline" color="medium" onClick={cancelarInputManual} style={{ flex: 1 }}>Cancelar</IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Scanner;
