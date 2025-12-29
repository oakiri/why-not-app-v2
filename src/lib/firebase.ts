// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
// 1. Importamos initializeAuth y la persistencia para React Native
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
// 2. Necesitas instalar este paquete: npx expo install @react-native-async-storage/async-storage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDJVclMKWZMI9vLJUyxPKJVdD1r_NCxa_Y',
  authDomain: 'why-not-app-v2.firebaseapp.com',
  projectId: 'why-not-app-v2',
  storageBucket: 'why-not-app-v2.firebasestorage.app',
  messagingSenderId: '62426939092',
  appId: '1:62426939092:web:c22e840f206e2b49520541',
  measurementId: 'G-KCEZYL85N3',
};

// App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// AUTH CONFIGURADO CORRECTAMENTE
// En Web usamos getAuth estándar. En Native (Android/iOS) inicializamos con persistencia.
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}
export const auth = authInstance;

// FIRESTORE CORREGIDO
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true, // Esto es muy útil, buena elección
  ...(Platform.OS === 'web'
    ? {}
    : {
        // SOLUCIÓN DEL ERROR: Solo usamos una de las dos opciones.
        // Si tu intención es forzar long-polling para evitar problemas de conexión en Android:
        experimentalForceLongPolling: true, 
        // Eliminamos experimentalAutoDetectLongPolling para evitar el conflicto
      }),
});