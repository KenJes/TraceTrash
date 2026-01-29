/**
 * Script para marcar una ruta como ruta por defecto
 * Ejecutar con: npx ts-node scripts/marcarRutaDefault.ts
 */

import * as dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore
} from "firebase/firestore";

// Cargar variables de entorno desde .env
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log("[CONFIG] Configuración Firebase:", {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function marcarRutaDefault() {
  try {
    // SEGURIDAD: No hardcodear credenciales
    // Para uso de desarrollo, solicitar credenciales al ejecutar
    console.log(
      "[SECURITY] Este script requiere autenticación de administrador",
    );
    console.log(
      "[WARNING] Por favor, inicia sesión como admin desde la app web",
    );
    console.log(
      "[INFO] Luego usa Firestore Console directamente para marcar la ruta",
    );
    console.log(
      "[URL] https://console.firebase.google.com/project/trace-cf294/firestore",
    );
    console.log(
      "Edita el documento de la ruta y establece esRutaDefault: true",
    );
    console.log("[INFO] Todos los nuevos usuarios serán asignados a esta ruta");
  } catch (error) {
    console.error("[ERROR] Error al marcar ruta default:", error);
  }
}

marcarRutaDefault();
