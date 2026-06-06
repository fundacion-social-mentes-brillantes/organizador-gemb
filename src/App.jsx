import { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import BrandLogo from './components/BrandLogo';
import Layout from './components/Layout';
import Login from './components/Login';
import TaskModal from './components/TaskModal';
import ThemeToggle from './components/ThemeToggle';
import Unauthorized from './components/Unauthorized';
import AllTasksPage from './pages/AllTasksPage';
import BoardPage from './pages/BoardPage';
import DonePage from './pages/DonePage';
import MembersPage from './pages/MembersPage';
import TodayPage from './pages/TodayPage';
import { subscribeToTasks, createTask, updateTask, changeTaskStatus, archiveTask, unarchiveTask, deleteTask } from './services/tasksService';
import { subscribeToMembers } from './services/membersService';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="loading-spinner" />
        <span>Cargando Organizador GEMB...</span>
      </div>
    </div>
  );
}

function ConfigurationError() {
  return (
    <div className="login-container">
      <div className="login-card">
        <BrandLogo variant="full" className="login-brand-logo" />
        <div className="login-header">
          <h2>Configura Firebase</h2>
          <p>Faltan variables `VITE_FIREBASE_*` validas para iniciar la aplicacion.</p>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ memberProfile, setCurrentTab, logout }) {
  return (
    <div className="page-container mobile-menu-page">
      <div className="mobile-menu-stack">
        <div className="card mobile-profile-card">
          <BrandLogo variant="icon" className="mobile-brand-icon" />
          <div>
            <h3>{memberProfile?.displayName || 'Miembro GEMB'}</h3>
            <p>{memberProfile?.email}</p>
            <span className="badge badge-priority-low">Miembro</span>
          </div>
        </div>

        <div className="card mobile-menu-card">
          <span className="mobile-menu-label">Tema visual</span>
          <ThemeToggle />
        </div>

        <div className="card mobile-menu-card nav-card">
          <button
            onClick={() => setCurrentTab('done')}
            className="nav-link"
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
          >
            <CheckCircle2 size={18} />
            <span>Hechas y archivadas</span>
          </button>
          <button
            onClick={() => setCurrentTab('members')}
            className="nav-link"
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
          >
            <Users size={18} />
            <span>Equipo</span>
          </button>
          <button
            onClick={logout}
            className="nav-link danger-link"
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none' }}
          >
            <LogOut size={18} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, memberProfile, loading, unauthorized, configError, logout } = useAuth();

  const [currentTab, setCurrentTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);

  useEffect(() => {
    if (user && memberProfile?.active) {
      const unsubscribeTasks = subscribeToTasks(setTasks);
      const unsubscribeMembers = subscribeToMembers(setMembers);

      return () => {
        unsubscribeTasks();
        unsubscribeMembers();
      };
    }
  }, [user, memberProfile]);

  if (loading) return <LoadingScreen />;
  if (configError) return <ConfigurationError />;
  if (!user) return <Login />;
  if (unauthorized) return <Unauthorized />;

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
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleArchiveClick = async (task) => {
    try {
      await archiveTask(task.id, task.title, user);
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const handleUnarchiveClick = async (task) => {
    try {
      await unarchiveTask(task.id, task.title, user);
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  const handleDeleteClick = async (task) => {
    const confirmed = window.confirm(`Eliminar permanentemente la tarea "${task.title}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await deleteTask(task.id, task.title, user);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (modalTask) {
        await updateTask(modalTask.id, taskData, modalTask.status, user);
      } else {
        await createTask(taskData, user);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar la tarea. Revisa tu conexion.');
    }
  };

  const pageProps = {
    tasks,
    members,
    onEditClick: handleEditClick,
    onStatusChange: handleStatusChange,
    onArchiveClick: handleArchiveClick,
    onUnarchiveClick: handleUnarchiveClick,
    onDeleteClick: handleDeleteClick
  };

  const renderPage = () => {
    switch (currentTab) {
      case 'today':
        return <TodayPage {...pageProps} />;
      case 'board':
        return <BoardPage {...pageProps} />;
      case 'all':
        return <AllTasksPage {...pageProps} />;
      case 'done':
        return <DonePage {...pageProps} />;
      case 'members':
        return <MembersPage members={members} />;
      case 'menu':
        return <MobileMenu memberProfile={memberProfile} setCurrentTab={setCurrentTab} logout={logout} />;
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
