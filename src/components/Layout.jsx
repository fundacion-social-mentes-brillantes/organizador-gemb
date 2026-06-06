import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import BrandLogo from './BrandLogo';
import MemberAvatar from './MemberAvatar';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Layout({ currentTab, setCurrentTab, onNewTaskClick, children }) {
  const { memberProfile, logout } = useAuth();

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'today': return 'Tareas de hoy';
      case 'board': return 'Tablero';
      case 'all': return 'Todas las tareas';
      case 'done': return 'Hechas y archivadas';
      case 'members': return 'Equipo';
      case 'menu': return 'Menu';
      default: return 'Organizador GEMB';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewTaskClick={onNewTaskClick}
        onLogout={logout}
      />

      <div className="main-content">
        <header className="top-header">
          <div className="header-title-container">
            <BrandLogo variant="icon" className="header-brand-icon" />
            <h1>{getHeaderTitle()}</h1>
          </div>
          <div className="header-actions">
            <ThemeToggle compact />
            {memberProfile && (
              <div className="user-profile-badge">
                <div className="user-profile-info">
                  <span className="user-name">{memberProfile.displayName}</span>
                  <span className="user-role">Miembro</span>
                </div>
                <MemberAvatar member={memberProfile} size={32} />
              </div>
            )}
          </div>
        </header>

        <main className="page-main">
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
