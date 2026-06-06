import TaskCard from '../components/TaskCard';

export default function TodayPage({ tasks, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick }) {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayDateString();

  const overdueTasks = tasks.filter((t) => !t.archived && t.dueDate && t.dueDate < todayStr && t.status !== 'done');
  const todayTasks = tasks.filter((t) => !t.archived && t.dueDate === todayStr);
  const doingTasks = tasks.filter((t) => !t.archived && t.status === 'doing');
  const highPriorityTasks = tasks.filter((t) => !t.archived && t.priority === 'high');

  const renderSection = (title, taskList, emptyMessage) => (
    <section className="today-section">
      <h3 className="today-section-title">
        <span>{title}</span>
        <span className="section-count">{taskList.length}</span>
      </h3>
      {taskList.length > 0 ? (
        <div className="today-grid">
          {taskList.map((task) => (
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
        <p className="empty-state">{emptyMessage}</p>
      )}
    </section>
  );

  return (
    <div className="page-container">
      <div className="today-sections">
        {renderSection('Tareas vencidas', overdueTasks, 'No hay tareas vencidas pendientes. Excelente.')}
        {renderSection('Tareas para hoy', todayTasks, 'No hay tareas programadas para hoy.')}
        {renderSection('Tareas en proceso', doingTasks, 'No hay tareas marcadas en proceso.')}
        {renderSection('Alta prioridad', highPriorityTasks, 'No hay tareas de alta prioridad pendientes.')}
      </div>
    </div>
  );
}
