import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../context/firebase';

// Test function to verify Firestore connectivity
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Test basic collection access
    const testRef = collection(db, 'carbon_scores');
    console.log('Collection reference created successfully');
    
    // Try to get all documents (without filters)
    const snapshot = await getDocs(testRef);
    console.log('Basic collection access successful, total docs:', snapshot.size);
    
    // Log all documents for debugging
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Found document:', doc.id, 'data:', data);
      console.log('Timestamp type:', typeof data.timestamp);
      console.log('Timestamp value:', data.timestamp);
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        console.log('Firestore timestamp detected');
      }
    });
    
    return { success: true, totalDocs: snapshot.size };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Simple function to get raw data without timestamp conversion
export const getRawCarbonScores = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      console.warn('No userId provided to getRawCarbonScores');
      return [];
    }

    console.log('Getting raw carbon scores for userId:', userId);
    
    const scoresRef = collection(db, 'carbon_scores');
    const q = query(
      scoresRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Raw query executed, docs count:', querySnapshot.size);
    
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Raw doc data:', doc.id, data);
      
      scores.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Raw scores:', scores);
    return scores;
  } catch (error) {
    console.error('Error in getRawCarbonScores:', error);
    return [];
  }
};

// Helper function to safely convert timestamps
const convertTimestamp = (timestamp) => {
  console.log('=== TIMESTAMP CONVERSION DEBUG ===');
  console.log('Input timestamp:', timestamp);
  console.log('Input type:', typeof timestamp);
  console.log('Input instanceof Date:', timestamp instanceof Date);
  
  if (!timestamp) {
    console.log('No timestamp provided, using current date');
    return new Date();
  }

  try {
    // If it's already a Date object
    if (timestamp instanceof Date) {
      console.log('Timestamp is already a Date object:', timestamp);
      return timestamp;
    }

    // If it's a Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      console.log('Converted Firestore timestamp to Date:', date);
      return date;
    }

    // If it's a timestamp number or string
    if (typeof timestamp === 'number' || typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        console.log('Converted timestamp to Date:', date);
        return date;
      } else {
        console.warn('Invalid timestamp value:', timestamp);
        return new Date();
      }
    }

    // If it's an object with seconds/nanoseconds (Firestore Timestamp structure)
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      const date = new Date(timestamp.seconds * 1000);
      console.log('Converted Firestore timestamp object to Date:', date);
      return date;
    }

    // If it's a Firestore Timestamp object (different structure)
    if (timestamp && typeof timestamp === 'object' && timestamp._seconds !== undefined) {
      const date = new Date(timestamp._seconds * 1000);
      console.log('Converted Firestore timestamp _seconds to Date:', date);
      return date;
    }

    console.warn('Unknown timestamp format:', timestamp);
    console.log('Timestamp keys:', Object.keys(timestamp || {}));
    return new Date();
  } catch (error) {
    console.error('Error converting timestamp:', error, timestamp);
    return new Date();
  }
};

export const getCarbonScores = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      console.warn('No userId provided to getCarbonScores');
      return [];
    }

    console.log('Starting getCarbonScores for userId:', userId);
    
    const scoresRef = collection(db, 'carbon_scores');
    console.log('Collection reference created');
    
    const q = query(
      scoresRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    console.log('Query created:', q);
    
    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed, docs count:', querySnapshot.size);
    
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Processing doc:', doc.id, 'data:', data);
      
      // Convert timestamp safely
      const timestamp = convertTimestamp(data.timestamp);
      console.log('Final timestamp for doc:', doc.id, ':', timestamp);

      // Validate score data
      const score = typeof data.score === 'number' ? data.score : 0;
      console.log('Validated score:', score);
      
      const scoreObj = {
        id: doc.id,
        userId: data.userId || userId,
        score: score,
        timestamp: timestamp,
        // Add any additional fields that might exist
        ...data
      };
      
      console.log('Created score object:', scoreObj);
      scores.push(scoreObj);
    });
    
    console.log(`Fetched ${scores.length} carbon scores for user ${userId}:`, scores);
    return scores;
  } catch (error) {
    console.error('Error in getCarbonScores:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    return [];
  }
};

export const getLatestCarbonScore = async (userId) => {
  try {
    if (!userId) {
      console.warn('No userId provided to getLatestCarbonScore');
      return null;
    }

    console.log('Starting getLatestCarbonScore for userId:', userId);
    
    const scoresRef = collection(db, 'carbon_scores');
    const q = query(
      scoresRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    console.log('Executing latest score query...');
    const querySnapshot = await getDocs(q);
    console.log('Latest score query executed, docs count:', querySnapshot.size);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      console.log('Latest score doc data:', data);
      
      // Convert timestamp safely
      const timestamp = convertTimestamp(data.timestamp);
      console.log('Final timestamp for latest score:', timestamp);

      // Validate score data
      const score = typeof data.score === 'number' ? data.score : 0;
      console.log('Validated latest score:', score);
      
      const result = {
        id: doc.id,
        userId: data.userId || userId,
        score: score,
        timestamp: timestamp,
        // Add any additional fields that might exist
        ...data
      };
      
      console.log(`Fetched latest carbon score: ${score} for user ${userId}:`, result);
      return result;
    }
    
    console.log(`No carbon scores found for user ${userId}`);
    return null;
  } catch (error) {
    console.error('Error in getLatestCarbonScore:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    return null;
  }
};
