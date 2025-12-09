import { IonContent, IonPage, IonButton, IonIcon, IonText, IonCard, IonCardContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { qrCodeOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('guardia_user');
    if (!userData) {
      history.replace('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('guardia_token');
    localStorage.removeItem('guardia_user');
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