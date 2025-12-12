import {
  IonContent, IonPage, IonButton, IonIcon, IonText,
  IonCard, IonCardContent, IonHeader, IonToolbar, IonTitle,
  IonSelect, IonSelectOption, IonItem, IonLabel
} from '@ionic/react';
import { qrCodeOutline, logOutOutline, personCircleOutline, locationOutline, giftOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiService from '../services/api';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);
  const [sucursal, setSucursal] = useState<string>('Cargando...');
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [tipoBeneficio, setTipoBeneficio] = useState<string>('caja_bimensual');

  // Cargar datos al montar
  useEffect(() => {
    const userData = localStorage.getItem('guardia_user');
    if (!userData) {
      history.replace('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.sucursal_id) cargarSucursal(parsedUser.sucursal_id);

    const beneficioGuardado = localStorage.getItem('tipo_beneficio');
    if (beneficioGuardado) setTipoBeneficio(beneficioGuardado);
  }, [history]);

  // Recargar estadísticas automáticamente cada 15 segundos
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      cargarEstadisticas(user.id);
    }, 15000); // 15 segundos

    // Recargar inmediatamente al entrar
    cargarEstadisticas(user.id);

    return () => clearInterval(interval);
  }, [user]);

  const cargarSucursal = async (sucursalId: number) => {
    try {
      const response = await apiService.getSucursales();
      const sucursalData = response.find((s: any) => s.id === sucursalId);
      if (sucursalData) setSucursal(sucursalData.nombre);
    } catch (err) {
      console.error('Error cargando sucursal:', err);
      setSucursal('No disponible');
    }
  };

  const cargarEstadisticas = async (usuarioId: number) => {
    try {
      const stats = await apiService.getEstadisticasGuardia(usuarioId);
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleTipoBeneficioChange = (value: string) => {
    setTipoBeneficio(value);
    localStorage.setItem('tipo_beneficio', value);
  };

  const handleLogout = () => {
    localStorage.removeItem('guardia_token');
    localStorage.removeItem('guardia_user');
    localStorage.removeItem('tipo_beneficio');
    history.replace('/login');
  };

  const handleScanner = () => {
    history.push('/scanner');
  };

  if (!user) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>ClipControl - Guardia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-content">
        <div className="home-container">

          {/* Info Usuario */}
          <IonCard className="user-card">
            <IonCardContent>
              <div className="user-info">
                <IonIcon icon={personCircleOutline} className="user-icon" />
                <div>
                  <h2>{user.nombre_completo}</h2>
                  <p className="user-role">{user.rol.toUpperCase()}</p>
                </div>
              </div>
              <div className="sucursal-info">
                <IonIcon icon={locationOutline} />
                <span>Sucursal: <strong>{sucursal}</strong></span>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Estadísticas del Guardia */}
          {estadisticas && (
            <IonCard className="stats-card">
              <IonCardContent>
                <h3 className="stats-title">📊 Mis Entregas de Hoy</h3>

                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value total">{estadisticas.total_hoy}</span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Planta</span>
                    <span className="stat-value planta">{estadisticas.planta}</span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Plazo Fijo</span>
                    <span className="stat-value plazo">{estadisticas.plazo_fijo}</span>
                  </div>
                </div>

                {estadisticas.ultima_entrega && (
                  <div className="ultima-entrega">
                    <IonIcon icon={timeOutline} />
                    <span>
                      Última entrega: Hace {Math.abs(estadisticas.ultima_entrega.minutos_atras)} min
                    </span>
                  </div>
                )}

                {estadisticas.total_hoy === 0 && (
                  <p className="sin-entregas">Aún no hay entregas registradas hoy</p>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Selector Tipo de Beneficio */}
          <IonCard className="beneficio-card">
            <IonCardContent>
              <IonItem lines="none">
                <IonIcon icon={giftOutline} slot="start" color="primary" />
                <IonLabel>Tipo de Beneficio</IonLabel>
              </IonItem>

              <IonSelect
                value={tipoBeneficio}
                placeholder="Selecciona tipo de beneficio"
                onIonChange={(e) => handleTipoBeneficioChange(e.detail.value)}
                interface="action-sheet"
              >
                <IonSelectOption value="caja_bimensual">📦 Caja Bimensual</IonSelectOption>
                <IonSelectOption value="cajas_navidad">🎁 Cajas Navidad 2025</IonSelectOption>
                <IonSelectOption value="fiestas_patrias">🎉 Beneficio Fiestas Patrias</IonSelectOption>
                <IonSelectOption value="fin_año">🎄 Regalo Fin de Año</IonSelectOption>
                <IonSelectOption value="general">📋 Beneficio General</IonSelectOption>
              </IonSelect>
            </IonCardContent>
          </IonCard>

          {/* Botón Principal - Escanear */}
          <div className="scanner-section">
            <IonButton
              expand="block"
              size="large"
              onClick={handleScanner}
              className="scan-button"
            >
              <IonIcon icon={qrCodeOutline} slot="start" />
              Escanear QR
            </IonButton>
            <IonText color="medium">
              <p className="scan-instruction">
                Escanea el código QR del empleado para registrar la entrega del beneficio
              </p>
            </IonText>
          </div>

          {/* Instrucciones */}
          <IonCard className="instructions-card">
            <IonCardContent>
              <h3>Instrucciones:</h3>
              <ol>
                <li>Selecciona el tipo de beneficio</li>
                <li>Solicita el QR al empleado</li>
                <li>Escanea el código</li>
                <li>Verifica los datos</li>
                <li>Captura foto del empleado</li>
                <li>Confirma la entrega</li>
              </ol>
            </IonCardContent>
          </IonCard>

          {/* Botón Cerrar Sesión */}
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={handleLogout}
            className="logout-button"
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Cerrar Sesión
          </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
