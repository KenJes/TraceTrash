// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage'; // Comentado: requiere plan Blaze

// IMPORTANTE: Reemplaza con tus credenciales de Firebase
// Ve a: https://console.firebase.google.com -> Proyecto -> Configuración
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Verificar que las credenciales estén cargadas
if (!firebaseConfig.apiKey) {
  console.error('❌ FIREBASE_CONFIG ERROR: Las variables de entorno no están configuradas');
  console.error('Por favor, asegúrate de que el archivo .env existe y tiene las credenciales de Firebase');
}

console.log('✅ Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓' : '✗',
  authDomain: firebaseConfig.authDomain ? '✓' : '✗',
  projectId: firebaseConfig.projectId ? '✓' : '✗',
  storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
  appId: firebaseConfig.appId ? '✓' : '✗',
});

const app = initializeApp(firebaseConfig);

// Default auth instance (works on web & native). We'll try to enable
// React Native AsyncStorage persistence if the package is available at runtime.
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app); // Comentado: requiere plan Blaze
