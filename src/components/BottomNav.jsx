import React from 'react';
import { Calendar, LayoutGrid, ListTodo, Menu, Plus } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, onNewTaskClick }) {
  const tabs = [
    { id: 'today', name: 'Hoy', icon: Calendar },
    { id: 'board', name: 'Tablero', icon: LayoutGrid },
    { id: 'all', name: 'Todas', icon: ListTodo },
    { id: 'menu', name: 'Menú', icon: Menu }
  ];

  return (
    <>
      <button className="fab-button" onClick={onNewTaskClick} aria-label="Nueva Tarea">
        <Plus size={24} />
      </button>

      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Highlight menu tab if we are in "done" or "members" views on mobile
          const isActive = currentTab === tab.id || 
            (tab.id === 'menu' && (currentTab === 'done' || currentTab === 'members'));
          
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
