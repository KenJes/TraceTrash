/**
 * SCRIPT PARA REGISTRAR ADMINISTRADOR
 * 
 * Ejecutar este código en un archivo temporal o en la consola del navegador
 * en la app para crear el usuario administrador correctamente.
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseconfig';

export async function registrarAdministrador() {
  const email = 'admin@email.com';
  const password = 'admin123'; // Cambia esto a la contraseña que quieras
  const nombre = 'Administrador';

  try {
    console.log('🔐 Creando usuario administrador en Firebase Auth...');
    
    // 1. Crear en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Usuario creado en Auth:', user.uid);

    // 2. Crear documento en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      nombre: nombre,
      password: password,
      calle: 'N/A',
      numero: 'N/A',
      colonia: 'N/A',
      rol: 'admin',
      createdAt: new Date().toISOString(),
      uid: user.uid,
    });

    console.log('✅ Administrador registrado correctamente');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 UID:', user.uid);
    
    return {
      success: true,
      uid: user.uid,
      email: email,
    };
  } catch (error: any) {
    console.error('❌ Error al registrar administrador:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ El email ya existe en Firebase Auth');
      console.log('💡 Solución: Ve a Firebase Console → Authentication y elimina el usuario existente, o usa otro email');
    }
    
    throw error;
  }
}

// Para ejecutar desde la consola del navegador:
// registrarAdministrador().then(result => console.log('Resultado:', result));
