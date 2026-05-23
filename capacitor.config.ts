import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android/iOS Senior Safe.
 *
 * Importante: NO usamos `server.url` apuntando a la web pública.
 * La app es un binario independiente que carga su propio bundle (dist/)
 * y abre directamente la pantalla `/native` (UI limpia de emergencia).
 *
 * La web alarmaseniorsafe.cl sigue intacta para registro/onboarding/pagos.
 */
const config: CapacitorConfig = {
  appId: 'cl.alarmaseniorsafe.app',
  appName: 'Senior Safe',
  webDir: 'dist',
  // La APK debe abrir DIRECTAMENTE la pantalla nativa de emergencia,
  // NO la landing/onboarding web. Capacitor carga este URL al arrancar
  // y nunca cae en dist/index.html (que podría contener la web antigua).
  server: {
    url: 'https://alarmaseniorsafe.cl/native?source=apk',
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0d4f5c',
  },
  ios: {
    backgroundColor: '#0d4f5c',
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0d4f5c',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#16a34a',
    },
  },
};

export default config;
