import { Calendar, Tag, User, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';
import MemberAvatar from './MemberAvatar';

export default function TaskCard({ task, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick }) {
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = task.dueDate.split('-');
    const dueDate = new Date(year, month - 1, day, 23, 59, 59);
    return dueDate < today;
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority || 'Media';
    }
  };

  const statusOptions = [
    { id: 'pending', label: 'Pendiente' },
    { id: 'doing', label: 'Proceso' },
    { id: 'done', label: 'Hecho' },
    { id: 'later', label: 'Despues' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <article className="card task-card">
      <div className="task-card-header">
        <span className={`badge badge-priority-${task.priority || 'medium'}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <div className="task-card-actions">
          <button
            onClick={() => onEditClick(task)}
            className="btn-icon task-action-btn"
            title="Editar tarea"
            aria-label="Editar tarea"
          >
            <Edit2 size={13} />
          </button>
          {task.archived ? (
            <button
              onClick={() => onUnarchiveClick(task)}
              className="btn-icon task-action-btn"
              title="Desarchivar"
              aria-label="Desarchivar tarea"
            >
              <RotateCcw size={13} />
            </button>
          ) : (
            <button
              onClick={() => onArchiveClick(task)}
              className="btn-icon task-action-btn"
              title="Archivar"
              aria-label="Archivar tarea"
            >
              <Archive size={13} />
            </button>
          )}
          <button
            onClick={() => onDeleteClick(task)}
            className="btn-icon task-action-btn danger"
            title="Eliminar tarea"
            aria-label="Eliminar tarea"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div>
        <h4 className="task-card-title">{task.title}</h4>
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="task-tag">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-meta">
        <div className={`task-card-date ${isOverdue() ? 'overdue' : ''}`}>
          <Calendar size={12} />
          <span>{task.dueDate ? formatDate(task.dueDate) : 'Sin fecha'}</span>
        </div>

        {task.assignedTo ? (
          <div className="task-assignee">
            <span>{task.assignedTo.name?.split(' ')[0] || 'Miembro'}</span>
            <MemberAvatar member={task.assignedTo} size={24} />
          </div>
        ) : (
          <div className="task-assignee muted">
            <span>Sin asignar</span>
            <div className="member-avatar task-empty-avatar">
              <User size={12} />
            </div>
          </div>
        )}
      </div>

      <div className="task-card-footer">
        <span className="task-status-label">Estado</span>
        <div className="task-card-status-btns">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onStatusChange(task.id, task.title, task.status, opt.id)}
              className={`task-card-status-btn ${task.status === opt.id ? 'active' : ''}`}
              title={`Mover a ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
