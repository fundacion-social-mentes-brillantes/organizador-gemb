import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Error al iniciar sesion con Google. Intentalo de nuevo.');
      console.error('Google login failed:', err?.code || err?.name || 'unknown_error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/favicon.png" alt="GEMB Logo" style={{ width: '48px', height: '48px' }} />
        </div>
        <div className="login-header">
          <h2>Organizador GEMB</h2>
          <p>Centro simple de tareas del equipo</p>
        </div>

        {error && (
          <div className="form-error">
            {error}
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
      </div>
    </div>
  );
}
