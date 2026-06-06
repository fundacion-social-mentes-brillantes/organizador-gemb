import { useState } from 'react';
import TaskCard from '../components/TaskCard';

export default function DonePage({ tasks, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick }) {
  const [activeSubTab, setActiveSubTab] = useState('done');

  const doneTasks = tasks.filter((t) => t.status === 'done' && !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);
  const displayedTasks = activeSubTab === 'done' ? doneTasks : archivedTasks;

  return (
    <div className="page-container">
      <div className="tabs-bar">
        <button
          onClick={() => setActiveSubTab('done')}
          className={`btn ${activeSubTab === 'done' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Hechas ({doneTasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('archived')}
          className={`btn ${activeSubTab === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Archivadas ({archivedTasks.length})
        </button>
      </div>

      {displayedTasks.length > 0 ? (
        <div className="tasks-list-grid">
          {displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditClick={onEditClick}
              onStatusChange={onStatusChange}
              onArchiveClick={onArchiveClick}
              onUnarchiveClick={onUnarchiveClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {activeSubTab === 'done'
            ? 'No hay tareas marcadas como hechas.'
            : 'No hay tareas archivadas.'}
        </div>
      )}
    </div>
  );
}
