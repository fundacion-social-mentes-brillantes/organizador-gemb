import { useState } from 'react';
import TaskCard from '../components/TaskCard';

export default function AllTasksPage({ tasks, members, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick }) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const activeTasks = tasks.filter((t) => !t.archived);

  const filteredTasks = activeTasks.filter((task) => {
    const matchesText =
      task.title.toLowerCase().includes(searchText.toLowerCase())
      || (task.description || '').toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    let matchesAssignee = true;
    if (assigneeFilter === 'unassigned') {
      matchesAssignee = !task.assignedTo;
    } else if (assigneeFilter !== 'all') {
      matchesAssignee = task.assignedTo?.uid === assigneeFilter;
    }

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesText && matchesStatus && matchesAssignee && matchesPriority;
  });

  return (
    <div className="page-container">
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar tarea..."
          className="form-control"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="doing">En proceso</option>
          <option value="done">Hecho</option>
          <option value="later">Despues</option>
        </select>

        <select
          className="form-control"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="all">Todos los responsables</option>
          <option value="unassigned">Sin asignar</option>
          {members.filter((m) => m.active).map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.displayName}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="tasks-list-grid">
          {filteredTasks.map((task) => (
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
          No se encontraron tareas con esos filtros.
        </div>
      )}
    </div>
  );
}
