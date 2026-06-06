import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { logout, user } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card" style={{ gap: '1.5rem' }}>
        <div className="login-logo" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <ShieldAlert size={40} />
        </div>

        <div className="login-header">
          <h2>No pudimos activar tu perfil</h2>
          <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            La sesion de Google se completo, pero el perfil de equipo no quedo listo para {user?.email || 'este usuario'}.
            Cierra sesion e intenta entrar de nuevo.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
        >
          <LogOut size={18} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </div>
  );
}
