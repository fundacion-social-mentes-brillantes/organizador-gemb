import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from './activityService';

export const createTask = async (taskData, user) => {
  const taskPayload = {
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    assignedTo: taskData.assignedTo || null,
    dueDate: taskData.dueDate || null,
    tags: taskData.tags || [],
    createdBy: {
      uid: user.uid,
      name: user.displayName || 'Usuario',
      email: user.email || ''
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: taskData.status === 'done' ? Timestamp.now() : null,
    archived: false
  };

  const docRef = await addDoc(collection(db, 'tasks'), taskPayload);
  await logActivity('task_created', docRef.id, taskData.title, user);
  return docRef.id;
};

export const updateTask = async (taskId, taskData, oldStatus, user) => {
  const taskRef = doc(db, 'tasks', taskId);
  const updates = {
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status,
    priority: taskData.priority,
    assignedTo: taskData.assignedTo || null,
    dueDate: taskData.dueDate || null,
    tags: taskData.tags || [],
    updatedAt: serverTimestamp()
  };

  if (taskData.status === 'done') {
    updates.completedAt = taskData.completedAt || Timestamp.now();
  } else {
    updates.completedAt = null;
  }

  await updateDoc(taskRef, updates);
  if (taskData.status === 'done' && oldStatus !== 'done') {
    await logActivity('task_completed', taskId, taskData.title, user);
  } else {
    await logActivity('task_updated', taskId, taskData.title, user);
  }
};

export const changeTaskStatus = async (taskId, taskTitle, currentStatus, newStatus, user) => {
  const taskRef = doc(db, 'tasks', taskId);
  const updates = {
    status: newStatus,
    updatedAt: serverTimestamp()
  };

  if (newStatus === 'done') {
    updates.completedAt = Timestamp.now();
  } else {
    updates.completedAt = null;
  }

  await updateDoc(taskRef, updates);
  if (newStatus === 'done') {
    await logActivity('task_completed', taskId, taskTitle, user);
  } else {
    await logActivity('task_updated', taskId, taskTitle, user);
  }
};

export const archiveTask = async (taskId, taskTitle, user) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    archived: true,
    updatedAt: serverTimestamp()
  });
  await logActivity('task_updated', taskId, taskTitle, user);
};

export const unarchiveTask = async (taskId, taskTitle, user) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    archived: false,
    updatedAt: serverTimestamp()
  });
  await logActivity('task_updated', taskId, taskTitle, user);
};

export const deleteTask = async (taskId, taskTitle, user) => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
  await logActivity('task_deleted', taskId, taskTitle, user);
};

export const subscribeToTasks = (onUpdate) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasksList = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tasksList.push({ id: docSnap.id, ...data });
    });
    onUpdate(tasksList);
  }, (error) => {
    console.error('Error listening to tasks:', error);
  });
};
