import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../context/firebase';

export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
