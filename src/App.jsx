import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import TaskModal from './components/TaskModal';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';

// Pages
import TodayPage from './pages/TodayPage';
import BoardPage from './pages/BoardPage';
import AllTasksPage from './pages/AllTasksPage';
import DonePage from './pages/DonePage';
import MembersPage from './pages/MembersPage';

// Services
import { subscribeToTasks, createTask, updateTask, changeTaskStatus, archiveTask, unarchiveTask, deleteTask } from './services/tasksService';
import { subscribeToMembers } from './services/membersService';

// Icons
import { Archive, Users, LogOut, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, memberProfile, loading, unauthorized, logout } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);

  // Real-time Firestore subscriptions
  useEffect(() => {
    if (user && memberProfile && memberProfile.active) {
      const unsubscribeTasks = subscribeToTasks(setTasks);
      const unsubscribeMembers = subscribeToMembers(setMembers);

      return () => {
        unsubscribeTasks();
        unsubscribeMembers();
      };
    }
  }, [user, memberProfile]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--bg-color)', 
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--border-color)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 1rem' 
          }}></div>
          <span>Cargando Organizador GEMB...</span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  const isAdmin = memberProfile?.role === 'admin';

  const handleEditClick = (task) => {
    setModalTask(task);
    setIsModalOpen(true);
  };

  const handleNewTaskClick = () => {
    setModalTask(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (taskId, taskTitle, currentStatus, newStatus) => {
    try {
      await changeTaskStatus(taskId, taskTitle, currentStatus, newStatus, user);
    } catch (e) {
      console.error('Error changing status:', e);
    }
  };

  const handleArchiveClick = async (task) => {
    try {
      await archiveTask(task.id, task.title, user);
    } catch (e) {
      console.error('Error archiving task:', e);
    }
  };

  const handleUnarchiveClick = async (task) => {
    try {
      await unarchiveTask(task.id, task.title, user);
    } catch (e) {
      console.error('Error unarchiving task:', e);
    }
  };

  const handleDeleteClick = async (task) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la tarea "${task.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteTask(task.id, task.title, user);
      } catch (e) {
        console.error('Error deleting task:', e);
      }
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (modalTask) {
        // Edit mode
        await updateTask(modalTask.id, taskData, modalTask.status, user);
      } else {
        // Create mode
        await createTask(taskData, user);
      }
    } catch (e) {
      console.error('Error saving task:', e);
      alert('Error al guardar la tarea. Revisa tu conexión.');
    }
  };

  // Render active page
  const renderPage = () => {
    switch (currentTab) {
      case 'today':
        return (
          <TodayPage 
            tasks={tasks}
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
            onArchiveClick={handleArchiveClick}
            onUnarchiveClick={handleUnarchiveClick}
            onDeleteClick={handleDeleteClick}
            isAdmin={isAdmin}
          />
        );
      case 'board':
        return (
          <BoardPage 
            tasks={tasks}
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
            onArchiveClick={handleArchiveClick}
            onUnarchiveClick={handleUnarchiveClick}
            onDeleteClick={handleDeleteClick}
            isAdmin={isAdmin}
          />
        );
      case 'all':
        return (
          <AllTasksPage 
            tasks={tasks}
            members={members}
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
            onArchiveClick={handleArchiveClick}
            onUnarchiveClick={handleUnarchiveClick}
            onDeleteClick={handleDeleteClick}
            isAdmin={isAdmin}
          />
        );
      case 'done':
        return (
          <DonePage 
            tasks={tasks}
            onEditClick={handleEditClick}
            onStatusChange={handleStatusChange}
            onArchiveClick={handleArchiveClick}
            onUnarchiveClick={handleUnarchiveClick}
            onDeleteClick={handleDeleteClick}
            isAdmin={isAdmin}
          />
        );
      case 'members':
        if (!isAdmin) return <div className="page-container"><p className="empty-state">Acceso restringido a administradores.</p></div>;
        return <MembersPage members={members} />;
      case 'menu':
        // Mobile options panel
        return (
          <div className="page-container" style={{ paddingBottom: '5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 1.5rem' }}>
                <div className="member-avatar" style={{ width: '70px', height: '70px', fontSize: '28px' }}>
                  {memberProfile?.photoURL ? (
                    <img src={memberProfile.photoURL} alt={memberProfile.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <span>{memberProfile?.displayName?.[0].toUpperCase()}</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700 }}>{memberProfile?.displayName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{memberProfile?.email}</p>
                  <span className={`badge badge-priority-${memberProfile?.role === 'admin' ? 'high' : 'low'}`} style={{ marginTop: '0.5rem' }}>
                    {memberProfile?.role === 'admin' ? 'Administrador' : 'Miembro'}
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button 
                  onClick={() => setCurrentTab('done')} 
                  className="nav-link"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Ver Hechas / Archivadas</span>
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setCurrentTab('members')} 
                    className="nav-link"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
                  >
                    <Users size={18} />
                    <span>Administrar Miembros</span>
                  </button>
                )}
                <button 
                  onClick={logout} 
                  className="nav-link" 
                  style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', border: 'none', background: 'none' }}
                >
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      onNewTaskClick={handleNewTaskClick}
    >
      {renderPage()}
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={modalTask} 
        members={members} 
        onSubmit={handleTaskSubmit} 
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
