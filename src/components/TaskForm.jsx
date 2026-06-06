import React, { useState, useEffect } from 'react';

export default function TaskForm({ task, members, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [assignedToUid, setAssignedToUid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
      setPriority(task.priority || 'medium');
      setAssignedToUid(task.assignedTo?.uid || '');
      setDueDate(task.dueDate || '');
      setTagsInput(task.tags ? task.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setAssignedToUid('');
      setDueDate('');
      setTagsInput('');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es requerido.');
      return;
    }

    // Resolve assignee
    let assignedTo = null;
    if (assignedToUid) {
      const selectedMember = members.find(m => m.uid === assignedToUid);
      if (selectedMember) {
        assignedTo = {
          uid: selectedMember.uid,
          name: selectedMember.displayName || 'Miembro',
          email: selectedMember.email || '',
          photoURL: selectedMember.photoURL || ''
        };
      }
    }

    // Process tags
    const tags = tagsInput
      .split(/[,,;\s]+/) // split by commas, semicolons or spaces
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo,
      dueDate: dueDate || null,
      tags
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', backgroundColor: 'var(--danger-bg)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-title">Título *</label>
        <input 
          type="text" 
          id="task-title"
          className="form-control" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Escribe el nombre de la tarea..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Descripción</label>
        <textarea 
          id="task-desc"
          className="form-control" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Detalles sobre esta tarea..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="task-status">Estado</label>
          <select 
            id="task-status"
            className="form-control" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pendiente</option>
            <option value="doing">En proceso</option>
            <option value="done">Hecho</option>
            <option value="later">Después</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Prioridad</label>
          <select 
            id="task-priority"
            className="form-control" 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="task-assignee">Responsable</label>
        <select 
          id="task-assignee"
          className="form-control" 
          value={assignedToUid} 
          onChange={(e) => setAssignedToUid(e.target.value)}
        >
          <option value="">Sin asignar</option>
          {members
            .filter(m => m.active) // Only show active members for assignment
            .map(m => (
              <option key={m.uid} value={m.uid}>
                {m.displayName}
              </option>
            ))
          }
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-duedate">Fecha Límite</label>
        <input 
          type="date" 
          id="task-duedate"
          className="form-control" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-tags">Etiquetas (separadas por comas o espacios)</label>
        <input 
          type="text" 
          id="task-tags"
          className="form-control" 
          value={tagsInput} 
          onChange={(e) => setTagsInput(e.target.value)} 
          placeholder="ej: diseño, desarrollo, urgente"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ border: '1px solid var(--border-color)', background: 'none' }}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
