import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import MemberAvatar from '../components/MemberAvatar';
import { updateMemberStatus, updateMemberRole } from '../services/membersService';

export default function MembersPage({ members }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activityList = [];
      snapshot.forEach((doc) => {
        activityList.push({ id: doc.id, ...doc.data() });
      });
      setActivities(activityList);
    }, (error) => {
      console.error('Error listening to activity log:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (uid, activeStr) => {
    const active = activeStr === 'true';
    try {
      await updateMemberStatus(uid, active);
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Error al actualizar el estado del miembro.');
    }
  };

  const handleRoleChange = async (uid, role) => {
    try {
      await updateMemberRole(uid, role);
    } catch (e) {
      console.error('Error updating role:', e);
      alert('Error al actualizar el rol del miembro.');
    }
  };

  const getActivityText = (activity) => {
    const userName = activity.user?.name || 'Un usuario';
    const title = activity.taskTitle || 'tarea';
    switch (activity.type) {
      case 'task_created': return `${userName} creó la tarea: "${title}"`;
      case 'task_updated': return `${userName} actualizó la tarea: "${title}"`;
      case 'task_completed': return `${userName} completó la tarea: "${title}"`;
      case 'task_deleted': return `${userName} eliminó la tarea: "${title}"`;
      default: return `${userName} realizó una acción en la tarea "${title}"`;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Listado de Miembros */}
        <section className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', marginBottom: '1.25rem', color: 'var(--primary)', fontWeight: 700 }}>
            Listado de Miembros
          </h3>
          <div className="members-grid">
            {members.map(member => (
              <div key={member.uid} className="card member-row" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
                <div className="member-info">
                  <MemberAvatar member={member} size={40} />
                  <div className="member-name-email">
                    <span className="member-displayName">{member.displayName}</span>
                    <span className="member-email">{member.email}</span>
                  </div>
                </div>

                <div className="member-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rol:</span>
                    <select
                      className="member-select"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                    >
                      <option value="member">Miembro</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Acceso:</span>
                    <select
                      className="member-select"
                      value={String(member.active)}
                      onChange={(e) => handleStatusChange(member.uid, e.target.value)}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Registro de Auditoría */}
        <section className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', marginBottom: '1.25rem', color: 'var(--primary)', fontWeight: 700 }}>
            Actividad Reciente del Equipo
          </h3>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map(act => (
                <div key={act.id} className="activity-item">
                  <span>{getActivityText(act)}</span>
                  <span className="activity-time">{formatTime(act.createdAt)}</span>
                </div>
              ))
            ) : (
              <p className="empty-state" style={{ padding: '1.5rem' }}>No hay actividades registradas.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
