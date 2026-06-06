import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const logActivity = async (type, taskId, taskTitle, user) => {
  if (!user) return;
  try {
    await addDoc(collection(db, 'activity'), {
      type,
      taskId,
      taskTitle,
      user: {
        uid: user.uid,
        name: user.displayName || user.name || 'Usuario',
        email: user.email || ''
      },
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
