import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg1YWaBD8Tl9IgK6FPLmIoCq2BO5RkZt4",
  authDomain: "trace-trash.firebaseapp.com",
  projectId: "trace-trash",
  storageBucket: "trace-trash.firebasestorage.app",
  messagingSenderId: "673509649230",
  appId: "1:673509649230:web:c9e9d04e99a44073be32a4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function crearRutaPrueba() {
  try {
    console.log('Iniciando sesión como admin...');
    
    // Reemplaza con las credenciales de tu cuenta admin
    const email = 'admin@trace.com'; // CAMBIAR por tu email admin
    const password = 'tu_password'; // CAMBIAR por tu password admin
    
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Autenticado exitosamente');
    
    console.log('Creando ruta de prueba...');

    const rutaData = {
      nombre: 'Ruta Abasolo - Toluca',
      calle: 'Calle Abasolo',
      colonia: 'Barrio de Cantarranas',
      direcciones: [
        'Calle Abasolo, Barrio de Cantarranas',
        'Carretera Toluca - Ciudad Altamirano (MEX 134)',
      ],
      color: '#FF9800',
      activa: false,
      usuariosCount: 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'rutas'), rutaData);
    console.log('Ruta creada con ID:', docRef.id);

    console.log('\nUsa este ID para asignar usuarios:', docRef.id);
    console.log('\nPara asignar un usuario a esta ruta:');
    console.log('1. El usuario debe registrarse en la app');
    console.log('2. En su perfil, actualiza su dirección a "Calle Abasolo"');
    console.log('3. O desde Firebase Console, actualiza el campo "rutaId" del usuario a:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error:', error);
  }
}

crearRutaPrueba().then(() => {
  console.log('\nRuta de prueba configurada exitosamente');
  process.exit(0);
});
