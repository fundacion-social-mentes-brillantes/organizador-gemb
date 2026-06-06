import {
  Calendar,
  CheckCircle2,
  LayoutGrid,
  ListTodo,
  LogOut,
  Plus,
  Users
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ currentTab, setCurrentTab, onNewTaskClick, onLogout }) {
  const menuItems = [
    { id: 'today', name: 'Hoy', icon: Calendar },
    { id: 'board', name: 'Tablero', icon: LayoutGrid },
    { id: 'all', name: 'Todas', icon: ListTodo },
    { id: 'done', name: 'Hechas', icon: CheckCircle2 },
    { id: 'members', name: 'Equipo', icon: Users }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>GEMB Tareas</h2>
        <p>Centro simple del equipo</p>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacion principal">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
        <button className="btn btn-primary" onClick={onNewTaskClick} style={{ width: '100%' }}>
          <Plus size={18} />
          <span>Nueva tarea</span>
        </button>
        <button
          onClick={onLogout}
          className="nav-link danger-link"
          style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
        >
          <LogOut size={18} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}
