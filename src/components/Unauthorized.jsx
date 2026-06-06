import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

// This screen only appears when an admin has manually suspended a user (active: false).
// By default, all new Google sign-ins are automatically active (active: true).
export default function Unauthorized() {
  const { logout, user } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card" style={{ gap: '1.5rem' }}>
        <div className="login-logo" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <ShieldAlert size={40} />
        </div>
        
        <div className="login-header">
          <h2>Cuenta Suspendida</h2>
          <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Tu cuenta <strong>({user?.email})</strong> ha sido suspendida por un administrador. 
            Comunícate con el equipo de administración de GEMB para solicitar reactivación.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
