import 'dotenv/config';

export default {
  expo: {
    name: "EcoTrack",
    slug: "ecotrack",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      // Firebase Configuration
      // IMPORTANT: Replace these values with your actual Firebase project credentials
      // You can find these in your Firebase Console: https://console.firebase.google.com/
      // Go to Project Settings > General > Your apps > SDK setup and configuration
      
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "your_firebase_api_key_here",
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "your_project_id.firebaseapp.com",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "your_project_id",
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "your_project_id.appspot.com",
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "your_messaging_sender_id",
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "your_app_id",
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#4CAF50"
        }
      ]
    ]
  }
};
