// src/api/profile.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../context/firebase';

export const saveUserProfile = async (uid, profileData) => {
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, profileData, { merge: true });
    console.log("User profile saved.");
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

export const getUserProfile = async (uid) => {
  try {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
};
