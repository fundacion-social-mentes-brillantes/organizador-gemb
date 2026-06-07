import { isStorageRelatedAuthError } from './platform';

export const getAuthErrorCode = (error) => error?.code || error?.name || 'unknown_error';

export const getFriendlyAuthMessage = (error) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  if (code === 'auth/ios-in-app-browser') {
    return 'En iPhone, WhatsApp y otros navegadores internos no permiten completar el inicio de sesión. Abre la app en Safari y vuelve a intentarlo.';
  }

  if (code === 'auth/popup-blocked') {
    return 'El navegador bloqueó la ventana de Google. Vamos a intentar con una pantalla segura de inicio de sesión.';
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'El inicio de sesión se cerró antes de terminar. Inténtalo de nuevo cuando estés listo.';
  }

  if (isStorageRelatedAuthError(error)) {
    return 'Este navegador bloqueó el almacenamiento que Google necesita para iniciar sesión. En iPhone, abre la app en Safari o úsala instalada en la pantalla de inicio.';
  }

  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized domain')) {
    return 'El dominio de la app todavía no está autorizado para iniciar sesión con Google. Revisa la configuración de Firebase.';
  }

  if (code === 'auth/network-request-failed') {
    return 'No se pudo conectar con Google. Revisa tu conexión e inténtalo otra vez.';
  }

  if (code === 'firebase_config_unavailable' || message.includes('firebase_config_unavailable')) {
    return 'La configuración de Firebase no está disponible. Revisa las variables de entorno del despliegue.';
  }

  return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo o abre la app directamente en Safari.';
};
