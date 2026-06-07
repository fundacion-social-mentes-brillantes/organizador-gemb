import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import IOSInstallGuide from './IOSInstallGuide';
import IOSOpenInSafariNotice from './IOSOpenInSafariNotice';
import { getFriendlyAuthMessage } from '../utils/authErrors';
import {
  getInAppBrowserName,
  isIOS,
  isIOSSafari,
  isStandalonePWA,
  shouldBlockIOSLogin
} from '../utils/platform';

export default function Login() {
  const { loginWithGoogle, loading, authError, clearAuthError } = useAuth();
  const [error, setError] = useState(null);
  const blockedIOSLogin = shouldBlockIOSLogin();
  const showIOSInstallGuide = isIOS() && isIOSSafari() && !isStandalonePWA();
  const visibleError = error || authError;

  const handleLogin = async () => {
    setError(null);
    clearAuthError();
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getFriendlyAuthMessage(err));
      console.error('Google login failed:', err?.code || err?.name || 'unknown_error');
    }
  };

  if (blockedIOSLogin) {
    return <IOSOpenInSafariNotice browserName={getInAppBrowserName()} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <BrandLogo variant="full" className="login-brand-logo" />
        <div className="login-header">
          <h2>Organizador GEMB</h2>
          <p>Centro simple de tareas del equipo</p>
        </div>

        {visibleError && (
          <div className="form-error">
            {visibleError}
          </div>
        )}

        <button
          className="btn-google-login"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%' }}
        >
          <LogIn size={20} />
          <span>{loading ? 'Ingresando...' : 'Entrar con Google'}</span>
        </button>

        <div className="login-footer">
          <p>Tu perfil queda activo al entrar con Google</p>
        </div>

        {showIOSInstallGuide && <IOSInstallGuide />}
      </div>
    </div>
  );
}
