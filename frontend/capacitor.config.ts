import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ucvmatch.app',
  appName: 'UCV Match',
  webDir: 'dist',
  server: {
    // === MODO PRODUCCIÓN ===
    // Apunta a la URL de Vercel desplegada.
    // La app cargará la web desde el servidor remoto.
    url: 'https://ucv-match.vercel.app',

    // === MODO DESARROLLO LOCAL (descomentar para pruebas) ===
    // Usa tu IP local para desarrollo con hot-reload.
    // Reemplaza <TU_IP> con tu dirección IP (ej: 192.168.1.100)
    // url: 'http://<TU_IP>:5173',

    // Permite la navegación a URLs externas dentro de la app
    allowNavigation: [
      'ucv-match.vercel.app',
      '*.supabase.co',
      '*.supabase.in',
    ],
  },
  android: {
    // Permite contenido mixto (HTTP y HTTPS) si es necesario
    allowMixedContent: true,
    // Color de la barra de estado
    backgroundColor: '#1a1a2e',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#e94560',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
  },
};

export default config;
