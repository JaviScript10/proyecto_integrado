import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'clipcontrol-app',
  webDir: 'dist',
  server: {
    cleartext: true,  // ← AGREGAR ESTA LÍNEA
    androidScheme: 'https'
  }
};

export default config;