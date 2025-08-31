import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Collection names
export const collections = {
  users: 'users',
  circles: 'circles',
  meetups: 'meetups',
  memberships: 'memberships',
  attendances: 'attendances',
  chats: 'chats',
  messages: 'messages',
};

// Storage paths
export const storagePaths = {
  images: 'images',
  avatars: 'avatars',
  banners: 'banners',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// Note: Firebase Auth automatically handles persistence in React Native
// The authentication state will persist across app restarts
export const auth = getAuth(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
