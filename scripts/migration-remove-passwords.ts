#!/usr/bin/env node

/**
 * [SECURITY] SCRIPT DE MIGRACIÓN DE SEGURIDAD
 *
 * Este script elimina el campo 'password' de todos los documentos de usuarios en Firestore.
 * IMPORTANTE: Ejecutar una sola vez después de actualizar el código.
 *
 * Uso:
 *   npx ts-node scripts/migration-remove-passwords.ts
 */

import * as dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import {
    collection,
    deleteField,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
} from "firebase/firestore";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removePasswordsFromUsers() {
  try {
    console.log("\n[SECURITY] INICIANDO MIGRACIÓN DE SEGURIDAD");
    console.log(
      '[MIGRATION] Eliminando campo "password" de todos los usuarios...\n',
    );

    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, "users"));

    if (usersSnapshot.empty) {
      console.log("❌ No hay usuarios en el sistema");
      return;
    }

    console.log(
      `[INFO] Total de usuarios encontrados: ${usersSnapshot.size}\n`,
    );

    let processed = 0;
    let updated = 0;
    let errors = 0;

    for (const userDoc of usersSnapshot.docs) {
      processed++;
      const userData = userDoc.data();

      // Verificar si el usuario tiene el campo password
      if (userData.password !== undefined) {
        try {
          // Eliminar el campo password
          await updateDoc(doc(db, "users", userDoc.id), {
            password: deleteField(),
          });

          updated++;
          console.log(
            `[SUCCESS] [${processed}/${usersSnapshot.size}] Usuario ${userData.email}: password eliminado`,
          );
        } catch (error) {
          errors++;
          console.error(
            `[ERROR] [${processed}/${usersSnapshot.size}] Error en ${userData.email}:`,
            error,
          );
        }
      } else {
        console.log(
          `[INFO] [${processed}/${usersSnapshot.size}] Usuario ${userData.email}: sin campo password`,
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("[INFO] RESUMEN DE MIGRACIÓN:");
    console.log("=".repeat(60));
    console.log(`[SUCCESS] Usuarios procesados: ${processed}`);
    console.log(`[SECURITY] Passwords eliminados: ${updated}`);
    console.log(`[ERROR] Errores: ${errors}`);
    console.log("=".repeat(60) + "\n");

    if (updated > 0) {
      console.log("[SUCCESS] MIGRACIÓN COMPLETADA EXITOSAMENTE");
      console.log(
        "[WARNING] Las contraseñas aún están seguras en Firebase Authentication",
      );
      console.log("[INFO] Actualiza las reglas de Firestore si es necesario\n");
    } else {
      console.log("[INFO] No se encontraron passwords para eliminar\n");
    }
  } catch (error) {
    console.error("\n[ERROR] ERROR CRÍTICO EN MIGRACIÓN:", error);
    console.error("⚠️  Verifica:\n");
    console.error("   1. Credenciales de Firebase en .env");
    console.error("   2. Permisos en Firestore Rules");
    console.error("   3. Conexión a internet\n");
  }
}

// Ejecutar migración
removePasswordsFromUsers();
