import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonItem, IonText, IonIcon, IonSpinner } from '@ionic/react';
import { lockClosedOutline, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setError('');
  
  if (!username || !password) {
    setError('Por favor completa todos los campos');
    return;
  }

  setLoading(true);

  try {
    console.log('🔍 Intentando login...', { username, password: '***' });
    
    const response = await apiService.loginGuardia(username, password);
    
    console.log('✅ Respuesta completa:', response);
    console.log('✅ Usuario:', response.user);
    console.log('✅ Rol:', response.user?.rol);
    
    if (response.user.rol !== 'guardia' && response.user.rol !== 'GUARDIA') {
      setError('Solo guardias pueden acceder a esta aplicación');
      setLoading(false);
      return;
    }

    localStorage.setItem('guardia_token', response.access_token);
    localStorage.setItem('guardia_user', JSON.stringify(response.user));

    console.log('✅ Login exitoso, redirigiendo a home...');
    history.replace('/home');
    
  } catch (err: any) {
    console.error('❌ Error completo:', err);
    console.error('❌ Error response:', err.response);
    console.error('❌ Error data:', err.response?.data);
    console.error('❌ Error message:', err.message);
    setError(err.response?.data?.detail || err.message || 'Error al iniciar sesión');
  } finally {
    setLoading(false);
  }
};

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-header">
            <div className="logo-circle">
              <IonIcon icon={shieldCheckmarkOutline} className="logo-icon" />
            </div>
            <h1 className="app-title">ClipControl</h1>
            <p className="app-subtitle">App Guardia</p>
            <p className="company-name">Tresmontes Lucchetti S.A.</p>
          </div>

          <div className="login-form">
            {error && (
              <div className="error-alert">
                <IonText color="danger">
                  <p>{error}</p>
                </IonText>
              </div>
            )}

            <IonItem lines="none" className="input-item">
              <IonIcon icon={personOutline} slot="start" />
              <IonInput
                value={username}
                onIonInput={(e: any) => setUsername(e.target.value)}
                placeholder="Usuario"
                type="text"
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                value={password}
                onIonInput={(e: any) => setPassword(e.target.value)}
                placeholder="Contraseña"
                type="password"
                onKeyPress={(e: any) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleLogin}
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span style={{ marginLeft: '10px' }}>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </IonButton>
          </div>

          <div className="login-footer">
            <p className="footer-text">Para soporte contacta al administrador</p>
            <p className="footer-copyright">© 2025 ClipControl - CiberByte</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;