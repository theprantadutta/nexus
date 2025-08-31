import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For now, we'll use a simple memory-based persistence
// In production, you should install @react-native-async-storage/async-storage
// and use: import AsyncStorage from '@react-native-async-storage/async-storage';
const AsyncStorage = {
  getItem: async (key: string) => {
    // Simple in-memory storage for demo
    return (global as any).__NEXUS_STORAGE__?.[key] || null;
  },
  setItem: async (key: string, value: string) => {
    if (!(global as any).__NEXUS_STORAGE__) {
      (global as any).__NEXUS_STORAGE__ = {};
    }
    (global as any).__NEXUS_STORAGE__[key] = value;
  },
  removeItem: async (key: string) => {
    if ((global as any).__NEXUS_STORAGE__) {
      delete (global as any).__NEXUS_STORAGE__[key];
    }
  },
};

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

// Initialize Firebase Auth (simplified for now without AsyncStorage)
// In production, you should install @react-native-async-storage/async-storage
// and use proper persistence
export const auth = getAuth(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
