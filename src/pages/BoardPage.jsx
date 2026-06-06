import React from 'react';
import TaskCard from '../components/TaskCard';

export default function BoardPage({ tasks, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick, isAdmin }) {
  const activeTasks = tasks.filter(t => !t.archived);

  const columns = [
    { id: 'pending', title: 'Pendiente' },
    { id: 'doing', title: 'En proceso' },
    { id: 'done', title: 'Hecho' },
    { id: 'later', title: 'Después' }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '100%', paddingBottom: '5rem' }}>
      <div className="board-container">
        {columns.map((col) => {
          const colTasks = activeTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="board-column">
              <div className="board-column-header">
                <span className="board-column-title">
                  {col.title}
                </span>
                <span className="board-column-count">
                  {colTasks.length}
                </span>
              </div>
              <div className="board-column-list">
                {colTasks.length > 0 ? (
                  colTasks.map(task => (
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
                  ))
                ) : (
                  <p className="empty-state" style={{ padding: '1.5rem', fontSize: '0.8rem' }}>
                    Sin tareas
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
