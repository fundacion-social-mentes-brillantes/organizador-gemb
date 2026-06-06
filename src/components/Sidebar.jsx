import React from 'react';
import { 
  Calendar, 
  LayoutGrid, 
  ListTodo, 
  CheckCircle2, 
  Users, 
  Plus, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onNewTaskClick, memberProfile, onLogout }) {
  const isAdmin = memberProfile?.role === 'admin';

  const menuItems = [
    { id: 'today', name: 'Hoy', icon: Calendar },
    { id: 'board', name: 'Tablero', icon: LayoutGrid },
    { id: 'all', name: 'Todas', icon: ListTodo },
    { id: 'done', name: 'Hechas', icon: CheckCircle2 }
  ];

  if (isAdmin) {
    menuItems.push({ id: 'members', name: 'Miembros', icon: Users });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>GEMB Tareas</h2>
        <p>Centro simple del equipo</p>
      </div>

      <nav className="sidebar-nav">
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
        <button className="btn btn-primary" onClick={onNewTaskClick} style={{ width: '100%' }}>
          <Plus size={18} />
          <span>Nueva Tarea</span>
        </button>
        <button 
          onClick={onLogout} 
          className="nav-link" 
          style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
