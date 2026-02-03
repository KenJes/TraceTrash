// firebaseConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
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

// Verificar que las credenciales estén cargadas
if (!firebaseConfig.apiKey) {
  console.error(
    "[ERROR] FIREBASE_CONFIG: Las variables de entorno no están configuradas",
  );
  console.error(
    "Por favor, asegúrate de que el archivo .env existe y tiene las credenciales de Firebase",
  );
}

console.log("[INFO] Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "OK" : "MISSING",
  authDomain: firebaseConfig.authDomain ? "OK" : "MISSING",
  projectId: firebaseConfig.projectId ? "OK" : "MISSING",
  storageBucket: firebaseConfig.storageBucket ? "OK" : "MISSING",
  messagingSenderId: firebaseConfig.messagingSenderId ? "OK" : "MISSING",
  appId: firebaseConfig.appId ? "OK" : "MISSING",
});

// Inicializar Firebase solo si no existe ya
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

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
// export const storage = getStorage(app); // Comentado: requiere plan Blaze
