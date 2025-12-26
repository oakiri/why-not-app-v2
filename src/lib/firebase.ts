import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJVclMKWZMI9vLJUyxPKJVdD1r_NCxa_Y",
  authDomain: "why-not-app-v2.firebaseapp.com",
  projectId: "why-not-app-v2",
  storageBucket: "why-not-app-v2.firebasestorage.app",
  messagingSenderId: "62426939092",
  appId: "1:62426939092:web:c22e840f206e2b49520541",
  measurementId: "G-KCEZYL85N3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // If Auth was already initialized (fast refresh), fall back
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { app, auth, db };
