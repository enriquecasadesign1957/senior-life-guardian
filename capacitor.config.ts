import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.alarmaseniorsafe.app',
  appName: 'Senior Life Guardian',
  webDir: 'dist',
  server: {
    // Apunta a tu sitio publicado para que la app cargue siempre la última versión
    // (mantiene onboarding, Supabase, WhatsApp, pagos, alertas sin tocar nada).
    url: 'https://alarmaseniorsafe.cl',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0F172A',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#3B82F6',
    },
  },
};

export default config;
