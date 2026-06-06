import React, { useState } from 'react';
import TaskCard from '../components/TaskCard';

export default function DonePage({ tasks, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick, isAdmin }) {
  const [activeSubTab, setActiveSubTab] = useState('done'); // 'done' or 'archived'

  const doneTasks = tasks.filter(t => t.status === 'done' && !t.archived);
  const archivedTasks = tasks.filter(t => t.archived);

  const displayedTasks = activeSubTab === 'done' ? doneTasks : archivedTasks;

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        marginBottom: '1.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '0.75rem' 
      }}>
        <button
          onClick={() => setActiveSubTab('done')}
          className={`btn ${activeSubTab === 'done' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            border: activeSubTab === 'done' ? 'none' : '1px solid var(--border-color)', 
            padding: '0.4rem 1rem', 
            fontSize: '0.85rem',
            background: activeSubTab === 'done' ? 'var(--primary)' : 'none',
            color: activeSubTab === 'done' ? 'var(--surface-color)' : 'var(--text-main)'
          }}
        >
          Hechas ({doneTasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('archived')}
          className={`btn ${activeSubTab === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            border: activeSubTab === 'archived' ? 'none' : '1px solid var(--border-color)', 
            padding: '0.4rem 1rem', 
            fontSize: '0.85rem',
            background: activeSubTab === 'archived' ? 'var(--primary)' : 'none',
            color: activeSubTab === 'archived' ? 'var(--surface-color)' : 'var(--text-main)'
          }}
        >
          Archivadas ({archivedTasks.length})
        </button>
      </div>

      {displayedTasks.length > 0 ? (
        <div className="tasks-list-grid">
          {displayedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEditClick={onEditClick}
              onStatusChange={onStatusChange}
              onArchiveClick={onArchiveClick}
              onUnarchiveClick={onUnarchiveClick}
              onDeleteClick={onDeleteClick}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {activeSubTab === 'done' 
            ? 'No hay tareas marcadas como hechas en el tablero.' 
            : 'No hay tareas archivadas.'}
        </div>
      )}
    </div>
  );
}
