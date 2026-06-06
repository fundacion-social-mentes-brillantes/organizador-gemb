import { Calendar, LayoutGrid, ListTodo, Menu, Plus } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, onNewTaskClick }) {
  const tabs = [
    { id: 'today', name: 'Hoy', icon: Calendar },
    { id: 'board', name: 'Tablero', icon: LayoutGrid },
    { id: 'all', name: 'Todas', icon: ListTodo },
    { id: 'menu', name: 'Menu', icon: Menu }
  ];

  return (
    <>
      <button className="fab-button" onClick={onNewTaskClick} aria-label="Nueva tarea">
        <Plus size={24} />
      </button>

      <nav className="bottom-nav" aria-label="Navegacion principal">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id
            || (tab.id === 'menu' && (currentTab === 'done' || currentTab === 'members'));

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              style={{ border: 'none', background: 'none' }}
            >
              <Icon size={20} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
