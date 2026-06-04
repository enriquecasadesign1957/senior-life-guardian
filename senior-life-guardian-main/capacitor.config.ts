import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android/iOS Senior Safe.
 *
 * Importante: Se añade allowNavigation para desbloquear el hardware del GPS
 * nativo en Android cuando la WebView carga el dominio remoto.
 */
const config: CapacitorConfig = {
  appId: 'cl.alarmaseniorsafe.app',
  appName: 'Senior Safe',
  webDir: 'dist',
  server: {
    url: 'https://alarmaseniorsafe.cl/native?source=apk',
    androidScheme: 'https',
    cleartext: false,
    // CRUCIAL: Esto le dice a Android que confíe en la web y le libere el chip de GPS
    allowNavigation: [
      "alarmaseniorsafe.cl",
      "*.alarmaseniorsafe.cl"
    ]
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
