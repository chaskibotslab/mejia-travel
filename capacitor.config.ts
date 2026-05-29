import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Config — Mejía Travel
 *
 * ESTRATEGIA: como la app es Next.js full-stack (SSR + Supabase + APIs),
 * el contenedor nativo (iOS/Android) no empaqueta archivos estáticos sino
 * que carga el sitio publicado en Railway/dominio. Esto te permite:
 *   - Mantener UNA sola base de código.
 *   - Que cada deploy a Railway llegue al instante a las apps móviles.
 *   - Aún así usar plugins nativos (cámara, geolocalización, push…).
 *
 * Si quieres modo offline (assets locales), tendrías que migrar a `output: 'export'`
 * y eliminar las rutas /api → no recomendado para esta app.
 */

const config: CapacitorConfig = {
  appId: 'com.chaskibots.mejiatravel',
  appName: 'Mejía Travel',
  // webDir es obligatorio aunque usemos server.url; ponemos un build mínimo.
  webDir: 'public',
  server: {
    // URL pública de la app — cámbiala por tu dominio cuando esté listo.
    url: 'https://mejia-travel-production.up.railway.app',
    cleartext: false,
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f172a',
  },
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
