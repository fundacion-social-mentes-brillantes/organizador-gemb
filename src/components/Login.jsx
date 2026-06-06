import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      console.error(err);
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
          <div style={{ 
            color: 'var(--danger)', 
            fontSize: '0.85rem', 
            backgroundColor: 'var(--danger-bg)', 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-sm)', 
            width: '100%',
            textAlign: 'center'
          }}>
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
          <p>Acceso solo para miembros autorizados</p>
        </div>
      </div>
    </div>
  );
}
