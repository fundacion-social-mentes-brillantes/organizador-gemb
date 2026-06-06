import React from 'react';
import { Calendar, Tag, User, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';
import MemberAvatar from './MemberAvatar';

export default function TaskCard({ task, onEditClick, onStatusChange, onArchiveClick, onUnarchiveClick, onDeleteClick, isAdmin }) {
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Parse due date in local timezone
    const [year, month, day] = task.dueDate.split('-');
    const dueDate = new Date(year, month - 1, day, 23, 59, 59);
    return dueDate < today;
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'doing': return 'En proceso';
      case 'done': return 'Hecho';
      case 'later': return 'Después';
      default: return status;
    }
  };

  const statusOptions = [
    { id: 'pending', label: 'Pendiente' },
    { id: 'doing', label: 'Proceso' },
    { id: 'done', label: 'Hecho' },
    { id: 'later', label: 'Después' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="card task-card">
      <div className="task-card-header">
        <span className={`badge badge-priority-${task.priority}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button 
            onClick={() => onEditClick(task)} 
            className="btn-icon" 
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Editar tarea"
          >
            <Edit2 size={12} />
          </button>
          {task.archived ? (
            <button 
              onClick={() => onUnarchiveClick(task)} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '4px' }}
              title="Desarchivar"
            >
              <RotateCcw size={12} />
            </button>
          ) : (
            <button 
              onClick={() => onArchiveClick(task)} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '4px' }}
              title="Archivar"
            >
              <Archive size={12} />
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => onDeleteClick(task)} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '4px', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
              title="Eliminar tarea (Solo Admin)"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="task-card-title">{task.title}</h4>
        {task.description && (
          <p className="task-card-desc" style={{ marginTop: '0.35rem' }}>{task.description}</p>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
          {task.tags.map((tag, idx) => (
            <span key={idx} style={{ 
              fontSize: '0.7rem', 
              backgroundColor: '#F3F4F6', 
              color: '#4B5563', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem'
            }}>
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

        <div>
          {task.assignedTo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {task.assignedTo.name.split(' ')[0]}
              </span>
              <MemberAvatar member={task.assignedTo} size={24} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.75rem' }}>Sin asignar</span>
              <div className="member-avatar" style={{ width: '24px', height: '24px', backgroundColor: '#E5E7EB', color: '#9CA3AF' }}>
                <User size={12} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="task-card-footer">
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cambiar estado:</span>
        <div className="task-card-status-btns">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onStatusChange(task.id, task.title, task.status, opt.id)}
              className={`task-card-status-btn ${task.status === opt.id ? 'active' : ''}`}
              title={`Mover a ${opt.label}`}
              style={{ border: '1px solid var(--border-color)', background: 'none' }}
            >
              {opt.id === 'pending' ? 'Pendiente' : opt.id === 'doing' ? 'Proceso' : opt.id === 'done' ? 'Hecho' : 'Después'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
