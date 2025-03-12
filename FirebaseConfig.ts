// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

// Extract API keys from Expo Config
const extra = Constants.expoConfig?.extra ?? {};

// Firebase configuration
const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// Ensure Firebase is initialized only once
let FIREBASE_APP;
if (!FIREBASE_APP) {
  FIREBASE_APP = initializeApp(firebaseConfig);
}

// Initialize Firebase services
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP); // No duplicate auth initialization
