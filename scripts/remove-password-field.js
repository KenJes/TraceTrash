/**
 * Script para eliminar SOLO el campo 'password' de todos los usuarios
 * NO elimina usuarios, solo el campo inseguro
 */

const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json"); // Necesitas descargar este archivo

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function removePasswordField() {
  console.log("[INFO] Iniciando eliminación de campos password...\n");

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    console.log(`[INFO] Encontrados ${snapshot.size} usuarios\n`);

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.password) {
        // Solo actualizar si tiene el campo password
        batch.update(doc.ref, {
          password: admin.firestore.FieldValue.delete(),
        });
        count++;
        console.log(`[PROCESSING] ${data.email || doc.id}`);
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`\n[SUCCESS] Eliminados ${count} campos password`);
      console.log(
        "[INFO] Los usuarios siguen existiendo y pueden iniciar sesión normalmente",
      );
    } else {
      console.log("[INFO] No se encontraron campos password para eliminar");
    }

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Error al eliminar campos:", error);
    process.exit(1);
  }
}

removePasswordField();
