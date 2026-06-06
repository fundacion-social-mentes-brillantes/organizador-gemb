import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Activity, Mail, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import MemberAvatar from '../components/MemberAvatar';

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

  const getActivityText = (activity) => {
    const userName = activity.user?.name || 'Un miembro';
    const title = activity.taskTitle || 'tarea';

    switch (activity.type) {
      case 'task_created': return `${userName} creo la tarea "${title}"`;
      case 'task_updated': return `${userName} actualizo la tarea "${title}"`;
      case 'task_completed': return `${userName} completo la tarea "${title}"`;
      case 'task_deleted': return `${userName} elimino la tarea "${title}"`;
      default: return `${userName} hizo un cambio en "${title}"`;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container team-page">
      <section className="team-hero">
        <div>
          <span className="eyebrow">Equipo GEMB</span>
          <h2>Personas registradas</h2>
          <p>Todos los usuarios que entran con Google participan como miembros activos del mismo espacio de trabajo.</p>
        </div>
        <div className="team-stat">
          <Users size={18} />
          <strong>{members.length}</strong>
          <span>miembros</span>
        </div>
      </section>

      <section className="team-grid">
        {members.length > 0 ? (
          members.map((member) => (
            <article key={member.uid} className="card member-card">
              <MemberAvatar member={member} size={48} />
              <div className="member-card-body">
                <h3>{member.displayName || 'Miembro GEMB'}</h3>
                <p>
                  <Mail size={13} />
                  <span>{member.email}</span>
                </p>
                <span className="member-chip">Miembro activo</span>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">Aun no hay miembros registrados.</p>
        )}
      </section>

      <section className="card activity-panel">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Movimiento reciente</span>
            <h3>Actividad del equipo</h3>
          </div>
          <Activity size={18} />
        </div>

        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="activity-item">
                <span>{getActivityText(act)}</span>
                <span className="activity-time">{formatTime(act.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="empty-state compact">No hay actividades registradas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
