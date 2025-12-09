import { IonContent, IonPage, IonButton, IonIcon, IonText, IonCard, IonCardContent } from '@ionic/react';
import { checkmarkCircleOutline, homeOutline, qrCodeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './Confirmacion.css';

const Confirmacion: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();
  const empleado = location.state?.empleado;
  const success = location.state?.success;

  useEffect(() => {
    if (!empleado || !success) {
      history.replace('/home');
    }
  }, [empleado, success, history]);

  const handleHome = () => {
    history.replace('/home');
  };

  const handleNuevoScan = () => {
    history.replace('/scanner');
  };

  if (!empleado) return null;

  return (
    <IonPage>
      <IonContent fullscreen className="confirmacion-content">
        <div className="confirmacion-container">
          <div className="success-animation">
            <IonIcon icon={checkmarkCircleOutline} className="success-icon-big" />
          </div>

          <h1 className="success-title">¡Entrega Registrada!</h1>

          <IonCard className="empleado-confirmacion">
            <IonCardContent>
              <p className="confirmacion-label">Empleado:</p>
              <h2 className="confirmacion-nombre">{empleado.nombre_completo}</h2>
              <div className="confirmacion-details">
                <p><strong>RUT:</strong> {empleado.rut}</p>
                <p><strong>Tipo:</strong> {empleado.tipo_contrato}</p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonText color="medium">
            <p className="confirmacion-texto">
              La entrega del beneficio ha sido registrada exitosamente con foto y hora exacta.
            </p>
          </IonText>

          <div className="confirmacion-actions">
            <IonButton
              expand="block"
              size="large"
              onClick={handleNuevoScan}
              className="nuevo-scan-button"
            >
              <IonIcon icon={qrCodeOutline} slot="start" />
              Escanear Otro QR
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={handleHome}
            >
              <IonIcon icon={homeOutline} slot="start" />
              Volver al Inicio
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Confirmacion;