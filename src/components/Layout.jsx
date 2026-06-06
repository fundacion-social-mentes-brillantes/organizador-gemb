import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MemberAvatar from './MemberAvatar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ currentTab, setCurrentTab, onNewTaskClick, children }) {
  const { memberProfile, logout } = useAuth();

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'today': return 'Tareas de Hoy';
      case 'board': return 'Tablero';
      case 'all': return 'Todas las Tareas';
      case 'done': return 'Tareas Hechas / Archivadas';
      case 'members': return 'Administrar Miembros';
      case 'menu': return 'Menú de Opciones';
      default: return 'Organizador GEMB';
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onNewTaskClick={onNewTaskClick}
        memberProfile={memberProfile}
        onLogout={logout}
      />
      
      <div className="main-content">
        <header className="top-header">
          <div className="header-title-container">
            <h1>{getHeaderTitle()}</h1>
          </div>
          <div className="header-actions">
            {memberProfile && (
              <div className="user-profile-badge">
                <div className="user-profile-info">
                  <span className="user-name">{memberProfile.displayName}</span>
                  <span className="user-role">{memberProfile.role === 'admin' ? 'Administrador' : 'Miembro'}</span>
                </div>
                <MemberAvatar member={memberProfile} size={32} />
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      <BottomNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onNewTaskClick={onNewTaskClick}
      />
    </div>
  );
}
