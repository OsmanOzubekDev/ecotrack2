import Constants from 'expo-constants';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Get Firebase configuration from Expo constants
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} = Constants.expoConfig?.extra || {};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = Constants.expoConfig?.extra?.[field];
    return !value || value === `your_${field.toLowerCase()}_here` || value.includes('your_');
  });

  if (missingFields.length > 0) {
    console.error('❌ Firebase Configuration Error:');
    console.error('Missing or invalid configuration for:', missingFields);
    console.error('Please update your app.config.js with valid Firebase credentials');
    console.error('You can find these in your Firebase Console: https://console.firebase.google.com/');
    console.error('Go to Project Settings > General > Your apps > SDK setup and configuration');
    
    // Show a more user-friendly error in development
    if (__DEV__) {
      console.warn('⚠️  This app will not work properly until Firebase is configured!');
    }
    
    return false;
  }

  return true;
};

// Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase app
let app;
let auth;
let db;

try {
  // Validate configuration before initializing
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is incomplete or invalid');
  }

  app = initializeApp(firebaseConfig);
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);

  // Connect to emulators in development if needed
  if (__DEV__) {
    // Uncomment these lines if you want to use Firebase emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📱 Project ID:', FIREBASE_PROJECT_ID);
    console.log('🔐 Auth Domain:', FIREBASE_AUTH_DOMAIN);
  }

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Create fallback objects to prevent app crashes
  if (!auth) {
    console.warn('⚠️  Creating fallback auth object');
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      sendPasswordResetEmail: () => Promise.reject(new Error('Firebase not configured')),
      signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
      createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
      signOut: () => Promise.reject(new Error('Firebase not configured')),
    };
  }
  
  if (!db) {
    console.warn('⚠️  Creating fallback db object');
    db = {
      collection: () => ({
        add: () => Promise.reject(new Error('Firebase not configured')),
        doc: () => ({
          get: () => Promise.reject(new Error('Firebase not configured')),
          set: () => Promise.reject(new Error('Firebase not configured')),
          update: () => Promise.reject(new Error('Firebase not configured')),
        }),
        where: () => ({
          get: () => Promise.reject(new Error('Firebase not configured')),
        }),
        orderBy: () => ({
          limit: () => ({
            get: () => Promise.reject(new Error('Firebase not configured')),
          }),
        }),
      }),
    };
  }
}

// Export Firebase services
export { auth, db };

// Export configuration for debugging
export const firebaseConfigDebug = {
  isConfigured: validateFirebaseConfig(),
  projectId: FIREBASE_PROJECT_ID,
  authDomain: FIREBASE_AUTH_DOMAIN,
  hasApiKey: !!FIREBASE_API_KEY && FIREBASE_API_KEY !== `your_firebase_api_key_here`,
};

