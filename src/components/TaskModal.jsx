import { X } from 'lucide-react';
import TaskForm from './TaskForm';

export default function TaskModal({ isOpen, onClose, task, members, onSubmit }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-header">
          <h3 id="task-modal-title">{task ? 'Editar tarea' : 'Nueva tarea'}</h3>
          <button onClick={onClose} className="btn-icon modal-close" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>
        <TaskForm
          task={task}
          members={members}
          onSubmit={(data) => {
            onSubmit(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
