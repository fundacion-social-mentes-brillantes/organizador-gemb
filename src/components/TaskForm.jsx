import { useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assignedToUid: '',
  dueDate: '',
  tagsInput: ''
};

const buildFormFromTask = (task) => {
  if (!task) return emptyForm;

  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assignedToUid: task.assignedTo?.uid || '',
    dueDate: task.dueDate || '',
    tagsInput: task.tags ? task.tags.join(', ') : ''
  };
};

export default function TaskForm({ task, members, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => buildFormFromTask(task));
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(buildFormFromTask(task));
    setError('');
  }, [task]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('El titulo es requerido.');
      return;
    }

    let assignedTo = null;
    if (form.assignedToUid) {
      const selectedMember = members.find((m) => m.uid === form.assignedToUid);
      if (selectedMember) {
        assignedTo = {
          uid: selectedMember.uid,
          name: selectedMember.displayName || 'Miembro',
          email: selectedMember.email || '',
          photoURL: selectedMember.photoURL || ''
        };
      }
    }

    const tags = form.tagsInput
      .split(/[,;\s]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      assignedTo,
      dueDate: form.dueDate || null,
      tags
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-title">Titulo *</label>
        <input
          type="text"
          id="task-title"
          className="form-control"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Escribe el nombre de la tarea..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Descripcion</label>
        <textarea
          id="task-desc"
          className="form-control"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Detalles sobre esta tarea..."
        />
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="task-status">Estado</label>
          <select
            id="task-status"
            className="form-control"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="pending">Pendiente</option>
            <option value="doing">En proceso</option>
            <option value="done">Hecho</option>
            <option value="later">Despues</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Prioridad</label>
          <select
            id="task-priority"
            className="form-control"
            value={form.priority}
            onChange={(e) => updateField('priority', e.target.value)}
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
          value={form.assignedToUid}
          onChange={(e) => updateField('assignedToUid', e.target.value)}
        >
          <option value="">Sin asignar</option>
          {members
            .filter((m) => m.active)
            .map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-duedate">Fecha limite</label>
        <input
          type="date"
          id="task-duedate"
          className="form-control"
          value={form.dueDate}
          onChange={(e) => updateField('dueDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-tags">Etiquetas</label>
        <input
          type="text"
          id="task-tags"
          className="form-control"
          value={form.tagsInput}
          onChange={(e) => updateField('tagsInput', e.target.value)}
          placeholder="ej: diseno, desarrollo, urgente"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
