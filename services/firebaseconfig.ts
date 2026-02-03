// firebaseConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Reemplaza con tus credenciales de Firebase
// Ve a: https://console.firebase.google.com -> Proyecto -> Configuración
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

// Inicializar Firebase solo si no existe ya
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializar Auth con AsyncStorage persistence (solo si no existe)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Si ya está inicializado, obtener la instancia existente
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
