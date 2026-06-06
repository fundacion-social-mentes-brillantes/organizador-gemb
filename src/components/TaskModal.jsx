import React from 'react';
import { X } from 'lucide-react';
import TaskForm from './TaskForm';

export default function TaskModal({ isOpen, onClose, task, members, onSubmit }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px', border: 'none', background: 'none' }}>
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
