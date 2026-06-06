import React from 'react';
import TaskCard from '../components/TaskCard';

export default function TodayPage({ tasks, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick, isAdmin }) {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayDateString();

  const overdueTasks = tasks.filter(t => !t.archived && t.dueDate && t.dueDate < todayStr && t.status !== 'done');
  const todayTasks = tasks.filter(t => !t.archived && t.dueDate === todayStr);
  const doingTasks = tasks.filter(t => !t.archived && t.status === 'doing');
  const highPriorityTasks = tasks.filter(t => !t.archived && t.priority === 'high');

  const renderSection = (title, taskList, emptyMessage) => {
    return (
      <div className="today-section">
        <h3 className="today-section-title">
          <span>{title}</span>
          <span style={{ 
            fontSize: '0.8rem', 
            backgroundColor: 'var(--border-color)', 
            color: 'var(--text-muted)', 
            padding: '0.1rem 0.5rem', 
            borderRadius: '999px', 
            fontWeight: 600,
            marginLeft: '0.5rem'
          }}>
            {taskList.length}
          </span>
        </h3>
        {taskList.length > 0 ? (
          <div className="today-grid">
            {taskList.map(task => (
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
          <p className="empty-state">{emptyMessage}</p>
        )}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      <div className="today-sections">
        {renderSection('Tareas Vencidas', overdueTasks, 'No hay tareas vencidas pendientes. ¡Excelente!')}
        {renderSection('Tareas para Hoy', todayTasks, 'No hay tareas programadas para hoy.')}
        {renderSection('Tareas en Proceso', doingTasks, 'No tienes tareas marcadas en proceso.')}
        {renderSection('Tareas de Alta Prioridad', highPriorityTasks, 'No hay tareas de alta prioridad pendientes.')}
      </div>
    </div>
  );
}
