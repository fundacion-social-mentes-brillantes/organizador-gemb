export const PRODUCTION_URL = 'https://organizador-tareas-gemb.vercel.app';
export const PRODUCTION_HOST = 'organizador-tareas-gemb.vercel.app';

const readUserAgent = () => {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
};

export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = readUserAgent();
  const iOSDevice = /iPad|iPhone|iPod/i.test(ua);
  const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadDesktopMode;
};

export const isStandalonePWA = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
  return Boolean(displayModeStandalone || navigator.standalone);
};

export const getInAppBrowserName = () => {
  const ua = readUserAgent();
  const knownBrowsers = [
    { name: 'WhatsApp', pattern: /WhatsApp/i },
    { name: 'Instagram', pattern: /Instagram/i },
    { name: 'Facebook', pattern: /FBAN|FBAV|FBIOS|FB_IAB/i },
    { name: 'Messenger', pattern: /Messenger|MSGR/i },
    { name: 'Google', pattern: /GSA|GoogleApp/i },
    { name: 'Gmail', pattern: /Gmail/i },
    { name: 'TikTok', pattern: /TikTok/i },
    { name: 'LinkedIn', pattern: /LinkedInApp/i },
    { name: 'X', pattern: /Twitter|XApp/i }
  ];

  const match = knownBrowsers.find(({ pattern }) => pattern.test(ua));
  if (match) return match.name;

  const looksLikeGenericIOSWebView = isIOS()
    && /AppleWebKit/i.test(ua)
    && !/Safari/i.test(ua)
    && !isStandalonePWA();

  return looksLikeGenericIOSWebView ? 'navegador interno' : null;
};

export const isInAppBrowser = () => Boolean(getInAppBrowserName());

export const isIOSSafari = () => {
  const ua = readUserAgent();
  return isIOS()
    && /Safari/i.test(ua)
    && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
    && !isInAppBrowser();
};

export const shouldBlockIOSLogin = () => isIOS() && isInAppBrowser() && !isStandalonePWA();

export const shouldUseRedirectLogin = () => isIOS() && !shouldBlockIOSLogin();

export const isStorageRelatedAuthError = (error) => {
  const code = String(error?.code || error?.name || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return code.includes('storage')
    || message.includes('storage')
    || message.includes('sessionstorage')
    || message.includes('missing initial state')
    || message.includes('storage-partitioned');
};

export const shouldFallbackToRedirect = (error) => {
  const code = String(error?.code || '').toLowerCase();
  return [
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
    'auth/web-storage-unsupported'
  ].includes(code) || isStorageRelatedAuthError(error);
};

export const rememberRedirectStart = () => {
  try {
    window.sessionStorage?.setItem('gemb-auth-redirect-started', String(Date.now()));
  } catch {
    // Some embedded iOS browsers block sessionStorage. Firebase handles the auth state separately.
  }
};

export const clearRedirectStart = () => {
  try {
    window.sessionStorage?.removeItem('gemb-auth-redirect-started');
  } catch {
    // No-op in storage-partitioned browsers.
  }
};
