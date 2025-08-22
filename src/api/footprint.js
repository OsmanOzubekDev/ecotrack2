// src/api/footprint.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../context/firebase';

export const submitFootprint = async (uid, data) => {
  try {
    const ref = doc(db, 'footprints', uid);
    await setDoc(ref, data);
    console.log("Footprint data submitted successfully.");
  } catch (error) {
    console.error("Error submitting footprint:", error);
  }
};

export const getFootprint = async (uid) => {
  try {
    const ref = doc(db, 'footprints', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching footprint:", error);
    return null;
  }
};
