import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const getMember = async (uid) => {
  const docRef = doc(db, 'members', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const createMember = async (uid, memberData) => {
  const docRef = doc(db, 'members', uid);
  await setDoc(docRef, {
    uid,
    email: memberData.email,
    displayName: memberData.displayName || '',
    photoURL: memberData.photoURL || '',
    role: memberData.role || 'member',
    active: memberData.active ?? false,
    createdAt: serverTimestamp()
  });
};

export const updateMemberStatus = async (uid, active) => {
  const docRef = doc(db, 'members', uid);
  await updateDoc(docRef, { active });
};

export const updateMemberRole = async (uid, role) => {
  const docRef = doc(db, 'members', uid);
  await updateDoc(docRef, { role });
};

export const subscribeToMembers = (onUpdate) => {
  const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const membersList = [];
    snapshot.forEach((doc) => {
      membersList.push(doc.data());
    });
    onUpdate(membersList);
  }, (error) => {
    console.error('Error listening to members:', error);
  });
};
